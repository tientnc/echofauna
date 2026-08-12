import type { AgentId, MusicalEvent, MusicalGenome } from '../core/types';

const roleOctave: Record<AgentId, number> = { pulse: -24, drift: -12, glint: 12, halo: 0 };

function constrainToScale(offset: number, scale: number[]): number {
  let closest = scale[0]!;
  let distance = Infinity;
  for (let octave = -2; octave <= 3; octave += 1) {
    for (const degree of scale) {
      const candidate = degree + octave * 12;
      if (Math.abs(candidate - offset) < distance) {
        closest = candidate;
        distance = Math.abs(candidate - offset);
      }
    }
  }
  return closest;
}

export function eventsForStep(genome: MusicalGenome, step: number): MusicalEvent[] {
  const chordRoot = genome.progression[Math.floor(step / 4) % genome.progression.length] ?? 0;
  return Object.values(genome.agents).flatMap((agent) => {
    if (!agent.pattern[step % 16]) return [];
    const noteOffset = agent.notes[(step + genome.generation) % agent.notes.length] ?? 0;
    const degreeOffset = genome.scale[chordRoot % genome.scale.length] ?? 0;
    return [{
      agentId: agent.id,
      step,
      note: genome.root + roleOctave[agent.id] + constrainToScale(noteOffset + degreeOffset, genome.scale),
      velocity: Math.min(1, 0.38 + agent.brightness * 0.3 + genome.energy * 0.24),
    }];
  });
}
