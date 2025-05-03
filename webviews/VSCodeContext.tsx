import React, { createContext, useContext } from 'react';

interface VSCodeApi {
    postMessage: (message: any) => void;
    getState: () => any;
    setState: (state: any) => void;
}

declare function acquireVsCodeApi(): VSCodeApi;

const VSCodeContext = createContext<VSCodeApi | null>(null);

export const VSCodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const vscode = acquireVsCodeApi();
    return <VSCodeContext.Provider value={vscode}>{children}</VSCodeContext.Provider>;
};

export const useVSCode = () => {
    const context = useContext(VSCodeContext);
    if (!context) {
        throw new Error('useVSCode must be used within a VSCodeProvider');
    }
    return context;
};