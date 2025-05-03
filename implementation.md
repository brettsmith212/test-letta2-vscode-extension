# Implementation Plan (Granular + Test‑Driven)

## IMPORTANT
- After completing each step, update your memory.md with important things you have learned and would be useful to remember for the future. Also remove any old notes that are no longer relevant.
- Stop after each stop and wait for me to review your work before moving on to the next step.

## 0 – Testing Framework Bootstrapping
- [x] **Step 0‑1: Add Vitest Test Harness**
  - **Task**: Install **Vitest** to run unit tests on extension code.
  - **Description**: Establishes a fast TypeScript‑friendly test loop for every subsequent step.
  - **Files**:
    - `package.json`:
      - Add devDeps `"vitest": "^1.5.0", "ts-node": "^10.9.2"`.
      - Add script `"test": "vitest run"`.
    - `vitest.config.ts`: Minimal config extending tsconfig paths.
  - **Step Dependencies**: _None_
  - **User Instructions**:
    1. `npm install`
    2. Run `npm test` (should report “No tests found” but succeed).

- [ ] **Step 0‑2: Baseline Extension Activation Test**
  - **Task**: Create first test to ensure the extension activates and registers its command (current IDs).
  - **Description**: Provides safety net before we rename anything.
  - **Files**:
    - `test/activation.test.ts`:
      ```ts
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
      ```
  - **Step Dependencies**: Step 0‑1
  - **User Instructions**: Run `npm test` – tests should pass.

## 1 – Rename & Dependency Swap (Incremental)
- [ ] **Step 1‑1: Introduce Letta SDK Without Removal**
  - **Task**: Add `@letta-ai/letta-client` to dependencies while keeping Anthropic for compile continuity.
  - **Description**: Allows code to import new SDK before CLI swap.
  - **Files**:
    - `package.json`: Add `"@letta-ai/letta-client": "^0.1.x"`.
  - **Step Dependencies**: Baseline tests pass.
  - **User Instructions**: `npm install` & run compile (`npm run compile`) – should still succeed.

- [ ] **Step 1‑2: Rename Commands & Manifest**
  - **Task**: Change command IDs, extension name, and display strings.
  - **Description**: Minimal manifest update, but does **not** yet delete Anthropic.
  - **Files**:
    - `package.json`
      - `"name": "letta-chat"`, `"displayName": "Letta Chat"`.
      - Command ID → `"letta-chat.openChat"`.
      - Add activation event `"onCommand:letta-chat.openChat"`.
    - `src/extension.ts`: Update `registerCommand` ID.
  - **Step Dependencies**: Step 1‑1
  - **User Instructions**:
    1. Run `npm run compile`.
    2. **Update activation test** (`test/activation.test.ts`): replace ID with new one.
    3. `npm test` – should pass.

## 2 – Service Layer with Letta (Test‑First)
- [ ] **Step 2‑1: Create Skeleton `LettaService`**
  - **Task**: Implement class with constructor & stub methods returning placeholders.
  - **Description**: Establish interface contract to allow other code to import.
  - **Files**:
    - `src/services/LettaService.ts`: basic class with `sendMessage` returning `"pong"`.
    - `test/lettaService.test.ts`: unit test asserting stub reply.
  - **Step Dependencies**: Step 1‑2
  - **User Instructions**: `npm test` – new test should pass.

- [ ] **Step 2‑2: Implement Real LettaClient Logic**
  - **Task**: Flesh out `LettaService` to:
    1. Read server URL from config.
    2. Instantiate `LettaClient`.
    3. `initAgent()` that creates agent via SDK.
    4. `sendMessage` that posts message & returns assistant text.
  - **Description**: Enables genuine backend comms (non‑streaming for now).
  - **Files**:
    - `src/services/LettaService.ts`: fill in logic (≤200 LOC).
    - `test/lettaService.test.ts`: mock `@letta-ai/letta-client` to simulate API; assert call counts & reply.
  - **Step Dependencies**: Step 2‑1
  - **User Instructions**:
    - Run `npm test` (unit tests use mock, no server needed).
    - Optionally `npx vitest --run` for coverage.

## 3 – ChatService Refactor
- [ ] **Step 3‑1: Strip Anthropic Imports**
  - **Task**: Remove Anthropic import lines; add TODO for future deletion of devDep.
  - **Description**: Prepare file for rewrite without compile break (still returns dummy).
  - **Files**:
    - `src/services/ChatService.ts`: comment/remove `import Anthropic ...`.
  - **Step Dependencies**: Step 2‑2
  - **User Instructions**: `npm run compile` – should compile using old logic (we keep unused variables temporarily).

- [ ] **Step 3‑2: Replace Implementation with LettaService**
  - **Task**: Rewrite `ChatService` to wrap a singleton `LettaService`.
  - **Description**: Keeps public API used by ChatPanel.
  - **Files**:
    - `src/services/ChatService.ts`:
      - Create `const letta = new LettaService(...)`.
      - Methods `sendMessage`, `createMessageStream`, `cancelCurrentStream` proxy to LettaService.
      - Delete tool‑handling functions.
    - `test/chatService.test.ts`: Unit tests mocking `LettaService`.
  - **Step Dependencies**: Step 3‑1
  - **User Instructions**: `npm test` – all unit tests (ChatService + LettaService + activation) pass.

