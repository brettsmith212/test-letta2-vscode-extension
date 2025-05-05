/**
 * Agent-related data transfer objects
 */

/**
 * Summary information about an agent
 */
export interface AgentSummary {
  id: string;
  name: string;
  model?: string;
}