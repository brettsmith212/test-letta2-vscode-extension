import * as vscode from 'vscode';
import Anthropic from '@anthropic-ai/sdk';
import { Message, ContentBlock } from '../types';
import { searchFiles, fileTools } from '../tools/fileTools';
import { terminalTools, executeTerminalTool } from '../tools/terminalTools';

// Define type for tool calls
interface ToolCall {
  name: string;
  input: any;
}

export class ChatService {
  private _messages: Message[] = [];
  private anthropic: Anthropic | undefined;
  private currentStream: any | null = null;
  private abortController: AbortController | null = null;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    const apiKey = this.getApiKey();
    if (apiKey) {
      this.anthropic = new Anthropic({ apiKey });
    }
  }

  private getApiKey(): string | undefined {
    return process.env.ANTHROPIC_API_KEY ||
           vscode.workspace.getConfiguration('claudeChat').get<string>('apiKey');
  }

  public async sendMessage(userMessage: string): Promise<Message> {
    const message: Message = {
      role: 'user',
      content: userMessage
    };
    this._messages.push(message);

    const response = await this._getChatResponse(userMessage);
    this._messages.push(response);

    return response;
  }

  private async _getChatResponse(userMessage: string): Promise<Message> {
    if (!this.anthropic) {
      throw new Error('Anthropic client not initialized. Please check API key.');
    }

    const lowercaseMessage = userMessage.toLowerCase();

    // Handle file search explicitly
    if (lowercaseMessage.includes('find files') || lowercaseMessage.includes('search files')) {
      const searchTerm = this._extractSearchTerm(userMessage);
      if (searchTerm) {
        try {
          const files = await searchFiles(searchTerm);
          return {
            role: 'assistant',
            content: files.length > 0
              ? `Found these files matching "${searchTerm}":\n\n${files.join('\n')}`
              : `No files found matching "${searchTerm}".`
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            role: 'assistant',
            content: `Error searching files: ${errorMessage}`
          };
        }
      }
    }

    // For general queries, use Claude's knowledge base
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{ role: 'user', content: userMessage }],
      });

      const content = response.content
        .map(block => block.type === 'text' ? block.text : '')
        .filter(Boolean)
        .join('\n');

      return {
        role: 'assistant',
        content
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        role: 'assistant',
        content: `Error processing request: ${errorMessage}`
      };
    }
  }

  private _extractSearchTerm(message: string): string | null {
    const match = message.match(/(?:find|search)\s+files\s+(?:with|containing|for)\s+(.*?)(?:$|\s+and)/i);
    return match ? match[1].trim() : null;
  }

  public getMessages(): Message[] {
    return this._messages;
  }

  public async createMessageStream(messages: Message[], tools: Anthropic.Tool[]) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key not found. Please set ANTHROPIC_API_KEY environment variable or configure it in VSCode settings.');
    }

    if (!this.anthropic) {
      this.initializeClient();
    }

    // Combine all available tools
    const allTools = [...fileTools, ...terminalTools];
    
    // Add any additional tools, ensuring no duplicates by name
    if (tools && tools.length > 0) {
      const existingToolNames = new Set(allTools.map(tool => tool.name));
      
      for (const tool of tools) {
        if (!existingToolNames.has(tool.name)) {
          allTools.push(tool);
          existingToolNames.add(tool.name);
        } else {
          console.warn(`Duplicate tool name found: ${tool.name}. Skipping.`);
        }
      }
    }

    const systemPrompt = `
You are Claude, an AI assistant created by Anthropic, integrated into a VS Code extension. Your role is to:

1. Format all responses using proper markdown syntax:
   - Use backticks (\`) for inline code, filenames, and paths
   - Use triple backticks (\`\`\`) for code blocks with appropriate language tags
   - Use bullet points and numbered lists for structured content
   - Use headers (##, ###) to organize long responses
   - Use bold and italic text for emphasis when appropriate

2. Be concise and minimize chat output:
   - Do not narrate your actions while using tools (e.g., "Let me check that file", "I'll search for...")
   - Do not explain your thought process unless specifically asked
   - Only output final results and important updates
   - When making multiple changes, wait until all changes are complete before providing a single summary
   - Skip intermediate status updates unless they are critical
   - For file operations, only report final success/failure, not each step

3. Answer general knowledge questions concisely and accurately.

4. Assist with coding tasks by providing explanations, writing code, debugging, or answering programming questions.

5. Use available tools only when explicitly requested or when a task clearly requires them.

6. When reading files to answer questions:
   - Search and analyze content silently without narrating the process
   - Provide only the relevant answer
   - Do not show file contents unless explicitly requested

7. If a file cannot be found:
   - Report the error concisely
   - Provide brief suggestions for resolution
   - Do not narrate the search process

8. If a file cannot be read:
   - Report the specific issue briefly
   - Provide concise suggestions for resolution

9. For multiple matching files:
   - Ask for clarification with specific paths
   - Do not list every search result unless requested

10. For ambiguous requests:
    - Ask for clarification directly
    - Do not explain possible interpretations unless asked

11. When using terminal commands:
    - Use the run_command tool to execute shell commands when needed
    - Run git commands, build processes, installations, or any terminal operations
    - Report command execution results concisely
    - Do not ask for permission to run standard development commands

Examples of good responses:
- "The \`main.go\` file defines the entry point for a Go application."
- "File \`config.json\` created successfully."
- "Error: File \`main.go\` not found. Try 'search files main.go'."
- "Which file did you mean: \`src/main.go\` or \`cmd/main.go\`?"
- "Command \`npm install\` executed successfully."
- "Git status shows 3 modified files."

Examples of responses to avoid:
- "Let me search for that file..."
- "I'll analyze the contents..."
- "First, I'll check if the file exists..."
- "Now I'm going to update the code..."
- "Let me check"
- "File has been updated"
- "Let me run that command for you..."

When responding:
- Always use proper markdown formatting
- Focus only on final results and important updates
- Skip intermediate steps and thought processes
- Be direct and to the point
- Only provide detailed explanations when explicitly requested

Current workspace context: You are in a VS Code environment with access to file tools and terminal commands. Files may be in the root or subdirectories. Search recursively when needed, but do not narrate the search process.
`.trim();

    this.abortController = new AbortController();
    
    const stream = await this.anthropic!.messages.create({
      messages,
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      stream: true,
      tools: allTools,
      system: systemPrompt
    }, {
      signal: this.abortController.signal
    });
    
    this.currentStream = stream;
    return stream;
  }
  
  public cancelCurrentStream() {
    if (this.abortController) {
      this.abortController.abort();
      this.currentStream = null;
      this.abortController = null;
      return true;
    }
    return false;
  }

  public async handleToolCall(toolCall: ToolCall): Promise<string> {
    console.log("Tool call:", toolCall);
    
    const { name, input } = toolCall;
    
    // Handle file tools
    if (name === "create_file" || name === "update_file" || 
        name === "delete_file" || name === "read_file" || 
        name === "search_files" || name === "list_files") {
      // Import the executeTool function dynamically to avoid circular dependencies
      const { executeTool } = require('../tools/fileTools');
      return await executeTool(name, input, true);
    }
    
    // Handle terminal tools
    if (name === "run_command" || name === "read_terminal_output") {
      console.log(`Executing terminal tool: ${name}`, input);
      return await executeTerminalTool(name, input);
    }
    
    throw new Error(`Unknown tool: ${name}`);
  }
}