import React, { useState, useEffect } from 'react';
import { VSCodeProvider, useVSCode } from './VSCodeContext';
import Header from './components/Header';
import ChatContainer from './components/ChatContainer';
import InputContainer from './components/InputContainer';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';

interface Message {
    role: 'user' | 'assistant' | 'pending-command';
    content: string;
    messageId?: number;
    commandDetails?: {
        command: string;
        commandId: string;
    };
}

interface WebviewState {
    messages: Message[];
    errorMessages: string[];
}

const ChatInner: React.FC = () => {
    const vscode = useVSCode();
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>(() => {
        const savedState = vscode.getState() as WebviewState | undefined;
        return savedState?.messages || [];
    });
    const [messageInProgress, setMessageInProgress] = useState<Message | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[]>(() => {
        const savedState = vscode.getState() as WebviewState | undefined;
        return savedState?.errorMessages || [];
    });

    // Persist state whenever messages or errorMessages change
    // This only persists state within the current VSCode session for tab switching
    useEffect(() => {
        vscode.setState({ messages, errorMessages });
    }, [messages, errorMessages, vscode]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            switch (message.command) {
                case 'addUserMessage':
                    setMessages(prev => {
                        if (message.messageId && prev.some(msg => msg.messageId === message.messageId)) {
                            return prev;
                        }
                        return [...prev, { role: 'user', content: message.text, messageId: message.messageId }];
                    });
                    break;
                case 'addAssistantMessage': {
                    setIsProcessing(false);
                    setMessageInProgress(null);
                    setMessages(prev => {
                        if (message.messageId && prev.some(msg => msg.messageId === message.messageId)) {
                            return prev;
                        }
                        return [...prev, { role: 'assistant', content: message.text, messageId: message.messageId }];
                    });
                    break;
                }
                case 'startAssistantResponse':
                    setMessageInProgress({ role: 'assistant', content: '', messageId: message.messageId });
                    setIsProcessing(true);
                    break;
                case 'appendAssistantResponse':
                    setMessageInProgress(prev => prev && prev.messageId === message.messageId 
                        ? { ...prev, content: prev.content + message.text } 
                        : prev);
                    break;
                case 'proposeCommand':
                    setMessages(prev => [...prev, {
                        role: 'pending-command',
                        content: message.text,
                        commandDetails: {
                            command: message.commandString,
                            commandId: message.commandId,
                        },
                        messageId: message.messageId,
                    }]);
                    break;
                case 'error':
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: message.text,
                        duration: 3000,
                    });
                    setIsProcessing(false);
                    setMessageInProgress(null);
                    break;
                case 'cancelSuccess':
                    setIsProcessing(false);
                    setMessageInProgress(null);
                    if (message.commandId) removePendingCommand(message.commandId);
                    break;
                case 'clearChat':
                    setMessages([]);
                    setMessageInProgress(null);
                    setErrorMessages([]);
                    vscode.setState({ messages: [], errorMessages: [] });
                    break;
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [vscode, toast]);

    // Remove a pending-command message by commandId
    const removePendingCommand = (commandId: string) => {
        setMessages(prev => prev.filter(
            msg => !(msg.role === 'pending-command' && msg.commandDetails?.commandId === commandId)
        ));
    };

    const handleApproveCommand = (commandId: string) => {
        vscode.postMessage({ command: 'approveCommand', commandId });
        removePendingCommand(commandId); // Optimistically remove
    };
    const handleCancelCommand = (commandId: string) => {
        vscode.postMessage({ command: 'cancelMessage', commandId });
        removePendingCommand(commandId); // Optimistically remove
    };

    const sendMessage = (text: string) => {
        setIsProcessing(true);
        vscode.postMessage({ command: 'sendMessage', text });
    };

    const cancelMessage = () => {
        vscode.postMessage({ command: 'cancelMessage' });
    };

    const startNewThread = () => {
        vscode.postMessage({ command: 'newThread' });
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <Header onNewThread={startNewThread} />
            <ChatContainer
                messages={messages}
                messageInProgress={messageInProgress}
                errorMessages={errorMessages}
                onApproveCommand={handleApproveCommand}
                onCancelCommand={handleCancelCommand}
                isProcessing={isProcessing}
            />
            <InputContainer onSend={sendMessage} onCancel={cancelMessage} isProcessing={isProcessing} />
        </div>
    );
};

const Chat: React.FC = () => (
    <VSCodeProvider>
        <div className="dark min-h-screen min-w-full">
            <ChatInner />
            <Toaster />
        </div>
    </VSCodeProvider>
);

export default Chat;