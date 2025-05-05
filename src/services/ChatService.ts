import * as vscode from 'vscode';
import { Message, ContentBlock } from '../types';
import { LettaService } from './LettaService';

/**
 * ChatService - Service for managing chat interactions in the VS Code extension
 * 
 * This service acts as an adapter between the UI layer and the LettaService,
 * maintaining backward compatibility with the previous implementation while
 * delegating actual AI communication to the LettaService.
 * 
 * The service handles:
 * - Tracking message history
 * - Error handling and recovery
 * - Formatting messages for display
 * - Streaming message support
 * 
 * @module ChatService
 * @version 1.0.0
 */

// Type definition for tool compatibility
interface LettaTool {
  name: string;
  description: string;
  schema: any;
}

export class ChatService {
  private _messages: Message[] = [];
  // Made public to allow direct access from ChatPanel
  public readonly lettaService: LettaService;
  
  constructor(context?: vscode.ExtensionContext) {
    // Initialize LettaService with extension context for persistence
    this.lettaService = new LettaService(context);
  }

  public async sendMessage(userMessage: string): Promise<Message> {
    // Add the user message to our local array
    const userMsg: Message = {
      role: 'user',
      content: userMessage
    };
    this._messages.push(userMsg);

    try {
      // Use LettaService to send the message
      const response = await this.lettaService.sendMessage(userMessage);
      
      // Create and store the assistant message
      const assistantMsg: Message = {
        role: 'assistant',
        content: response
      };
      this._messages.push(assistantMsg);
      
      return assistantMsg;
    } catch (error) {
      // Handle errors gracefully
      const errorMessage = error instanceof Error ? error.message : String(error);
      const assistantMsg: Message = {
        role: 'assistant',
        content: `Error: ${errorMessage}`
      };
      this._messages.push(assistantMsg);
      return assistantMsg;
    }
  }

  public getMessages(): Message[] {
    return [...this._messages];
  }

  /**
   * Creates a streaming message response
   * @param messages The conversation history
   * @param tools Optional tool definitions (maintained for API compatibility)
   * @returns A stream of response chunks
   */
  public async createMessageStream(messages: Message[], tools?: LettaTool[]) {
    try {
      // Forward to LettaService
      const stream = await this.lettaService.createMessageStream(messages);
      return stream;
    } catch (error) {
      console.error('Error creating message stream:', error);
      throw new Error(`Failed to create message stream: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Cancels the current message stream
   * @returns true if a stream was cancelled, false otherwise
   */
  public cancelCurrentStream() {
    return this.lettaService.cancelCurrentStream();
  }

  // Tool handling removed as part of migration to Letta
}