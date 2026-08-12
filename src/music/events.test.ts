import { describe, expect, it } from 'vitest';
import { createGenome } from './genome';
import { eventsForStep } from './events';

describe('musical events', () => {
  it('only emits events when an agent acts and keeps pitch in its role range', () => {
    const genome = createGenome(27);
    const events = Array.from({ length: 16 }, (_, step) => eventsForStep(genome, step)).flat();
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((event) => genome.agents[event.agentId].pattern[event.step] === 1)).toBe(true);
    expect(events.every((event) => event.note >= 24 && event.note <= 84)).toBe(true);
    expect(events.every((event) => event.velocity > 0 && event.velocity <= 1)).toBe(true);
  });
});
