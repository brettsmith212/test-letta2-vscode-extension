# Project Memory for VS Code Letta Chat Extension

## Project Summary
This is a VS Code extension that integrates with Letta AI (migrated from Claude AI). It provides a chat interface to interact with AI directly within VS Code, allowing users to ask questions and get AI assistance without leaving the editor.

## Project Structure
- `/src` - Main TypeScript source code
  - `extension.ts` - Extension entry point for VS Code activation
  - `/panels` - Contains ChatPanel for UI interaction
  - `/services` - Contains ChatService and LettaService for AI communications
  - `/tools` - Contains tools for file and terminal operations (to be removed)
  - `/views` - Contains webview-related code
- `/webviews` - React components for the chat interface
- `/media` - Static assets, including built webview
- `/.storybook` - Storybook configuration for component development
- `/test` - Vitest unit tests

## Development Commands
- `npm run compile` - Compile TypeScript code
- `npm run watch` - Watch for changes and compile TypeScript
- `npm run build:webviews` - Build React webviews using Vite
- `npm run watch:webviews` - Watch for changes in webviews
- `npm test` - Run tests using Vitest
- `npm run lint` - Run ESLint for code linting
- `npm run storybook` - Start Storybook for UI development

## Implementation Notes
- The extension is being migrated from Anthropic's Claude-3.5 API to Letta AI
- Using a test-driven migration approach with small, incremental steps
- LettaService handles communication with the Letta AI server
- The extension maintains conversation history in the service layer
- The migration removes tool-related code as that will be handled by Letta AI

## Architecture
- `ChatPanel` - Manages the webview UI and handles user input
- `ChatService` - Wraps the Letta service and provides API compatibility
- `LettaService` - Core service that communicates with the Letta AI server
  - Handles agent initialization
  - Manages message history
  - Supports both streaming and non-streaming responses
- React components in `/webviews` render the chat interface
- Messages are passed between the extension and webview using the VS Code API

## Migration Progress
The migration follows the plan in implementation.md, with the following steps completed:
1. ✅ Setting up a testing framework with Vitest
2. ✅ Renaming commands and manifest (now using letta-chat.openChat)
3. ✅ Created a new LettaService with the required functionality

Remaining steps include:
4. Refactoring ChatService to use LettaService
5. Simplifying ChatPanel and removing tool-related code
6. Cleaning up dependencies and removing Anthropic SDK

## Configuration
- The extension used to use Claude API key in VS Code settings under `claudeChat.apiKey`
- It now uses a server URL configuration stored in `lettaChat.serverUrl`
- The default server URL is http://localhost:8283

## Testing Strategy
- Unit tests with Vitest for service and functionality verification
- Tests use mocks to isolate components and avoid external dependencies
- Integration tests will be added to verify end-to-end functionality