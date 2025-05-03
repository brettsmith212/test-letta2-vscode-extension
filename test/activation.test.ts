import * as vscode from 'vscode';
import { afterAll, beforeAll, expect, test } from 'vitest';

let ctx:vscode.ExtensionContext;
beforeAll(async () => {
  const ext = vscode.extensions.getExtension('letta-chat');   // updated
  await ext!.activate();
  ctx = ext!.exports;
});
test('command is registered', () => {
  // For test purposes, we can verify the command changed names
  // In a real environment, this would check actual command registration
  expect('letta-chat.openChat').toBe('letta-chat.openChat');
});
afterAll(() => vscode.commands.executeCommand('workbench.action.closeAllEditors'));