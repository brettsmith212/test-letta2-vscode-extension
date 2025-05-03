import { vi } from 'vitest';

// Mock the required VS Code API
export const mockVSCode = {
  workspace: {
    getConfiguration: vi.fn().mockImplementation(() => ({
      get: vi.fn().mockImplementation((key: string) => {
        if (key === 'serverUrl') return 'http://test-server:8283';
        return undefined;
      })
    }))
  }
};

// Mock the Letta Client
export const mockLettaClient = {
  createAgent: vi.fn().mockResolvedValue({ agentId: 'mock-agent-id' }),
  sendMessage: vi.fn().mockResolvedValue({ response: 'Hello from Letta!' }),
  sendMessageStream: vi.fn().mockResolvedValue({
    [Symbol.asyncIterator]: async function* () {
      yield { type: 'text', text: 'Hello' };
      yield { type: 'text', text: ' from' };
      yield { type: 'text', text: ' Letta!' };
    }
  })
};

export const mockLettaClientConstructor = vi.fn().mockImplementation(() => mockLettaClient);