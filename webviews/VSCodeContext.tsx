import React, { createContext, useContext } from 'react';
import { AgentSummary } from '../src/types/agent';

interface VSCodeApi {
    postMessage: (message: any) => void;
    getState: () => any;
    setState: (state: any) => void;
}

// Extended API with typed methods for chat interactions
interface EnhancedVSCodeApi extends VSCodeApi {
    // Message commands
    sendMessage: (text: string) => void;
    cancelMessage: () => void;
    startNewThread: () => void;
    restoreHistory: () => void;
    
    // Agent management commands
    listAgents: () => void;
    selectAgent: (agentId: string) => void;
    createAgent: (agentName: string, model?: string) => void;
}

declare function acquireVsCodeApi(): VSCodeApi;

const VSCodeContext = createContext<VSCodeApi | null>(null);

// TypeScript will infer the return type of useVSCode as EnhancedVSCodeApi

export const VSCodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const vscode = acquireVsCodeApi();
    return <VSCodeContext.Provider value={vscode}>{children}</VSCodeContext.Provider>;
};

export const useVSCode = (): EnhancedVSCodeApi => {
    const context = useContext(VSCodeContext);
    if (!context) {
        throw new Error('useVSCode must be used within a VSCodeProvider');
    }
    
    // Create a wrapped version of the VSCode API with typed methods
    const wrappedContext = {
        ...context,
        // Original message functions
        sendMessage: (text: string) => {
            context.postMessage({ command: 'sendMessage', text });
        },
        cancelMessage: () => {
            context.postMessage({ command: 'cancelMessage' });
        },
        startNewThread: () => {
            context.postMessage({ command: 'newThread' });
        },
        restoreHistory: () => {
            context.postMessage({ command: 'restoreHistory' });
        },
        
        // New agent-related functions
        listAgents: () => {
            context.postMessage({ command: 'listAgents' });
        },
        selectAgent: (agentId: string) => {
            context.postMessage({ command: 'selectAgent', agentId });
        },
        createAgent: (agentName: string, model?: string) => {
            context.postMessage({ command: 'createAgent', agentName, model });
        }
    };
    
    return wrappedContext;
};