## 4 – ChatPanel Simplification
- [ ] **Step 4‑1: Remove Tool‑Related Code (Compile Pass)**
  - **Task**: Delete `_pendingCommands`, tool loops, and references to `fileTools`/`terminalTools`.
  - **Description**: Minimizes diff while still compiling; UI still echoes.
  - **Files**:
    - `src/panels/ChatPanel.ts`: prune ~150 LOC; ensure `_handleSendMessage` now just posts user message and awaits `ChatService.sendMessage`.
  - **Step Dependencies**: Step 3‑2
  - **User Instructions**:
    1. `npm run compile` – should succeed.
    2. Run `npm test` (no unit tests for panel yet, but existing tests pass).

- [ ] **Step 4‑2: Add ChatPanel Unit Test (Mock Webview)**
  - **Task**: Use Vitest’s `vi.fn()` to mock VSCode Webview & ChatService, asserting message flow.
  - **Description**: Regression guard for further UI changes.
  - **Files**:
    - `test/chatPanel.test.ts`:
      - Mock `vscode` APIs (webview, panel).
      - Instantiate `ChatPanel.getInstance` and simulate `sendMessage` message; expect that ChatService called with user text and webview `postMessage` called with assistant reply.
  - **Step Dependencies**: Step 4‑1
  - **User Instructions**: `npm test` – new panel test passes.

## 5 – Delete Obsolete Tool Modules
- [ ] **Step 5‑1: Remove `tools` Directory**
  - **Task**: Delete `src/tools/fileTools.ts`, `src/tools/terminalTools.ts` and their exports.
  - **Description**: Completes migration away from VSCode‑side tooling.
  - **Files**:
    - Delete the two tool files.
  - **Step Dependencies**: Step 4‑2 ensures no remaining imports.
  - **User Instructions**:
    - `npm run compile` – must still succeed.
    - `npm test` – all tests green.

## 6 – Configuration Update
- [ ] **Step 6‑1: Replace API Key Setting with Server URL**
  - **Task**: Modify manifest & LettaService to read new setting.
  - **Description**: Exposes flexibility without requiring env vars.
  - **Files**:
    - `package.json` (`contributes.configuration`):
      ```json
      "lettaChat.serverUrl": {
        "type": "string",
        "default": "http://localhost:8283",
        "description": "Base URL of the Letta server"
      }
      ```
    - `src/services/LettaService.ts`: read setting with fallback.
    - `test/config.test.ts`: mock `vscode.workspace.getConfiguration` to assert default.
  - **Step Dependencies**: Step 2‑2
  - **User Instructions**: `npm test`.

## 7 – Dependency Cleanup
- [ ] **Step 7‑1: Remove Anthropic Packages & DevDeps**
  - **Task**: Delete `@anthropic-ai/sdk` from deps and any unused types.
  - **Description**: Finalize slimming of node_modules.
  - **Files**:
    - `package.json`: remove dependency; run `npm prune`.
  - **Step Dependencies**: Step 5‑1 (Anthropic no longer referenced).
  - **User Instructions**:
    - `npm install`.
    - `npm run compile` & `npm test`.

## 8 – Integration Smoke Test
- [ ] **Step 8‑1: VSCode CLI Integration Test**
  - **Task**: Use `@vscode/test-cli` to launch an Extension Development Host and programmatically send a chat message to ensure runtime path works.
  - **Description**: End‑to‑end guard; can be slower so separate npm script.
  - **Files**:
    - `test/integration.test.ts`: uses `runTests` API to open workspace, execute `letta-chat.openChat`, and assert no unhandled errors (screenshot optional).
    - `package.json`: add script `"test:integration": "vitest run -c vitest.config.ts --run test/integration.test.ts"`.
  - **Step Dependencies**: Previous steps merged.
  - **User Instructions**:
    1. Ensure Docker Letta server running.
    2. `npm run test:integration` (may take ~1 min).

## 9 – Documentation
- [ ] **Step 9‑1: Update README & Source Comments**
  - **Task**: Rewrite README with setup, dev & test instructions, remove Claude notes.
  - **Description**: Completes migration deliverables.
  - **Files**:
    - `README.md`
    - Header comments in `LettaService.ts`
  - **Step Dependencies**: All previous steps done.
  - **User Instructions**: Review README preview in VSCode to ensure formatting.

---

### Summary

This refined plan interleaves **incremental code changes** with **unit and integration tests** to guard behavior at every stage:

1. **Testing foundation** (Vitest) before any refactor.
2. Gradual **dependency introduction** and **manifest rename**.
3. **LettaService** built and unit‑tested in isolation, then integrated into ChatService.
4. **ChatPanel** simplified and covered by tests.
5. Complete **removal of legacy tooling** and Anthropic packages.
6. **Configuration** re‑wired with its own test.
7. **Integration smoke test** ensures VS Code‑runtime compatibility.
8. Final **docs** polish.

Each step is atomic, touches ≤10 files, and includes clear user commands to run tests, guaranteeing a safe, test‑driven migration from Claude to Letta. ``````
