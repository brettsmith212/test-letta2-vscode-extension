# Project Memory for VS Code Letta Chat Extension

## Project Summary
This is a VS Code extension that integrates with Claude AI (to be migrated to Letta AI). It provides a chat interface to interact with AI directly within VS Code, allowing users to ask questions and get AI assistance without leaving the editor.

## Project Structure
- `/src` - Main TypeScript source code
  - `extension.ts` - Extension entry point for VS Code activation
  - `/panels` - Contains ChatPanel for UI interaction
  - `/services` - Contains ChatService for AI communications
  - `/tools` - Contains tools for file and terminal operations
  - `/views` - Contains webview-related code
- `/webviews` - React components for the chat interface
- `/media` - Static assets, including built webview
- `/.storybook` - Storybook configuration for component development

## Development Commands
- `npm run compile` - Compile TypeScript code
- `npm run watch` - Watch for changes and compile TypeScript
- `npm run build:webviews` - Build React webviews using Vite
- `npm run watch:webviews` - Watch for changes in webviews
- `npm test` - Run tests using Vitest
- `npm run lint` - Run ESLint for code linting
- `npm run storybook` - Start Storybook for UI development

## Implementation Notes
- The extension is currently using Anthropic's Claude-3.5 API and will be migrated to Letta AI
- The extension supports tool use, allowing Claude to interact with files and the terminal
- The extension maintains conversation history within the ChatPanel instance
- Authentication is done via API keys stored in VS Code settings

## Architecture
- `ChatPanel` - Manages the webview UI and handles user input
- `ChatService` - Communicates with Claude API and manages message streams
- React components in `/webviews` render the chat interface
- Messages are passed between the extension and webview using the VS Code API

## Migration Plan
According to implementation.md, there's a detailed plan to migrate from Claude to Letta AI, including:
1. Setting up a testing framework with Vitest
2. Renaming commands and manifest
3. Creating a new LettaService
4. Refactoring ChatService
5. Simplifying ChatPanel and removing tool-related code
6. Cleaning up dependencies

## Configuration
- Users can set their Claude API key in VS Code settings under `claudeChat.apiKey`
- The extension will switch to using a server URL configuration for Letta AI

## Testing Strategy
- Unit tests with Vitest
- Integration tests using @vscode/test-cli
- Storybook for UI component testing