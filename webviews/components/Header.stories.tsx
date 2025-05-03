import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Header from "./Header";

const meta = {
  title: "Components/Header",
  component: Header,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onNewThread: () => console.log("New thread clicked"),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', background: 'var(--vscode-editor-background)' }}>
        <Story />
      </div>
    ),
  ],
};
