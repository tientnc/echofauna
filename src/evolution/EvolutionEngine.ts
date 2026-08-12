import type { AgentId, Feedback, FrozenState, MusicalGenome, PreferenceProfile } from '../core/types';
import { applyFeedback, cloneGenome, createFrozenState, createGenome, createPreferences, evolveGenome, setGenomeEnergy } from '../music/genome';

export type EvolutionSnapshot = {
  current: MusicalGenome;
  origin: MusicalGenome;
  previous: MusicalGenome;
  preferences: PreferenceProfile;
  frozen: FrozenState;
};

export class EvolutionEngine {
  private state: EvolutionSnapshot;

  constructor(seed?: number) {
    const genome = createGenome(seed);
    this.state = { current: genome, origin: cloneGenome(genome), previous: cloneGenome(genome), preferences: createPreferences(genome), frozen: createFrozenState() };
  }

  snapshot(): EvolutionSnapshot { return structuredClone(this.state); }

  feedback(id: AgentId, feedback: Feedback): void {
    this.state.preferences = applyFeedback(this.state.preferences, this.state.current, id, feedback === 'like' ? 1 : -1);
  }

  toggleFreeze(id: AgentId): void { this.state.frozen[id] = !this.state.frozen[id]; }

  evolve(strength = 0.42): MusicalGenome {
    this.state.previous = cloneGenome(this.state.current);
    this.state.current = evolveGenome(this.state.current, this.state.preferences, this.state.frozen, strength);
    return cloneGenome(this.state.current);
  }

  setEnergy(value: number): MusicalGenome {
    this.state.current = setGenomeEnergy(this.state.current, value);
    return cloneGenome(this.state.current);
  }

  reset(seed?: number): MusicalGenome {
    const genome = createGenome(seed);
    this.state = { current: genome, origin: cloneGenome(genome), previous: cloneGenome(genome), preferences: createPreferences(genome), frozen: createFrozenState() };
    return cloneGenome(genome);
  }
}
