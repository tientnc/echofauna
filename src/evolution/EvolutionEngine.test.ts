import { describe, expect, it } from 'vitest';
import { EvolutionEngine } from './EvolutionEngine';

describe('EvolutionEngine', () => {
  it('tracks origin, previous and current generations without shared references', () => {
    const engine = new EvolutionEngine(901);
    const origin = engine.snapshot();
    engine.feedback('pulse', 'like');
    engine.toggleFreeze('drift');
    engine.evolve();
    const next = engine.snapshot();
    expect(next.origin).toEqual(origin.origin);
    expect(next.previous.generation).toBe(0);
    expect(next.current.generation).toBe(1);
    expect(next.frozen.drift).toBe(true);
    expect(next.preferences.pulse.affinity).toBe(1);
    next.current.agents.pulse.pattern[0] = 99;
    expect(engine.snapshot().current.agents.pulse.pattern[0]).not.toBe(99);
  });
});
