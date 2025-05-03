import * as vscode from 'vscode';

// Since we don't have the actual types yet, we'll create interfaces to mock the SDK
interface LettaClientOptions {
  baseUrl: string;
}

interface CreateAgentResponse {
  agentId: string;
}

interface SendMessageResponse {
  response: string;
}

interface MessageStreamResponse {
  [Symbol.asyncIterator](): AsyncIterableIterator<any>;
}

// Mock the LettaClient until we have the actual SDK types
class LettaClient {
  constructor(options: LettaClientOptions) {}
  
  createAgent(params: any): Promise<CreateAgentResponse> {
    return Promise.resolve({ agentId: 'mock-id' });
  }
  
  sendMessage(params: any): Promise<SendMessageResponse> {
    return Promise.resolve({ response: 'mock-response' });
  }
  
  sendMessageStream(params: any): Promise<MessageStreamResponse> {
    // Implemented in tests
    return Promise.resolve({ [Symbol.asyncIterator]: async function* () {} });
  }
}

// Use the Message type from types directory instead of local definition
import { Message } from '../types';

/**
 * Service for communicating with Letta AI
 */
export class LettaService {
  private _messages: Message[] = [];
  private _client: LettaClient | null = null;
  private _agentId: string | null = null;
  private _abortController: AbortController | null = null;

  constructor() {
    this.initializeClient();
  }

  /**
   * Initialize the Letta client based on configuration
   */
  private initializeClient() {
    const serverUrl = this.getServerUrl();
    if (serverUrl) {
      try {
        this._client = new LettaClient({
          baseUrl: serverUrl
        });
        console.log('LettaClient initialized with URL:', serverUrl);
      } catch (error) {
        console.error('Failed to initialize LettaClient:', error);
        this._client = null;
      }
    } else {
      console.error('No server URL configured');
    }
  }

  /**
   * Get the configured server URL from settings
   * @returns The server URL or undefined if not configured
   */
  private getServerUrl(): string | undefined {
    // We'll implement the real config in Step 6-1, for now use a default
    // This will be overridden later when configuration is added
    return process.env.LETTA_SERVER_URL || 
           vscode.workspace.getConfiguration('lettaChat').get<string>('serverUrl') ||
           'http://localhost:8283';
  }
  
  // For testing purposes
  public static createForTesting(client: any, agentId: string = 'mock-agent-id'): LettaService {
    const service = new LettaService();
    service._client = client;
    service._agentId = agentId;
    return service;
  }

  /**
   * Initializes a Letta agent
   * @returns A promise that resolves when the agent is initialized
   */
  public async initAgent(): Promise<void> {
    if (!this._client) {
      throw new Error('Letta client not initialized');
    }

    try {
      // Create a new agent using the SDK
      const response = await this._client.createAgent({
        // Agent configuration would go here
        // For now, use default settings
        name: 'VSCodeAgent'
      });
      
      this._agentId = response.agentId;
      console.log('Agent initialized with ID:', this._agentId);
    } catch (error) {
      console.error('Failed to initialize agent:', error);
      throw new Error(`Failed to initialize Letta agent: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Sends a message to Letta AI and returns the response
   * @param message The message text to send
   * @returns A promise that resolves to the assistant's response
   */
  public async sendMessage(message: string): Promise<string> {
    if (!this._client) {
      throw new Error('Letta client not initialized');
    }

    if (!this._agentId) {
      await this.initAgent();
    }

    // Add the user message to the history
    const userMessage: Message = {
      role: 'user',
      content: typeof message === 'string' ? message : JSON.stringify(message)
    };
    this._messages.push(userMessage);

    try {
      // Send the message to the Letta API
      const response = await this._client.sendMessage({
        agentId: this._agentId!,
        message: message
      });

      // Extract and store the assistant's response
      const assistantResponse = response.response || 'No response from Letta';
      
      // Add the assistant message to the history
      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantResponse // As string, which is compatible with the Message type
      };
      this._messages.push(assistantMessage);

      return assistantResponse;
    } catch (error) {
      console.error('Error sending message to Letta:', error);
      throw new Error(`Failed to send message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get all messages in the conversation history
   * @returns Array of messages
   */
  public getMessages(): Message[] {
    return [...this._messages];
  }

  /**
   * Create a streaming message response
   * @param messages The messages to include in the request
   * @returns A stream of response chunks
   */
  public async createMessageStream(messages: Message[]): Promise<any> {
    if (!this._client) {
      throw new Error('Letta client not initialized');
    }

    if (!this._agentId) {
      await this.initAgent();
    }

    this._abortController = new AbortController();

    try {
      // Get the last user message
      // Find the last user message (without using findLast which requires ES2023)
      let lastUserMessage: Message | undefined;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          lastUserMessage = messages[i];
          break;
        }
      }
      
      if (!lastUserMessage) {
        throw new Error('No user message found');
      }

      // Start streaming response
      const stream = await this._client.sendMessageStream({
        agentId: this._agentId!,
        message: lastUserMessage.content,
        signal: this._abortController.signal
      });

      return stream;
    } catch (error) {
      console.error('Error creating message stream:', error);
      throw new Error(`Failed to create message stream: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Cancel the current message stream
   * @returns true if a stream was cancelled, false otherwise
   */
  public cancelCurrentStream(): boolean {
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
      return true;
    }
    return false;
  }
}