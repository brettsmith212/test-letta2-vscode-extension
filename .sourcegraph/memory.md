# Project Memory for VS Code Letta Chat Extension

## Project Summary
This is a VS Code extension that integrates with Letta AI (migrated from Claude AI). It provides a chat interface to interact with AI directly within VS Code, allowing users to ask questions and get AI assistance without leaving the editor.

## Project Structure
- `/src` - Main TypeScript source code
  - `extension.ts` - Extension entry point for VS Code activation
  - `/panels` - Contains ChatPanel for UI interaction
  - `/services` - Contains ChatService and LettaService for AI communications
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
The migration followed the plan in implementation.md, and all steps have been successfully completed:
1. ✅ Setting up a testing framework with Vitest
2. ✅ Renaming commands and manifest (now using letta-chat.openChat)
3. ✅ Created a new LettaService with the required functionality
4. ✅ Refactored ChatService to use LettaService
5. ✅ Simplified ChatPanel and removed tool-related code
6. ✅ Removed the tools directory
7. ✅ Updated configuration to use server URL instead of API key
8. ✅ Cleaned up dependencies and removed Anthropic SDK
9. ✅ Added integration test documentation and updated README/comments

## Configuration
- The extension used to use Claude API key in VS Code settings under `claudeChat.apiKey`
- It now uses a server URL configuration stored in `lettaChat.serverUrl`
- The default server URL is http://localhost:8283

## Testing Strategy
- Unit tests with Vitest for service and functionality verification
- Tests use mocks to isolate components and avoid external dependencies
- For VS Code components like ChatPanel, we use placeholder tests with detailed documentation due to the complexity of testing VS Code WebViews
- Integration tests are documented but implemented as placeholders due to the complexity of testing VS Code extensions in headless environments
- For VS Code components, tests focus on verifying the messaging contract between components rather than UI rendering

## Learned Lessons
- **VS Code Extension Testing**: Testing VS Code extensions, especially UI components like WebViews, requires specialized approaches. The VS Code API is difficult to mock in standard test environments, and the best approach is to use @vscode/test-electron or @vscode/test-cli for integration testing.

- **Staged Migration**: The incremental, test-driven approach works well for migration projects, allowing us to verify each change independently.

- **Adapter Pattern**: We used an adapter pattern where ChatService wraps LettaService, allowing us to maintain the same API for the UI layer while changing the underlying implementation.

- **Tool Removal**: Removing the tool-related code simplified ChatPanel significantly, making it solely responsible for UI interactions. The AI's tool handling is now managed by Letta AI itself, reducing the extension's complexity.

- **Type Compatibility**: When migrating between services with similar but non-identical types (like Message interfaces), we need to ensure type compatibility or provide conversion functions.

- **Documentation First Integration Tests**: For complex test environments like VS Code extensions, sometimes a "documentation first" approach makes more sense than fighting with the testing infrastructure. We created placeholder integration tests with detailed documentation explaining how real tests would work, which provides guidance for future developers without blocking the migration process.

- **Comprehensive Headers**: Adding detailed header comments to key service files significantly improves code maintenance. The headers should explain not just what the component does, but its role in the overall architecture and relationships with other components.