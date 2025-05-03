# Letta Chat for VS Code

A VS Code extension that provides an AI Coding Agent powered by Letta AI, enabling intelligent code assistance and chat interactions directly within your editor.

## Features

- Interactive chat interface with Letta AI
- Code generation, analysis, and refactoring assistance
- Context-aware responses based on your workspace
- Modern, minimalist UI using Shadcn components
- Built with React TypeScript for the webview interface

## Prerequisites

- Node.js and npm installed
- VS Code version 1.54.0 or higher
- A running Letta AI server (default: http://localhost:8283)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/letta-vscode-extension.git
cd letta-vscode-extension
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run compile && npm run build:webviews
```

## Configuration

1. Configure the Letta server URL in VS Code settings:
   - Open VS Code settings (Ctrl+,)
   - Search for "Letta Chat"
   - Set the "Server URL" to your Letta server address (default is http://localhost:8283)

## Development Setup

1. Start the development server for the webview UI:
```bash
npm run watch:webviews
```

2. Compile and watch for TypeScript changes:
```bash
npm run watch
```

3. Run the extension in development mode:
   - Open the project in VS Code
   - Press F5 to start debugging
   - This will open a new VS Code window with the extension loaded

4. Run Storybook for UI component development:
```bash
npm run storybook
```
This will start Storybook on http://localhost:6006

## Testing

- Unit tests: `npm test`
- Integration tests: `npm run test:integration` (requires a running Letta server)
- Lint: `npm run lint`

## Project Structure

- `src/`: Main extension code
  - `extension.ts`: Entry point for the extension
  - `services/`: Contains LettaService and ChatService
  - `panels/`: Chat panel UI integration
  - `views/`: WebView content generation

- `webviews/`: Chat interface code
  - React TypeScript components
  - Shadcn UI components in `components/ui/`
  - Storybook configuration for UI development

- `test/`: Unit and integration tests

## Architecture

The extension follows a layered architecture:

1. **UI Layer**: WebView-based chat interface built with React
2. **Service Layer**: 
   - `ChatService`: Manages conversation state and history
   - `LettaService`: Handles communication with the Letta AI server
3. **Extension Layer**: VS Code extension entry point and integration

Communication between the WebView and extension happens through message passing using the VS Code API.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.