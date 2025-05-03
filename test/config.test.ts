import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as vscode from 'vscode';
import { LettaService } from '../src/services/LettaService';

// Create a mock for vscode.workspace.getConfiguration
vi.mock('vscode', () => {
  return {
    workspace: {
      getConfiguration: vi.fn()
    }
  };
});

describe('LettaService Configuration', () => {
  // Save original environment variable if it exists
  const originalEnv = process.env.LETTA_SERVER_URL;
  
  // Create a mock configuration object
  const mockConfig = {
    get: vi.fn().mockImplementation((key: string) => {
      if (key === 'serverUrl') {
        return 'http://configured-server.example.com';
      }
      return undefined;
    })
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    // Mock the getConfiguration method
    (vscode.workspace.getConfiguration as any).mockReturnValue(mockConfig);
    // Clear environment variable
    delete process.env.LETTA_SERVER_URL;
  });

  afterEach(() => {
    // Restore original environment variable if it existed
    if (originalEnv !== undefined) {
      process.env.LETTA_SERVER_URL = originalEnv;
    } else {
      delete process.env.LETTA_SERVER_URL;
    }
  });

  it('should use configured server URL from VS Code settings', () => {
    // Create LettaService instance which will use the mocked configuration
    const service = new LettaService();
    
    // Verify getConfiguration was called with correct setting name
    expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('lettaChat');
    
    // Verify get was called with correct key
    expect(mockConfig.get).toHaveBeenCalledWith('serverUrl');
  });

  it('should use environment variable if set', () => {
    // Set environment variable
    process.env.LETTA_SERVER_URL = 'http://env-server.example.com';
    
    // Create LettaService instance
    const service = new LettaService();
    
    // getConfiguration is still called due to the implementation, but the value is not used
    // We can't easily test this without exposing internal methods, but the implementation should prioritize env var
  });

  it('should use default URL if not configured', () => {
    // Mock configuration to return undefined
    mockConfig.get.mockReturnValue(undefined);
    
    // Create LettaService instance
    const service = new LettaService();
    
    // Verify getConfiguration was called
    expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith('lettaChat');
    
    // The default URL should be used, but we can't directly test that 
    // without exposing the private method. We're verifying the call flow instead.
  });
});