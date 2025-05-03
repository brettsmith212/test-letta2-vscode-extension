# Integration Testing Notes

## Overview

Integration testing for VS Code extensions is complex because it requires:

1. Launching a real VS Code instance
2. Installing the extension under test
3. Automating UI interactions
4. Detecting success/failure conditions

## Implementation Plan

A full implementation would use the @vscode/test-electron package to:

1. Download and launch VS Code
2. Load the extension
3. Run a test script that executes commands like `letta-chat.openChat`
4. Verify the WebView panel opens correctly
5. Send a test message to the Letta AI server
6. Verify a response is received

## Environment Requirements

- A running Letta AI server at http://localhost:8283
- GUI environment for VS Code to run in
- Network access to download VS Code if not cached

## Execution

A real implementation would run with:

```bash
npm run test:integration
```

And would use the following configuration in package.json:

```json
"test:integration": "LETTA_SERVER_URL=http://localhost:8283 vitest run -c vitest.config.ts --run test/integration.test.ts"
```

## Next Steps

1. Build a CI pipeline that supports GUI testing
2. Create robust mocks for VS Code APIs
3. Set up reliable test environments with Letta AI server