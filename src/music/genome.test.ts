import { describe, expect, it } from 'vitest';
import { AGENT_IDS } from '../core/types';
import { applyFeedback, createFrozenState, createGenome, createPreferences, deserializeGenome, evolveGenome, serializeGenome } from './genome';

describe('musical genome', () => {
  it('creates deterministic genomes from a seed', () => {
    expect(createGenome(731)).toEqual(createGenome(731));
    expect(createGenome(731)).not.toEqual(createGenome(732));
  });

  it('keeps mutations inside listenable parameter bounds', () => {
    let genome = createGenome(42);
    const preferences = createPreferences(genome);
    const frozen = createFrozenState();
    for (let generation = 0; generation < 80; generation += 1) {
      genome = evolveGenome(genome, preferences, frozen, 0.9);
      expect(genome.tempo).toBeGreaterThanOrEqual(76);
      expect(genome.tempo).toBeLessThanOrEqual(124);
      for (const id of AGENT_IDS) {
        const gene = genome.agents[id];
        expect(gene.density).toBeGreaterThanOrEqual(0.12);
        expect(gene.density).toBeLessThanOrEqual(0.62);
        expect(gene.pattern).toHaveLength(16);
        expect(gene.pattern.some(Boolean)).toBe(true);
        expect(gene.pattern.every((step) => step === 0 || step === 1)).toBe(true);
        expect(gene.notes.every((note) => note >= -7 && note <= 17)).toBe(true);
      }
    }
  });

  it('preserves a frozen creature exactly', () => {
    const parent = createGenome(12);
    const frozen = createFrozenState();
    frozen.glint = true;
    const child = evolveGenome(parent, createPreferences(parent), frozen, 1);
    expect(child.agents.glint).toEqual(parent.agents.glint);
    expect(child.generation).toBe(1);
  });

  it('updates preference affinity and serializes safely', () => {
    const genome = createGenome(82);
    const preferences = createPreferences(genome);
    expect(applyFeedback(preferences, genome, 'halo', 1).halo.affinity).toBe(1);
    expect(applyFeedback(preferences, genome, 'halo', -1).halo.affinity).toBe(-1);
    expect(deserializeGenome(serializeGenome(genome))).toEqual(genome);
    expect(() => deserializeGenome('{"version":2}')).toThrow(/invalid/i);
  });
});
