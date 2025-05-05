# Implementation Plan

## Overview

LettaService unconditionally creates an agent on first use; every new VS‑Code “thread” clears LettaService state, so a new agent is created again.

We need a single creation flow and a UX that lets the user pick an existing agent or “Create new…”.

## 0 – Project Scaffolding & Types

- [x] **Step 0.1: Define shared Agent types**
  - **Task**: Create/extend a `src/types/agent.ts` module with `AgentSummary { id: string; name: string; model?: string }`.
  - **Description**: A single place for agent DTOs avoids stringly‑typed objects between host & UI.
  - **Files**:
    - `src/types/agent.ts`: new file.
    - `src/types/index.ts`: export `AgentSummary`.
  - **Step Dependencies**: none
  - **User Instructions**: N/A

## 1 – Backend : Agent Management

- [x] **Step 1.1: Add list & select logic in LettaService**

  - **Task**:
    1. Add private `_activeAgentId` (rename from `_agentId`) and `_loadAgents()` that calls `this._client.agents.list()`.
    2. Public methods: `listAgents(): Promise<AgentSummary[]>`, `selectAgent(id: string)`, `createAgent(opts)`.
  - **Description**: Core API the extension host & tests will depend on.
  - **Files** (≤10):
    - `src/services/LettaService.ts`: extend class.
    - `src/types/agent.ts`: import.
  - **Step Dependencies**: Step 0.1
  - **User Instructions**: N/A

- [x] **Step 1.2: Persist active agent**

  - **Task**: Save the chosen agent id into `ExtensionContext.globalState` (`context.globalState.update('letta.activeAgent', id)`); load on start.
  - **Description**: Keeps user preference across VS Code restarts.
  - **Files**:
    - `src/services/LettaService.ts` (constructor & selectAgent).
    - `src/panels/ChatPanel.ts`: pass the `context` into LettaService or expose setter.
  - **Step Dependencies**: Step 1.1
  - **User Instructions**: N/A

- [x] **Step 1.3: Extension‑host message handlers**

  - **Task**: In `ChatPanel` `onDidReceiveMessage`, add handlers for `listAgents`, `selectAgent`, `createAgent`.
  - **Description**: Bridges UI requests to LettaService.
  - **Files**:
    - `src/panels/ChatPanel.ts`
  - **Step Dependencies**: Step 1.1
  - **User Instructions**: N/A

- [x] **Step 1.4: Emit replies to web‑view**
  - **Task**: Use `webview.postMessage` to send `agentList`, `agentCreated`, `agentSelected` events.
  - **Description**: Completes the round‑trip communication.
  - **Files**:
    - `src/panels/ChatPanel.ts`
  - **Step Dependencies**: Step 1.3
  - **User Instructions**: N/A

## 2 – Frontend : Data wiring

- [x] **Step 2.1: VSCodeContext – expose agent API**

  - **Task**: Extend `VSCodeContext` typing for new commands.
  - **Description**: Type‑safe `postMessage` wrappers in React.
  - **Files**:
    - `webviews/VSCodeContext.tsx`
  - **Step Dependencies**: Step 1.4
  - **User Instructions**: N/A

- [x] **Step 2.2: Chat.tsx – fetch & store agent list**
  - **Task**:
    1. Add `agents` & `activeAgentId` state.
    2. On mount send `{ command: 'listAgents' }`.
    3. Handle `agentList`, `agentCreated`, `agentSelected` events in `handleMessage`.
  - **Description**: Makes the UI aware of agents.
  - **Files**:
    - `webviews/Chat.tsx`
  - **Step Dependencies**: Step 2.1
  - **User Instructions**: N/A

## 3 – Frontend : UI Components

- [x] **Step 3.1: Create AgentBar component**

  - **Task**: New component in `webviews/components/AgentBar.tsx` showing Radix `Select` (or custom) with options + “Create new agent…”.
  - **Description**: Visual selector placed above existing Header.
  - **Files**:
    - `webviews/components/AgentBar.tsx`
    - `webviews/components/AgentBar.stories.tsx` (storybook)
  - **Step Dependencies**: Step 2.2
  - **User Instructions**: N/A

- [x] **Step 3.2: Integrate AgentBar into Chat layout**

  - **Task**: In `Chat.tsx` wrap `<Header>` and `<AgentBar>` inside a column.
  - **Description**: Ensures consistent placement & styling.
  - **Files**:
    - `webviews/Chat.tsx`
    - `webviews/index.css` (tiny spacing tweak)
  - **Step Dependencies**: Step 3.1
  - **User Instructions**: N/A

- [x] **Step 3.3: Create “New agent” inline form**
  - **Task**: If user selects “Create new…”, replace dropdown with input + confirm/cancel buttons, then send `createAgent`.
  - **Description**: Minimises pop‑ups; matches VS Code design.
  - **Files**:
    - `webviews/components/AgentBar.tsx`
  - **Step Dependencies**: Step 3.1
  - **User Instructions**: N/A

## 4 – Chat Flow Adjustments

- [x] **Step 4.1: Disable chat until agent selected**

  - **Task**: `InputContainer` receives `disabled` prop when `activeAgentId` is null; UI shows subtle hint.
  - **Description**: Prevents accidental API calls.
  - **Files**:
    - `webviews/components/InputContainer.tsx`
    - `webviews/Chat.tsx`
  - **Step Dependencies**: Step 2.2
  - **User Instructions**: N/A

- [x] **Step 4.2: Pass agent id to LettaService**
  - **Task**: Modify `LettaService.sendMessage` / `createMessageStream` to throw if no agent selected; `ChatPanel` must call `selectAgent` before first message.
  - **Description**: Guarantees backend consistency.
  - **Files**:
    - `src/services/LettaService.ts`
    - `src/panels/ChatPanel.ts`
  - **Step Dependencies**: Step 1.3, Step 2.2
  - **User Instructions**: N/A

## 5 – Tests

- [ ] **Step 5.1: Unit tests for LettaService agent methods**

  - **Task**: Mock SDK `agents.list` & `agents.create`, assert caching & persistence.
  - **Description**: Protects core logic.
  - **Files**:
    - `test/lettaService.agent.test.ts`
  - **Step Dependencies**: Step 1.1

- [ ] **Step 5.2: React test for AgentBar interactions**

  - **Task**: Use testing‑library to render, select, and create.
  - **Description**: Prevents regressions in UI.
  - **Files**:
    - `webviews/components/__tests__/AgentBar.test.tsx`
  - **Step Dependencies**: Step 3.1

- [ ] **Step 5.3: Adjust integration test to include agent flow**
  - **Task**: Stub `client.agents.list()` in `integration.test.ts` so ChatService call chain works without real server.
  - **Description**: End‑to‑end sanity.
  - **Files**:
    - `test/integration.test.ts`
  - **Step Dependencies**: Step 1.1, Step 2.2

## 6 – Cleanup & Docs

- [ ] **Step 6.1: Update README & configuration schema**
  - **Task**: Document new behaviour, optional default agent setting, & screenshot of selector bar.
  - **Files**:
    - `README.md`
    - `package.json` (`contributes.configuration.properties`)
  - **Step Dependencies**: All previous
  - **User Instructions**: N/A
