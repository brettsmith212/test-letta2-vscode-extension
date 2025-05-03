# Claude Chat VSCode Extension

A VSCode extension that provides an AI Coding Agent powered by Claude 3.5 Sonnet, enabling intelligent code assistance and chat interactions directly within your editor.

## Features

- Interactive chat interface with Claude AI
- Code generation, analysis, and refactoring assistance
- Context-aware responses based on your workspace
- Modern, minimalist dark theme UI using Shadcn components
- Built with React TypeScript for the webview interface

## Prerequisites

- Node.js and npm installed
- VSCode version 1.60.0 or higher
- Anthropic API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/brettsmith212/test-ai-vscode-extension.git
cd test-ai-vscode-extension
```

2. Install dependencies:
```bash
npm install
```

## Development Setup

1. Configure launch.json for debugging:
   - Open the project in VSCode
   - Press F5 to start debugging
   - This will open a new VSCode window with the extension loaded

2. Run Storybook for UI development:
```bash
npm run storybook
```
This will start Storybook on http://localhost:6006

## Project Structure

- `src/`: Main extension code
  - Extension logic
  - Claude LLM integration
  - Agent tools and utilities
  - Test files for functionality verification

- `webviews/`: Chat interface code
  - React TypeScript components
  - Shadcn UI components in `components/ui/`
  - Storybook configuration and stories

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)