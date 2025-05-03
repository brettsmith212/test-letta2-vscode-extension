/**
 * Setup file for Vitest tests
 * 
 * This file is run before tests to set up the testing environment,
 * particularly for VS Code-related mocks.
 */

import { vi } from 'vitest';

// Only set up VS Code mocks if we're not in integration test mode
if (!process.env.INTEGRATION_TEST) {
  // Mock vscode module for unit tests
  vi.mock('vscode', () => {
    return {
      window: {
        createWebviewPanel: vi.fn().mockReturnValue({
          webview: {
            html: '',
            onDidReceiveMessage: vi.fn(),
            postMessage: vi.fn().mockResolvedValue(true),
          },
          reveal: vi.fn(),
          onDidDispose: vi.fn(),
          onDidChangeViewState: vi.fn(),
        }),
        showErrorMessage: vi.fn(),
        showInformationMessage: vi.fn(),
      },
      Uri: {
        file: (path: string) => ({ path }),
        parse: (uri: string) => ({ uri }),
        joinPath: (uri: any, ...pathSegments: string[]) => ({ 
          path: [uri.path || '', ...pathSegments].join('/') 
        }),
      },
      commands: {
        registerCommand: vi.fn(),
        executeCommand: vi.fn(),
        getCommands: vi.fn().mockResolvedValue(['letta-chat.openChat']),
      },
      workspace: {
        getConfiguration: vi.fn().mockImplementation(() => ({
          get: vi.fn().mockImplementation((key) => {
            if (key === 'serverUrl') return 'http://localhost:8283';
            return undefined;
          }),
        })),
      },
      extensions: {
        getExtension: vi.fn().mockImplementation((id) => ({
          activate: vi.fn().mockResolvedValue({}),
          exports: {}
        }))
      },
      ExtensionContext: vi.fn(),
      Position: vi.fn(),
      Range: vi.fn(),
      ViewColumn: { One: 1, Two: 2 },
      Disposable: {
        from: (...disposables: any[]) => ({
          dispose: vi.fn(),
        }),
      },
    };
  });
}