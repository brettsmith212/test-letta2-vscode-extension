import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ChatContainer from "./ChatContainer";

const meta = {
  title: "Components/ChatContainer",
  component: ChatContainer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ChatContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMessages = [
  { role: "user" as const, content: "Hello! How can you help me with my code?" },
  { role: "assistant" as const, content: "I can help you with various coding tasks, such as writing code, debugging, and explaining concepts. What would you like help with?" },
  { role: "user" as const, content: "Can you help me understand React hooks?" },
  { role: "assistant" as const, content: "React hooks are functions that allow you to use state and other React features in functional components. Some common hooks include:\n\n- useState: for managing state\n- useEffect: for side effects\n- useRef: for persistent mutable values\n- useContext: for consuming context\n\nWould you like me to explain any specific hook in more detail?" }
];

export const Empty: Story = {
  args: {
    messages: [],
    messageInProgress: null,
    errorMessages: [],
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px', height: '600px', background: 'var(--vscode-editor-background)' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithMessages: Story = {
  args: {
    messages: sampleMessages,
    messageInProgress: null,
    errorMessages: [],
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px', height: '600px', background: 'var(--vscode-editor-background)' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithMessageInProgress: Story = {
  args: {
    messages: sampleMessages,
    messageInProgress: { role: "assistant", content: "I'm typing a response..." },
    errorMessages: [],
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px', height: '600px', background: 'var(--vscode-editor-background)' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithError: Story = {
  args: {
    messages: sampleMessages,
    messageInProgress: null,
    errorMessages: ["An error occurred while processing your request."],
  },
  decorators: [
    (Story) => (
      <div style={{ width: '800px', height: '600px', background: 'var(--vscode-editor-background)' }}>
        <Story />
      </div>
    ),
  ],
};
