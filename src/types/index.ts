export type ContentBlock = TextBlock | ToolUseBlock | ToolResultBlock;

export interface TextBlock {
    type: 'text';
    text: string;
}

export interface ToolUseBlock {
    type: 'tool_use';
    id: string;
    name: string;
    input: Record<string, any>;
}

export interface ToolResultBlock {
    type: 'tool_result';
    tool_use_id: string;
    content: string;
}

export interface Message {
    role: 'user' | 'assistant';
    content: string | ContentBlock[];
}

export interface WebviewMessage {
    command: string;
    text?: string;
    commandId?: string;
}