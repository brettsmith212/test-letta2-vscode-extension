import * as vscode from "vscode";
import { LettaClient } from "@letta-ai/letta-client";

import { Message, ContentBlock, AgentSummary } from "../types";

/**
 * LettaService – Communicates with a running Letta server via the official
 * TypeScript SDK.  Wrapped by ChatService and provides:
 *   • Agent creation / reuse
 *   • Message sending (complete & streaming)
 *   • Abort‑controller support to cancel streams
 */
export class LettaService {
  // Conversation history (used mainly for convenience / UI)
  private _messages: Message[] = [];

  // Letta SDK client & active agent
  private _client: LettaClient | null = null;
  private _activeAgentId: string | null = null;
  private _agents: AgentSummary[] | null = null;

  // For cancelling a streaming request
  private _abortController: AbortController | null = null;

  private readonly _extensionContext: vscode.ExtensionContext | undefined;

  constructor(context?: vscode.ExtensionContext) {
    this._extensionContext = context;
    this._initializeClient();
    
    // Try to restore previously selected agent
    if (this._extensionContext) {
      const savedAgentId = this._extensionContext.globalState.get<string>('letta.activeAgent');
      if (savedAgentId) {
        console.log(`[LettaService] Restoring saved agent: ${savedAgentId}`);
        // We'll set the ID directly but defer validation until first use
        this._activeAgentId = savedAgentId;
      }
    }
  }

  /* ------------------------------------------------------------------ *
   *  Public API                                                        *
   * ------------------------------------------------------------------ */

  /**
   * Sends a single message and returns the assistant’s full reply
   */
  /**
   * List available agents from the Letta server
   */
  public async listAgents(): Promise<AgentSummary[]> {
    if (!this._client) {
      throw new Error("Letta client not initialised");
    }

    // Cache the agent list to avoid repeated API calls
    if (!this._agents) {
      await this._loadAgents();
    }

    return this._agents || [];
  }

  /**
   * Select an existing agent to use for chat
   */
  public async selectAgent(id: string): Promise<void> {
    if (!this._client) {
      throw new Error("Letta client not initialised");
    }
    
    // Validate the agent exists
    const agents = await this.listAgents();
    const exists = agents.some(agent => agent.id === id);
    
    if (!exists) {
      throw new Error(`Agent with ID ${id} not found`);
    }
    
    this._activeAgentId = id;
    this._messages = []; // Clear conversation history for new agent
    
    // Persist the selected agent ID
    if (this._extensionContext) {
      this._extensionContext.globalState.update('letta.activeAgent', id);
      console.log(`[LettaService] Saved agent preference: ${id}`);
    }
  }

