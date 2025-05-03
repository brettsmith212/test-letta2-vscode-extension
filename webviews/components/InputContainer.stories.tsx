import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import InputContainer from "./InputContainer";

const meta = {
  title: "Components/InputContainer",
  component: InputContainer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof InputContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSend: (text) => console.log("Message sent:", text),
    isProcessing: false,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', background: 'var(--vscode-editor-background)' }}>
        <Story />
      </div>
    ),
  ],
};

export const Processing: Story = {
  args: {
    onSend: (text) => console.log("Message sent:", text),
    isProcessing: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', background: 'var(--vscode-editor-background)' }}>
        <Story />
      </div>
    ),
  ],
};
