# Project Memory for VS Code Letta Chat Extension

## Project Summary

This is a VS Code extension that integrates with Letta AI. It provides a chat interface to interact with AI directly within VS Code, allowing users to ask questions and get AI assistance without leaving the editor.

## Project Structure

- `/src` - Main TypeScript source code
  - `extension.ts` - Extension entry point for VS Code activation
  - `/panels` - Contains ChatPanel for UI interaction
  - `/services` - Contains ChatService and LettaService for AI communications
  - `/types` - TypeScript interfaces and type definitions
  - `/views` - Contains webview-related code
  - `/lib` - Utility functions
- `/webviews` - React components for the chat interface
  - `/components` - UI components including AgentBar
  - `/hooks` - React hooks for state management and UI features
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

- The extension integrates with Letta AI's agents-based system
- Users can select existing agents or create new ones from the UI
- Agent IDs are persisted in VS Code's global state for continuity between sessions
- Communication with the Letta server happens through the official TypeScript SDK
- The UI is React-based with Tailwind CSS for styling

## Architecture

- `ChatPanel` - Manages the webview UI and coordinates agent operations
- `ChatService` - Wraps the Letta service and provides API compatibility
- `LettaService` - Core service that communicates with the Letta AI server
  - Manages agent discovery, selection and creation
  - Handles conversation history for each agent
  - Supports both streaming and non-streaming responses
- `AgentBar` - UI component that shows available agents and allows creating new ones
- React components in `/webviews` render the chat interface
- Messages are passed between the extension and webview using the VS Code API

## Agent Management

- Agents are listed from the server on extension activation
- Users can select any existing agent or create a new one
- The active agent ID is persisted in VSCode's global state
- When switching agents, the conversation history is cleared
- If there's only one agent available, it's auto-selected for convenience
- Creating a new agent automatically selects it

## Configuration

- Server URL configuration is stored in `lettaChat.serverUrl`
- The default server URL is http://localhost:8283

## Testing Strategy

- Unit tests with Vitest for service and functionality verification
- Tests use mocks to isolate components and avoid external dependencies
- For VS Code components like ChatPanel, we use simplified tests with mocks to verify messaging contracts
- Agent functionality has specific tests in `lettaService.agent.test.ts`
- Integration tests use a hybrid approach that:
  - Tests core services can be instantiated and interact correctly
  - Verifies the Letta server is accessible with HTTP requests
  - Avoids the complexity of launching full VS Code instances in CI environments
- Our approach balances thoroughness with practicality for CI/CD pipelines

## Learned Lessons

- **VS Code Extension Testing**: Testing VS Code extensions, especially UI components like WebViews, requires specialized approaches. The VS Code API is difficult to mock in standard test environments, and while tools like @vscode/test-electron exist, they have significant limitations in headless environments.

- **Testing Strategies for Services with External Dependencies**: When testing services that interact with external systems (like the Letta server), use a combination of unit tests with mocks and simplified integration tests. Mock the external dependencies in unit tests, and use targeted integration tests for the boundaries.

- **React Component Testing**: When testing React components that interact with extension host, consider writing tests that focus on component behavior rather than testing the host communication directly.

- **Adapter Pattern**: Using an adapter pattern (ChatService wraps LettaService) allows us to maintain the same API for the UI layer while changing the underlying implementation.

- **Type Safety**: Using strong typing throughout the codebase, especially for messages between UI and extension host, helps prevent runtime errors. Define shared interface types in a common location (like src/types).

- **Initialization Timing**: Be careful with timing when initializing components that communicate across boundaries (like webview to extension host). Use explicit ready signals and appropriate delays to ensure components are fully initialized before attempting to communicate.

- **Graceful Error Handling**: Implement robust error handling at API boundaries, especially when dealing with external services. Provide meaningful feedback to users when operations fail.

- **VS Code State Management**: Use VS Code's globalState for persisting user preferences that should survive across sessions. This is ideal for saving settings like the active agent ID.