  /**
   * Create a new agent with the given options
   */
  public async createAgent(options: { name: string, model?: string }): Promise<AgentSummary> {
    if (!this._client) {
      throw new Error("Letta client not initialised");
    }

    try {
      const agent: any = await this._client.agents.create({
        name: options.name,
        model: options.model || "openai/gpt-4o-mini",
        embedding: "openai/text-embedding-ada-002",
        memoryBlocks: [
          {
            label: "persona",
            value: "You are a helpful programming assistant living inside Visual Studio Code.",
          },
          {
            label: "human",
            value: "",
          },
        ],
      });

      const newAgent: AgentSummary = {
        id: agent.id,
        name: agent.name,
        model: agent.model,
      };

      // Update cache and select the new agent
      if (this._agents) {
        this._agents.push(newAgent);
      } else {
        this._agents = [newAgent];
      }
      
      this._activeAgentId = newAgent.id;
      return newAgent;
    } catch (err) {
      console.error("LettaService.createAgent – SDK error:", err);
      throw new Error(
        `Failed to create agent: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }


  /**
   * Sends a single message and returns the assistant's full reply
   */
  public async sendMessage(text: string): Promise<string> {
    if (!this._client) {
      throw new Error("Letta client not initialised");
    }

    // Ensure we have / reuse an agent
    await this._ensureAgent();

    // Record user message locally
    this._messages.push({ role: "user", content: text });

    try {
      const result: any = await this._client.agents.messages.create(
        this._activeAgentId!,
        {
          messages: [{ role: "user", content: text }],
        }
      );

      // API returns either { messages } or { data: { messages } }
      const messagesArr: any[] =
        result?.messages ?? result?.data?.messages ?? [];

      const reply = this._extractAssistantReply(messagesArr);

      // Store & return
      this._messages.push({ role: "assistant", content: reply });
      return reply;
    } catch (err) {
      console.error("LettaService.sendMessage – SDK error:", err);
      throw new Error(
        `Failed to send message to Letta: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  /**
   * Opens a streaming response for the most‑recent user message
   */
  public async createMessageStream(messages: Message[]) {
    if (!this._client) {
      throw new Error("Letta client not initialised");
    }

    await this._ensureAgent();

    // Find the last user message
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) throw new Error("No user message provided for streaming");

    this._abortController = new AbortController();

    try {
      // The SDK currently supports streaming via create({ stream: true })
      const stream: AsyncIterable<any> = await (
        this._client as any
      ).agents.messages.create(this._activeAgentId!, {
        messages: [{ role: "user", content: String(lastUser.content) }],
        stream: true, // flag to request SSE/streaming
        signal: this._abortController.signal,
      });

      return stream;
    } catch (err) {
      console.error("LettaService.createMessageStream – SDK error:", err);
      throw new Error(
        `Failed to create message stream: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  /**
   * Abort an in‑progress stream (if any)
   */
  public cancelCurrentStream(): boolean {
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
      return true;
    }
    return false;
  }

  /** Expose a copy of conversation history */
  public getMessages(): Message[] {
    return [...this._messages];
  }

  /* ------------------------------------------------------------------ *
   *  Internal helpers                                                  *
   * ------------------------------------------------------------------ */

  /**
   * Find the assistant reply in the list returned by the Letta API
   */
  private _extractAssistantReply(messagesArr: any[]): string {
    if (!Array.isArray(messagesArr) || messagesArr.length === 0) {
      return "(No response)";
    }

    const assistantMsg =
      this._findAssistantMessage(messagesArr) ??
      messagesArr[messagesArr.length - 1];

    const content = assistantMsg?.content;
    return this._contentToString(content);
  }

  private _findAssistantMessage(messagesArr: any[]) {
    return (
      messagesArr.find((m) => m.message_type === "assistant_message") ??
      messagesArr.find((m) => m.role === "assistant")
    );
  }

  /**
   * Normalises any Letta content shape into a string for the UI
   *
   * - If the server already returns a plain string, pass it through
   * - If content is an array of content blocks, concatenate text blocks
   * - Fallback to JSON.stringify for unknown shapes
   */
  private _contentToString(content: unknown): string {
    if (typeof content === "string") return content;

    if (Array.isArray(content)) {
      const texts = (content as ContentBlock[])
        .filter((block) => block && (block as any).type === "text")
        .map((block) => (block as any).text)
        .filter(Boolean);
      if (texts.length) {
        return texts.join("\n");
      }
    }

    if (content) {
      try {
        return JSON.stringify(content);
      } catch {
        return String(content);
      }
    }

    return "(No response)";
  }

  private _initializeClient() {
    const baseUrl = this._getServerUrl();

    try {
      // Client options currently support only { baseUrl }
      this._client = new LettaClient({ baseUrl });
      console.log("[LettaService] Client initialised:", baseUrl);
    } catch (err) {
      console.error("Failed to initialise LettaClient:", err);
      this._client = null;
    }
  }

  /**
   * Load all agents from the Letta server
   */
  private async _loadAgents(): Promise<void> {
    try {
      if (!this._client) throw new Error("Letta client not initialised");
      
      const response: any = await this._client.agents.list();
      const agents = response?.agents || response?.data?.agents || [];
      
      this._agents = agents.map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        model: agent.model
      }));
      
      console.log(`[LettaService] Loaded ${this._agents?.length || 0} agents`);
    } catch (err) {
      console.error("LettaService._loadAgents – SDK error:", err);
      this._agents = [];
    }
  }

  /**
   * Create a new agent once per extension session
   */
  private async _ensureAgent() {
    if (!this._client) throw new Error("Letta client not initialised");
    if (this._activeAgentId) return;

    // If we have agents already, use the first one instead of creating a new one
    if (!this._agents) {
      await this._loadAgents();
    }
    
    if (this._agents && this._agents.length > 0) {
      this._activeAgentId = this._agents[0].id;
      console.log("[LettaService] Using existing agent:", this._activeAgentId);
      return;
    }

    // No agents found, create a new one
    const agent = await this.createAgent({
      name: "vscode-chat-agent",
      model: "openai/gpt-4o-mini"
    });

    this._activeAgentId = agent.id;
    console.log("[LettaService] Agent created:", this._activeAgentId);
  }

  /* ------------------------------------------------------------------ *
   *  Config utilities                                                  *
   * ------------------------------------------------------------------ */

  private _getServerUrl(): string {
    // Order of precedence: env var → user setting → default
    return (
      process.env.LETTA_SERVER_URL ||
      vscode.workspace.getConfiguration("lettaChat").get<string>("serverUrl") ||
      "http://localhost:8283"
    );
  }

  /* ------------------------------------------------------------------ *
   *  Static helper for unit tests                                      *
   * ------------------------------------------------------------------ */
  public static createForTesting(
    mockClient: any,
    mockAgentId = "agent-test-id",
    mockContext?: vscode.ExtensionContext
  ): LettaService {
    const svc = new LettaService(mockContext);
    svc._client = mockClient;
    svc._activeAgentId = mockAgentId;
    return svc;
  }
}
