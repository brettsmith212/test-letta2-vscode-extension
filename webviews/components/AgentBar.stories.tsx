import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import AgentBar from './AgentBar';
import { AgentSummary } from '../../src/types/agent';

const meta = {
  title: 'Components/AgentBar',
  component: AgentBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSelectAgent: { action: 'selected' },
    onCreateAgent: { action: 'created' },
  },
} satisfies Meta<typeof AgentBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockAgents: AgentSummary[] = [
  { id: 'agent-1', name: 'General Assistant', model: 'openai/gpt-4o-mini' },
  { id: 'agent-2', name: 'Code Expert', model: 'openai/gpt-4o' },
  { id: 'agent-3', name: 'SQL Specialist', model: 'openai/gpt-4o' },
];

export const Default: Story = {
  args: {
    agents: mockAgents,
    activeAgentId: undefined,
  },
};

export const WithSelectedAgent: Story = {
  args: {
    agents: mockAgents,
    activeAgentId: 'agent-2',
  },
};

export const EmptyAgentList: Story = {
  args: {
    agents: [],
    activeAgentId: undefined,
  },
};