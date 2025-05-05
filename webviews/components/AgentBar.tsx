import React, { useState } from 'react';
import { AgentSummary } from '../../src/types/agent';
import { Button } from './ui/button';
import { cn } from '../../src/lib/utils';

interface AgentBarProps {
  agents: AgentSummary[];
  activeAgentId?: string;
  onSelectAgent: (agentId: string) => void;
  onCreateAgent: (name: string, model?: string) => void;
}

const AgentBar: React.FC<AgentBarProps> = ({
  agents,
  activeAgentId,
  onSelectAgent,
  onCreateAgent,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentModel, setNewAgentModel] = useState('');

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'create-new') {
      setShowCreateForm(true);
    } else {
      onSelectAgent(value);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAgentName.trim()) {
      onCreateAgent(newAgentName.trim(), newAgentModel.trim() || undefined);
      setNewAgentName('');
      setNewAgentModel('');
      setShowCreateForm(false);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setNewAgentName('');
    setNewAgentModel('');
  };

  if (showCreateForm) {
    return (
      <div className="agent-bar">
        <form onSubmit={handleCreateSubmit} className="agent-form flex flex-col gap-2">
          <div className="agent-form-header text-sm font-medium mb-1">Create new agent</div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Agent name"
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
              className="agent-input flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors"
              autoFocus
              required
            />
            <input
              type="text"
              placeholder="Model (optional)"
              value={newAgentModel}
              onChange={(e) => setNewAgentModel(e.target.value)}
              className="agent-input flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors"
            />
          </div>
          <div className="flex justify-end gap-2 mt-1">
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!newAgentName.trim()}>
              Create
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="agent-bar border-b">
      <div className="flex items-center">
        <div className="agent-bar-label text-sm font-medium mr-2">Agent:</div>
        <div className="relative">
          <select
            value={activeAgentId || ''}
            onChange={handleSelectChange}
            className={cn(
              "agent-select h-9 w-[240px] rounded-md border pr-8 pl-3 py-2 text-sm shadow-sm",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "appearance-none" // Remove default styling
            )}
          >
            <option value="" disabled>
              Select an agent...
            </option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
            <option value="create-new">Create new agent...</option>
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className="h-4 w-4 opacity-70"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentBar;