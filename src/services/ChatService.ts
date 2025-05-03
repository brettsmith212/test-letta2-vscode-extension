import * as vscode from 'vscode';
// TODO: Remove @anthropic-ai/sdk dependency in Step 7-1
// import Anthropic from '@anthropic-ai/sdk';
import { Message, ContentBlock } from '../types';
import { LettaService } from './LettaService';

// Temporary type definitions for backward compatibility
// These will be removed when we fully migrate away from tool-related code
interface AnthropicTool {
  name: string;
  description: string;
  input_schema: any;
}

namespace Anthropic {
  export type Tool = AnthropicTool;
}
// Tools imports removed as part of migration to Letta

// ToolCall interface removed as part of migration to Letta

export class ChatService {
  private _messages: Message[] = [];
  private lettaService: LettaService;
  
  constructor() {
    // Initialize a singleton LettaService
    this.lettaService = new LettaService();
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
  public async createMessageStream(messages: Message[], tools?: Anthropic.Tool[]) {
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