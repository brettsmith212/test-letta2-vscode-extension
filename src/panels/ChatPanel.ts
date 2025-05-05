/**
 * ChatPanel - The main UI component for the Letta Chat VS Code extension
 * 
 * This class manages the WebView panel that displays the chat interface and handles
 * the interaction between the VS Code extension and the React-based UI. It acts as
 * the controller connecting the ChatService with the UI layer.
 * 
 * @module ChatPanel
 * @version 1.0.0
 */

import * as vscode from 'vscode';
import { ChatService } from '../services/ChatService';
import { getWebviewContent } from '../views/webview-content';
import { Message, WebviewMessage } from '../types';

export class ChatPanel {
    public static readonly viewType = 'lettaChat';
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    private _conversationHistory: Message[] = [];
    private _chatService: ChatService;
    private readonly _context: vscode.ExtensionContext;

    private static _instance: ChatPanel | undefined;

    public static getInstance(extensionUri: vscode.Uri, context: vscode.ExtensionContext): ChatPanel {
        if (!ChatPanel._instance) {
            ChatPanel._instance = new ChatPanel(extensionUri, context);
        }
        return ChatPanel._instance;
    }

    private constructor(private readonly _extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
        this._context = context;
        this._chatService = new ChatService(context);

        // Initialize with empty conversation history (removed loading from globalState)
        this._conversationHistory = [];

        this._panel = vscode.window.createWebviewPanel(
            ChatPanel.viewType,
            'Claude Chat',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(_extensionUri, 'media', 'build')
                ],
                retainContextWhenHidden: true
            }
        );

        this._panel.webview.html = getWebviewContent(this._panel.webview, this._extensionUri);

        // Handle messages from webview
        this._panel.webview.onDidReceiveMessage(
            async (message: WebviewMessage) => {
                switch (message.command) {
                    case 'sendMessage':
                        if (message.text) {
                            await this._handleSendMessage(message.text);
                        }
                        break;
                    case 'cancelMessage':
                        this._cancelCurrentMessage();
                        break;
                    case 'newThread':
                        this._startNewThread();
                        break;
                    case 'listAgents':
                        await this._handleListAgents();
                        break;
                    case 'selectAgent':
                        if (message.agentId) {
                            await this._handleSelectAgent(message.agentId);
                        }
                        break;
                    case 'createAgent':
                        if (message.agentName) {
                            await this._handleCreateAgent(message.agentName, message.model);
                        }
                        break;
                    case 'restoreHistory':
                        // Send all messages in history to webview
                        this._conversationHistory.forEach((msg, index) => {
                            let text: string;
                            if (typeof msg.content === 'string') {
                                text = msg.content;
                            } else {
                                // Convert complex content to string if needed
                                text = JSON.stringify(msg.content);
                            }
                            if (text) {
                                this._panel.webview.postMessage({
                                    command: msg.role === 'user' ? 'addUserMessage' : 'addAssistantMessage',
                                    text,
                                    messageId: index
                                });
                            }
                        });
                        break;
                }
            },
            null,
            this._disposables
        );

        this._panel.onDidDispose(
            () => {
                ChatPanel._instance = undefined;
                this.dispose();
            },
            null,
            this._disposables
        );
    }

    private async _handleSendMessage(text: string) {
        try {
            // Add user message to history
            this._conversationHistory.push({ role: 'user', content: text });

            // Post user message to UI
            this._panel.webview.postMessage({
                command: 'addUserMessage',
                text,
                messageId: this._conversationHistory.length - 1
            });

            // Generate a new messageId for the assistant response
            const messageId = this._conversationHistory.length;
            
            try {
                // Notify webview that the assistant is starting to respond
                this._panel.webview.postMessage({
                    command: 'startAssistantResponse',
                    messageId
                });
                
                // Get the AI response using the simplified ChatService
                const response = await this._chatService.sendMessage(text);
                
                // Add the response to the conversation history
                this._conversationHistory.push(response);
                
                // Send the response to the webview
                const responseText = typeof response.content === 'string' 
                    ? response.content 
                    : JSON.stringify(response.content);
                    
                this._panel.webview.postMessage({
                    command: 'addAssistantMessage',
                    text: responseText,
                    messageId: messageId
                });
            } catch (error) {
                console.error('handleSendMessage: Error:', error);
                const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your request.';
                
                this._panel.webview.postMessage({
                    command: 'error',
                    text: errorMessage
                });
            }
        } catch (error) {
            console.error('handleSendMessage outer error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your request.';
            
            this._panel.webview.postMessage({
                command: 'error',
                text: errorMessage
            });
        }
    }

    private _cancelCurrentMessage() {
        try {
            // Forward the cancellation to the ChatService
            const cancelSuccess = this._chatService.cancelCurrentStream();
            if (cancelSuccess) {
                // Remove any incomplete assistant messages from history
                const lastMessage = this._conversationHistory[this._conversationHistory.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                    this._conversationHistory.pop();
                }
                
                this._panel.webview.postMessage({
                    command: 'cancelSuccess',
                    text: 'Request cancelled by user'
                });
            }
        } catch (error) {
            console.error('Error cancelling message:', error);
        }
    }

    private _startNewThread() {
        this._conversationHistory = [];
        this._panel.webview.postMessage({
            command: 'clearChat'
        });
    }

    /**
     * Fetch the list of available agents from the service and send it to the webview
     */
    private async _handleListAgents() {
        try {
            // We need to first get access to the LettaService through ChatService
            const agentList = await this._chatService['lettaService'].listAgents();
            
            // Send the agent list to the webview
            this._panel.webview.postMessage({
                command: 'agentList',
                agents: agentList
            } as any);
        } catch (error) {
            console.error('Error fetching agent list:', error);
            this._panel.webview.postMessage({
                command: 'error',
                text: `Failed to fetch agents: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    /**
     * Handle a request to select an agent
     */
    private async _handleSelectAgent(agentId: string) {
        try {
            // Select the agent via ChatService -> LettaService
            await this._chatService['lettaService'].selectAgent(agentId);
            
            // Start a new conversation thread
            this._conversationHistory = [];
            
            // Notify the webview that the agent was selected
            this._panel.webview.postMessage({
                command: 'agentSelected',
                agentId
            });
            
            // Clear the chat UI
            this._panel.webview.postMessage({
                command: 'clearChat'
            });
        } catch (error) {
            console.error('Error selecting agent:', error);
            this._panel.webview.postMessage({
                command: 'error',
                text: `Failed to select agent: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    /**
     * Handle a request to create a new agent
     */
    private async _handleCreateAgent(name: string, model?: string) {
        try {
            // Create a new agent via ChatService -> LettaService
            const newAgent = await this._chatService['lettaService'].createAgent({ 
                name,
                model
            });
            
            // Notify the webview that the agent was created
            this._panel.webview.postMessage({
                command: 'agentCreated',
                agent: newAgent
            } as any);
            
            // Clear the chat UI since we're using a new agent
            this._panel.webview.postMessage({
                command: 'clearChat'
            });
        } catch (error) {
            console.error('Error creating agent:', error);
            this._panel.webview.postMessage({
                command: 'error',
                text: `Failed to create agent: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    public reveal() {
        this._panel.reveal();
    }

    public dispose() {
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}