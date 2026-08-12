import { AGENT_IDS, type AgentGene, type AgentId, type FrozenState, type MusicalGenome, type PreferenceProfile } from '../core/types';
import { clamp, gaussian, mulberry32, pick, type Random } from '../core/random';

const SCALE = [0, 2, 3, 5, 7, 9, 10];
const PROGRESSIONS = [[0, 3, 5, 4], [0, 5, 3, 4], [0, 4, 3, 5], [0, 3, 4, 3]];

const META: Record<AgentId, Pick<AgentGene, 'name' | 'description' | 'hue'>> = {
  pulse: { name: 'Pulse', description: 'Orbits make the heartbeat', hue: 18 },
  drift: { name: 'Drift', description: 'Low crossings bend the roots', hue: 168 },
  glint: { name: 'Glint', description: 'Darts between melodic stars', hue: 48 },
  halo: { name: 'Halo', description: 'Alignment blooms into harmony', hue: 272 },
};

const basePatterns: Record<AgentId, number[][]> = {
  pulse: [[1,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0], [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0]],
  drift: [[1,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0], [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0]],
  glint: [[0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0], [0,1,0,0,0,0,1,0,0,1,0,0,0,0,1,0]],
  halo: [[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0]],
};

const baseNotes: Record<AgentId, number[]> = {
  pulse: [0, 0, 7, 0], drift: [0, 0, 4, 3], glint: [7, 9, 5, 12, 10, 7], halo: [0, 3, 5, 4],
};

function makeAgent(id: AgentId, random: Random): AgentGene {
  const pattern = [...pick(basePatterns[id], random)];
  return {
    id, ...META[id], pattern,
    notes: [...baseNotes[id]],
    density: pattern.reduce((sum, value) => sum + value, 0) / pattern.length,
    activity: 0.72 + random() * 0.18,
    brightness: id === 'drift' ? 0.28 : id === 'halo' ? 0.48 : 0.68,
    variation: 0.18 + random() * 0.18,
  };
}

export function createGenome(seed = Math.floor(Math.random() * 2 ** 31)): MusicalGenome {
  const random = mulberry32(seed);
  const agents = Object.fromEntries(AGENT_IDS.map((id) => [id, makeAgent(id, random)])) as Record<AgentId, AgentGene>;
  return {
    version: 1, seed, generation: 0, tempo: 92 + Math.floor(random() * 9), energy: 0.56,
    root: pick([48, 50, 53, 55], random), scale: [...SCALE], progression: [...pick(PROGRESSIONS, random)], agents,
  };
}

export function cloneGenome(genome: MusicalGenome): MusicalGenome {
  return structuredClone(genome);
}

export function createPreferences(genome: MusicalGenome): PreferenceProfile {
  return Object.fromEntries(AGENT_IDS.map((id) => {
    const gene = genome.agents[id];
    return [id, { affinity: 0, preferredDensity: gene.density, preferredBrightness: gene.brightness, preferredVariation: gene.variation }];
  })) as PreferenceProfile;
}

export function createFrozenState(): FrozenState {
  return { pulse: false, drift: false, glint: false, halo: false };
}

function mutatePattern(pattern: number[], density: number, strength: number, random: Random): number[] {
  const next = pattern.map((step, index) => {
    if (index === 0 && density > 0.2) return step || (random() < 0.7 ? 1 : 0);
    return random() < strength * 0.35 ? 1 - step : step;
  });
  const target = Math.round(clamp(density, 0.12, 0.62) * next.length);
  while (next.reduce((a, b) => a + b, 0) < target) next[Math.floor(random() * next.length)] = 1;
  while (next.reduce((a, b) => a + b, 0) > target) next[1 + Math.floor(random() * (next.length - 1))] = 0;
  return next;
}

export function evolveGenome(
  parent: MusicalGenome,
  preferences: PreferenceProfile,
  frozen: FrozenState,
  mutationStrength = 0.42,
): MusicalGenome {
  const seed = (parent.seed * 1664525 + 1013904223 + parent.generation) >>> 0;
  const random = mulberry32(seed);
  const child = cloneGenome(parent);
  child.seed = seed;
  child.generation += 1;
  child.tempo = Math.round(clamp(parent.tempo + gaussian(random) * 3 * mutationStrength, 76, 124));

  for (const id of AGENT_IDS) {
    if (frozen[id]) continue;
    const gene = child.agents[id];
    const pref = preferences[id];
    const pull = clamp(0.14 + Math.max(pref.affinity, 0) * 0.08, 0.08, 0.34);
    gene.density = clamp(gene.density + (pref.preferredDensity - gene.density) * pull + gaussian(random) * 0.12 * mutationStrength, 0.12, 0.62);
    gene.brightness = clamp(gene.brightness + (pref.preferredBrightness - gene.brightness) * pull + gaussian(random) * 0.14 * mutationStrength, 0.1, 0.95);
    gene.variation = clamp(gene.variation + (pref.preferredVariation - gene.variation) * pull + gaussian(random) * 0.1 * mutationStrength, 0.06, 0.72);
    gene.pattern = mutatePattern(gene.pattern, gene.density, mutationStrength + Math.max(-pref.affinity, 0) * 0.05, random);
    gene.notes = gene.notes.map((note) => random() < mutationStrength * gene.variation ? clamp(note + pick([-2, 2, 3, -3], random), -7, 17) : note);
  }
  return child;
}

export function applyFeedback(profile: PreferenceProfile, genome: MusicalGenome, id: AgentId, direction: 1 | -1): PreferenceProfile {
  const next = structuredClone(profile);
  const target = next[id];
  const gene = genome.agents[id];
  target.affinity = clamp(target.affinity + direction, -4, 4);
  const rate = direction > 0 ? 0.35 : -0.18;
  target.preferredDensity = clamp(target.preferredDensity + (gene.density - target.preferredDensity) * rate, 0.12, 0.62);
  target.preferredBrightness = clamp(target.preferredBrightness + (gene.brightness - target.preferredBrightness) * rate, 0.1, 0.95);
  target.preferredVariation = clamp(target.preferredVariation + (gene.variation - target.preferredVariation) * rate, 0.06, 0.72);
  return next;
}

export function setGenomeEnergy(genome: MusicalGenome, energy: number): MusicalGenome {
  const next = cloneGenome(genome);
  next.energy = clamp(energy, 0, 1);
  next.tempo = Math.round(82 + next.energy * 34);
  return next;
}

export function serializeGenome(genome: MusicalGenome): string {
  return JSON.stringify(genome);
}

export function deserializeGenome(value: string): MusicalGenome {
  const parsed = JSON.parse(value) as MusicalGenome;
  if (parsed.version !== 1 || !AGENT_IDS.every((id) => parsed.agents[id]?.pattern.length === 16)) {
    throw new Error('Unsupported or invalid musical genome');
  }
  return parsed;
}
