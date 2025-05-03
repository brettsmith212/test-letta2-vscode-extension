import * as vscode from 'vscode';
import { afterAll, beforeAll, expect, test } from 'vitest';

let ctx:vscode.ExtensionContext;
beforeAll(async () => {
  const ext = vscode.extensions.getExtension('test-extension');   // will update later
  await ext!.activate();
  ctx = ext!.exports;
});
test('command is registered', () => {
  const cmds = vscode.commands.getCommands(true);
  return cmds.then(list => {
    expect(list).toContain('claude-chat.openChat');
  });
});
afterAll(() => vscode.commands.executeCommand('workbench.action.closeAllEditors'));