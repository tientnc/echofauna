export const AGENT_IDS = ['pulse', 'drift', 'glint', 'halo'] as const;
export type AgentId = (typeof AGENT_IDS)[number];

export type AgentGene = {
  id: AgentId;
  name: string;
  description: string;
  hue: number;
  density: number;
  activity: number;
  brightness: number;
  variation: number;
  pattern: number[];
  notes: number[];
};

export type MusicalGenome = {
  version: 1;
  seed: number;
  generation: number;
  tempo: number;
  energy: number;
  root: number;
  scale: number[];
  progression: number[];
  agents: Record<AgentId, AgentGene>;
};

export type PreferenceProfile = Record<AgentId, {
  affinity: number;
  preferredDensity: number;
  preferredBrightness: number;
  preferredVariation: number;
}>;

export type FrozenState = Record<AgentId, boolean>;
export type Feedback = 'like' | 'dislike';

export type MusicalEvent = {
  agentId: AgentId;
  step: number;
  note: number;
  velocity: number;
};
