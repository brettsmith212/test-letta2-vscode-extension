import React, { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '../components/ui/scroll-area';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css'; // Use a dark theme compatible with VS Code

// Add VSCode API to window type for TS
declare global {
    interface Window {
        vscode: {
            postMessage: (msg: any) => void;
        };
    }
}

interface Message {
    role: 'user' | 'assistant' | 'pending-command';
    content: string;
    messageId?: number;
    commandDetails?: {
        command: string;
        commandId: string;
    };
}

interface ChatContainerProps {
    messages: Message[];
    messageInProgress: Message | null;
    errorMessages: string[]; // Keeping for backward compatibility but no longer using
    onApproveCommand?: (commandId: string) => void;
    onCancelCommand?: (commandId: string) => void;
    isProcessing: boolean; // Add isProcessing prop
}

const ChatContainer: React.FC<ChatContainerProps> = ({ messages, messageInProgress, errorMessages, onApproveCommand, onCancelCommand, isProcessing }) => {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);
    const [copiedCommands, setCopiedCommands] = useState<Record<string, boolean>>({});

    // Check if scroll is at bottom
    const checkScrollPosition = () => {
        const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollArea) {
            const { scrollTop, scrollHeight, clientHeight } = scrollArea;
            isAtBottomRef.current = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
        }
    };

    // Scroll to bottom if already at bottom
    const scrollToBottom = () => {
        if (isAtBottomRef.current) {
            const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollArea) {
                scrollArea.scrollTop = scrollArea.scrollHeight;
            }
        }
    };

    // Initialize scroll listener and scroll to bottom on mount
    useEffect(() => {
        const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollArea) {
            scrollArea.addEventListener('scroll', checkScrollPosition);
            // Initialize to bottom on first load
            scrollArea.scrollTop = scrollArea.scrollHeight;
            isAtBottomRef.current = true;
            
            // Check position after content has loaded/rendered
            setTimeout(checkScrollPosition, 100);
        }

        return () => {
            if (scrollArea) {
                scrollArea.removeEventListener('scroll', checkScrollPosition);
            }
        };
    }, []);

    // Scroll to bottom when messages change, but only if we were already at the bottom
    useEffect(() => {
        // Give time for content to render before checking if we should scroll
        setTimeout(scrollToBottom, 10);
    }, [messages, messageInProgress]);

    // Highlight code blocks after rendering
    useEffect(() => {
        document.querySelectorAll('.code-block code').forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
        });
    }, [messages, messageInProgress]);

    // Handle copying command to clipboard
    const handleCopyCommand = (commandId: string, commandText: string) => {
        navigator.clipboard.writeText(commandText).then(() => {
            setCopiedCommands({ ...copiedCommands, [commandId]: true });
            setTimeout(() => {
                setCopiedCommands(prev => ({ ...prev, [commandId]: false }));
            }, 2000);
        });
    };

    // Custom CodeBlock component with copy button
    const CodeBlock: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
        const [isCopied, setIsCopied] = useState(false);

        const handleCopy = () => {
            const text = String(children).trim();
            navigator.clipboard.writeText(text).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            });
        };

        return (
            <div className="code-block group">
                <code className={className}>
                    {children}
                </code>
                <div className="copy-button-container">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        className="h-6 w-6 text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)]"
                        title="Copy code"
                    >
                        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background text-foreground">
            <ScrollArea className="flex-1 overflow-hidden" ref={scrollAreaRef}>
                <div className="flex flex-col gap-4 p-4 chat-message-container">
                    {messages.map((msg, index) => (
                        <div
                            key={msg.messageId ?? index}
                            className="w-full chat-message-container"
                        >
                            <div
                                className={`rounded-md overflow-hidden border chat-message w-full ${
                                    msg.role === 'user'
                                        ? 'bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)]'
                                        : msg.role === 'pending-command'
                                            ? 'bg-[var(--vscode-input-background)] border-[var(--vscode-panel-border)]'
                                            : 'bg-[var(--vscode-editorWidget-background)] text-[var(--vscode-editor-foreground)]'
                                }`}
                            >
                                <div className="p-3">
                                    {msg.role === 'user' ? (
                                        <div className="text-sm whitespace-pre-wrap overflow-wrap-anywhere">{msg.content}</div>
                                    ) : msg.role === 'pending-command' && msg.commandDetails ? (
                                        <div className="flex flex-col gap-2">
                                            <div className="text-sm whitespace-pre-wrap overflow-wrap-anywhere mb-2">
                                                <span className="font-semibold text-[var(--vscode-editor-foreground)]">Proposed command:</span>
                                                <br />
                                                <div className="code-block group mt-1">
                                                    <code className="text-[var(--vscode-editor-foreground)] font-mono text-xs block">
                                                        {msg.commandDetails.command}
                                                    </code>
                                                    <div className="copy-button-container">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                if (msg.commandDetails) {
                                                                    handleCopyCommand(msg.commandDetails.commandId, msg.commandDetails.command);
                                                                }
                                                            }}
                                                            className="h-6 w-6 text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)]"
                                                            title="Copy command"
                                                        >
                                                            {msg.commandDetails && copiedCommands[msg.commandDetails.commandId] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="default"
                                                    className="bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)] px-4"
                                                    onClick={() => {
                                                        console.log('Continue clicked', msg.commandDetails?.commandId);
                                                        if (onApproveCommand && msg.commandDetails?.commandId) {
                                                            onApproveCommand(msg.commandDetails.commandId);
                                                        } else {
                                                            window.vscode.postMessage({
                                                                command: 'approveCommand',
                                                                commandId: msg.commandDetails?.commandId,
                                                            });
                                                        }
                                                    }}
                                                >
                                                    Continue
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    className="bg-[var(--vscode-inputValidation-errorBackground)] text-[var(--vscode-inputValidation-errorForeground)] hover:bg-[var(--vscode-inputValidation-errorBorder)] px-4"
                                                    onClick={() => {
                                                        console.log('Cancel clicked', msg.commandDetails?.commandId);
                                                        if (onCancelCommand && msg.commandDetails?.commandId) {
                                                            onCancelCommand(msg.commandDetails.commandId);
                                                        } else {
                                                            window.vscode.postMessage({
                                                                command: 'cancelMessage',
                                                                commandId: msg.commandDetails?.commandId,
                                                            });
                                                        }
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <ReactMarkdown
                                            components={{
                                                code({ node, className, children, ...props }) {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    return match ? (
                                                        <CodeBlock className={className}>
                                                            {children}
                                                        </CodeBlock>
                                                    ) : (
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                                div: ({ node, ...props }) => <div className="text-sm overflow-wrap-anywhere" {...props} />, 
                                                p: ({ node, ...props }) => <p className="overflow-wrap-anywhere" {...props} />
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isProcessing && messageInProgress && (
                        <div
                            className="w-full chat-message-container"
                        >
                            <div
                                className={`rounded-md overflow-hidden border chat-message w-full ${
                                    messageInProgress.role === 'user'
                                        ? 'bg-[var(--vscode-chat-userMessageBackground)] text-[var(--vscode-editor-foreground)]'
                                        : 'bg-[var(--vscode-chat-assistantMessageBackground)] text-[var(--vscode-editor-foreground)]'
                                }`}
                            >
                                <div className="p-3 flex items-center min-h-[2.5rem]">
                                    {messageInProgress.role === 'user' ? (
                                        <div className="text-sm whitespace-pre-wrap overflow-wrap-anywhere">{messageInProgress.content}</div>
                                    ) : (
                                        !messageInProgress.content ? (
                                            <div className="flex items-center justify-center w-full h-8">
                                                <Loader2 className="animate-spin h-5 w-5 text-[var(--vscode-editor-foreground)] opacity-80" />
                                                <span className="ml-2 text-xs text-muted-foreground">Claude is thinking...</span>
                                            </div>
                                        ) : (
                                            <ReactMarkdown
                                                components={{
                                                    code({ node, className, children, ...props }) {
                                                        const match = /language-(\w+)/.exec(className || '');
                                                        return match ? (
                                                            <CodeBlock className={className}>
                                                                {children}
                                                            </CodeBlock>
                                                        ) : (
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    },
                                                    div: ({ node, ...props }) => <div className="text-sm overflow-wrap-anywhere" {...props} />, 
                                                    p: ({ node, ...props }) => <p className="overflow-wrap-anywhere" {...props} />
                                                }}
                                            >
                                                {messageInProgress.content}
                                            </ReactMarkdown>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default ChatContainer;