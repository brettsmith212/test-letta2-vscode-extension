// Mocking the VS Code API for tests

const commandRegistry = new Map<string, (...args: any[]) => any>();

export const ExtensionContext = function() {};

export const extensions = {
  getExtension: (id: string) => ({
    activate: async () => ({}),
    exports: {}
  })
};

export const commands = {
  registerCommand: (id: string, handler: (...args: any[]) => any) => {
    commandRegistry.set(id, handler);
    return { dispose: () => {} };
  },
  executeCommand: async (id: string, ...args: any[]) => {
    return Promise.resolve();
  },
  getCommands: (filterInternal?: boolean) => {
    return Promise.resolve(['claude-chat.openChat']);
  }
};

export const window = {
  createWebviewPanel: () => ({
    webview: {
      html: '',
      onDidReceiveMessage: () => ({ dispose: () => {} }),
      postMessage: () => Promise.resolve(true)
    },
    onDidDispose: () => ({ dispose: () => {} }),
    onDidChangeViewState: () => ({ dispose: () => {} }),
    reveal: () => {}
  }),
  showErrorMessage: () => Promise.resolve(),
  showInformationMessage: () => Promise.resolve()
};

export const workspace = {
  getConfiguration: () => ({
    get: (key: string) => '',
    update: () => Promise.resolve()
  })
};

export enum ViewColumn {
  Active = -1,
  Beside = -2,
  One = 1,
  Two = 2,
  Three = 3,
}

// Default export to satisfy module structure
export default {
  ExtensionContext,
  extensions,
  commands,
  window,
  workspace,
  ViewColumn
};