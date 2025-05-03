import { expect, test, describe, vi } from 'vitest';
import { LettaService } from '../src/services/LettaService';

describe('LettaService', () => {
  test('sendMessage returns stub response', async () => {
    const lettaService = new LettaService();
    const response = await lettaService.sendMessage('hello');
    
    // Verify the stub responds with "pong"
    expect(response).toBe('pong');
  });

  test('initAgent resolves without error', async () => {
    const lettaService = new LettaService();
    
    // Should not throw an error
    await expect(lettaService.initAgent()).resolves.toBeUndefined();
  });
});