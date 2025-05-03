import * as vscode from 'vscode';
import { ChatPanel } from './panels/ChatPanel';

export function activate(context: vscode.ExtensionContext) {
    console.log('Claude Chat extension is now active!');

    const openChatCommand = vscode.commands.registerCommand('claude-chat.openChat', () => {
        const panel = ChatPanel.getInstance(context.extensionUri, context);
        panel.reveal();
    });

    context.subscriptions.push(openChatCommand);
}

export function deactivate() {}