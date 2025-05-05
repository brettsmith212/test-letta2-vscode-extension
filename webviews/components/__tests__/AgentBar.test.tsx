import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
// Mock cn function to avoid @/lib/utils dependencies
vi.mock('../../../src/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' ')
}));

import AgentBar from '../AgentBar';
import { AgentSummary } from '../../../src/types/agent';

// Mock the Button component to avoid @/lib/utils import issues
vi.mock('../ui/button', () => ({
  Button: ({ children, onClick, type, variant, size, disabled }: any) => (
    <button 
      onClick={onClick} 
      type={type || 'button'} 
      disabled={disabled}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  )
}));

describe('AgentBar Component', () => {
  const mockAgents: AgentSummary[] = [
    { id: 'agent-1', name: 'Test Agent 1', model: 'model-1' },
    { id: 'agent-2', name: 'Test Agent 2', model: 'model-2' }
  ];

  const mockSelectAgent = vi.fn();
  const mockCreateAgent = vi.fn();

  beforeEach(() => {
    // Reset mock functions before each test
    mockSelectAgent.mockReset();
    mockCreateAgent.mockReset();
  });

  it('renders agent dropdown with available agents', () => {
    render(
      <AgentBar
        agents={mockAgents}
        onSelectAgent={mockSelectAgent}
        onCreateAgent={mockCreateAgent}
      />
    );

    // Check that dropdown is rendered
    const dropdown = screen.getByRole('combobox');
    expect(dropdown).toBeInTheDocument();

    // Check that all agents are in the dropdown
    mockAgents.forEach(agent => {
      expect(screen.getByText(agent.name)).toBeInTheDocument();
    });

    // Check that "Create new agent..." option exists
    expect(screen.getByText('Create new agent...')).toBeInTheDocument();
  });

  it('selects an agent when one is chosen from dropdown', () => {
    render(
      <AgentBar
        agents={mockAgents}
        onSelectAgent={mockSelectAgent}
        onCreateAgent={mockCreateAgent}
      />
    );

    // Select an agent from the dropdown
    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: 'agent-1' } });

    // Check that onSelectAgent was called with the right agent id
    expect(mockSelectAgent).toHaveBeenCalledWith('agent-1');
  });

  it('shows the create form when "Create new agent..." is selected', () => {
    render(
      <AgentBar
        agents={mockAgents}
        onSelectAgent={mockSelectAgent}
        onCreateAgent={mockCreateAgent}
      />
    );

    // Select "Create new agent..." from the dropdown
    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: 'create-new' } });

    // Check that the form is visible
    expect(screen.getByText('Create new agent')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Agent name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Model (optional)')).toBeInTheDocument();
    
    // Check for form buttons
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('creates an agent when the form is submitted', () => {
    render(
      <AgentBar
        agents={mockAgents}
        onSelectAgent={mockSelectAgent}
        onCreateAgent={mockCreateAgent}
      />
    );

    // Select "Create new agent..." from the dropdown
    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: 'create-new' } });

    // Fill in the form
    const nameInput = screen.getByPlaceholderText('Agent name');
    const modelInput = screen.getByPlaceholderText('Model (optional)');
    
    fireEvent.change(nameInput, { target: { value: 'New Test Agent' } });
    fireEvent.change(modelInput, { target: { value: 'test-model' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Create' });
    fireEvent.click(submitButton);

    // Check that onCreateAgent was called with the right parameters
    expect(mockCreateAgent).toHaveBeenCalledWith('New Test Agent', 'test-model');
  });

  it('cancels create form when cancel button is clicked', () => {
    render(
      <AgentBar
        agents={mockAgents}
        onSelectAgent={mockSelectAgent}
        onCreateAgent={mockCreateAgent}
      />
    );

    // Select "Create new agent..." from the dropdown
    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: 'create-new' } });

    // Click the cancel button
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    // Form should be hidden, dropdown should be visible again
    expect(screen.queryByText('Create new agent')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows the active agent as selected in dropdown', () => {
    render(
      <AgentBar
        agents={mockAgents}
        activeAgentId="agent-2"
        onSelectAgent={mockSelectAgent}
        onCreateAgent={mockCreateAgent}
      />
    );

    // Get the dropdown and check its value
    const dropdown = screen.getByRole('combobox') as HTMLSelectElement;
    expect(dropdown.value).toBe('agent-2');
  });

  it('disables the Create button when agent name is empty', () => {
    render(
      <AgentBar
        agents={mockAgents}
        onSelectAgent={mockSelectAgent}
        onCreateAgent={mockCreateAgent}
      />
    );

    // Select "Create new agent..." from the dropdown
    const dropdown = screen.getByRole('combobox');
    fireEvent.change(dropdown, { target: { value: 'create-new' } });

    // Submit button should be disabled initially
    const submitButton = screen.getByRole('button', { name: 'Create' });
    expect(submitButton).toBeDisabled();

    // Enter a name
    const nameInput = screen.getByPlaceholderText('Agent name');
    fireEvent.change(nameInput, { target: { value: 'Test' } });
    
    // Button should be enabled now
    expect(submitButton).not.toBeDisabled();

    // Clear the name
    fireEvent.change(nameInput, { target: { value: '' } });
    
    // Button should be disabled again
    expect(submitButton).toBeDisabled();
  });
});