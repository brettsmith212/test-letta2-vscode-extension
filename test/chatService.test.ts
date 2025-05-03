import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatService } from '../src/services/ChatService';
import { LettaService } from '../src/services/LettaService';
import { Message } from '../src/types';

// Mock LettaService
vi.mock('../src/services/LettaService', () => {
  return {
    LettaService: vi.fn().mockImplementation(() => ({
      sendMessage: vi.fn().mockImplementation((message) => Promise.resolve(`Response to: ${message}`)),
      getMessages: vi.fn().mockReturnValue([]),
      createMessageStream: vi.fn().mockImplementation(() => Promise.resolve({ [Symbol.asyncIterator]: async function* () {} })),
      cancelCurrentStream: vi.fn().mockReturnValue(true)
    }))
  };
});

describe('ChatService', () => {
  let chatService: ChatService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    chatService = new ChatService();
  });

  it('should correctly proxy sendMessage to LettaService', async () => {
    const userMessage = 'Hello, Letta!';
    const expectedResponse = 'Response to: Hello, Letta!';
    
    const response = await chatService.sendMessage(userMessage);
    
    // Check that the response is as expected
    expect(response.role).toBe('assistant');
    expect(response.content).toBe(expectedResponse);
    
    // Check that messages array is updated correctly
    const messages = chatService.getMessages();
    expect(messages.length).toBe(2);
    expect(messages[0].role).toBe('user');
    expect(messages[0].content).toBe(userMessage);
    expect(messages[1].role).toBe('assistant');
    expect(messages[1].content).toBe(expectedResponse);
  });

  it('should create a message stream', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
      { role: 'user', content: 'What can you do?' }
    ];
    
    const stream = await chatService.createMessageStream(messages, []);
    
    // Just verify we got a stream object back
    expect(stream).toBeDefined();
  });

  it('should cancel the current stream', () => {
    const result = chatService.cancelCurrentStream();
    expect(result).toBe(true);
  });
});