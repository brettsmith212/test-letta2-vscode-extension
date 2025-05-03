# Integration Testing Notes

## Overview

Integration testing for VS Code extensions can be approached in multiple ways:

1. **Full VS Code Integration**: Launching a real VS Code instance (complex, requires GUI)
2. **Semi-Integration**: Testing core services interact correctly without VS Code UI
3. **Service Integration**: Verifying external services are accessible (like Letta server)

## Our Implementation

We've implemented a hybrid approach that:

1. Tests that core services (ChatService, LettaService) can be instantiated and interact
2. Verifies the Letta server is accessible with a simple HTTP request
3. Has additional mocks and tests for the VS Code APIs

This approach offers several advantages:
- Works in CI environments without GUI
- Doesn't require VS Code download
- Fast execution
- Verifies critical integration points

## Full VS Code Integration (Alternative)

A more comprehensive approach would use @vscode/test-electron to:
1. Download and launch VS Code
2. Load the extension
3. Run tests inside VS Code
4. Interact with the WebView

However, this approach has challenges:
- Requires a GUI environment (headless mode is problematic)
- Difficult to debug
- Sensitive to VS Code version changes
- Slow test execution

## Environment Requirements

- A running Letta AI server at http://localhost:8283 (or set via LETTA_SERVER_URL)
- Node.js environment

## Running Integration Tests

```bash
npm run test:integration
```

The test:
1. Verifies core services can be instantiated
2. Checks service methods exist
3. Confirms Letta server is accessible

## Future Improvements

1. Add WebView interaction testing using browser testing tools
2. Create mock Letta server for reliable testing
3. Increase test coverage for error conditions and edge cases
4. Add visual regression testing for UI components