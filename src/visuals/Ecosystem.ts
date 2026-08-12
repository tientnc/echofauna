import type { AgentId, MusicalEvent, MusicalGenome } from '../core/types';

type Creature = {
  id: AgentId;
  x: number;
  y: number;
  angle: number;
  radius: number;
  phase: number;
  flare: number;
};

const IDS: AgentId[] = ['pulse', 'drift', 'glint', 'halo'];

export class Ecosystem {
  private context: CanvasRenderingContext2D;
  private genome: MusicalGenome;
  private creatures: Creature[];
  private frame = 0;
  private lastTime = performance.now();
  private running = false;
  private reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private resizeObserver: ResizeObserver;

  constructor(private canvas: HTMLCanvasElement, genome: MusicalGenome) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not supported');
    this.context = context;
    this.genome = structuredClone(genome);
    this.creatures = IDS.map((id, index) => ({ id, x: 0, y: 0, angle: index * Math.PI / 2, radius: 0, phase: index * 1.4, flare: 0 }));
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const scale = Math.min(devicePixelRatio, 2);
    this.canvas.width = Math.max(1, rect.width * scale);
    this.canvas.height = Math.max(1, rect.height * scale);
    this.context.setTransform(scale, 0, 0, scale, 0, 0);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.frame = requestAnimationFrame((time) => this.draw(time));
  }

  stop(): void { this.running = false; cancelAnimationFrame(this.frame); }
  updateGenome(genome: MusicalGenome): void { this.genome = structuredClone(genome); }

  trigger(event: MusicalEvent): void {
    const creature = this.creatures.find((item) => item.id === event.agentId);
    if (creature) creature.flare = 1;
  }

  private draw(time: number): void {
    if (!this.running) return;
    const dt = Math.min((time - this.lastTime) / 1000, 0.04);
    this.lastTime = time;
    const { width, height } = this.canvas.getBoundingClientRect();
    const ctx = this.context;
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(width, height) * 0.34;

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 1.65);
    gradient.addColorStop(0, 'rgba(30, 80, 68, .22)');
    gradient.addColorStop(0.55, 'rgba(10, 33, 31, .1)');
    gradient.addColorStop(1, 'rgba(5, 12, 13, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 1;
    for (let ring = 1; ring <= 4; ring += 1) {
      ctx.strokeStyle = `rgba(148, 227, 200, ${0.05 + ring * 0.018})`;
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius * ring / 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (const [index, creature] of this.creatures.entries()) {
      const gene = this.genome.agents[creature.id];
      const speed = (0.2 + gene.activity * 0.42 + this.genome.energy * 0.25) * (this.reducedMotion ? 0.18 : 1);
      creature.angle += dt * speed * (index % 2 ? -1 : 1);
      creature.phase += dt * (0.55 + gene.variation);
      creature.radius = maxRadius * (0.38 + index * 0.12 + Math.sin(creature.phase) * gene.variation * 0.16);
      creature.x = cx + Math.cos(creature.angle) * creature.radius;
      creature.y = cy + Math.sin(creature.angle * (1.02 + index * 0.012)) * creature.radius * (0.62 + gene.density * 0.5);
      creature.flare = Math.max(0, creature.flare - dt * 2.8);

      for (const other of this.creatures.slice(index + 1)) {
        const distance = Math.hypot(creature.x - other.x, creature.y - other.y);
        if (distance < maxRadius * 0.75) {
          ctx.strokeStyle = `hsla(${gene.hue}, 75%, 65%, ${Math.max(0, 0.12 - distance / maxRadius * 0.13)})`;
          ctx.beginPath(); ctx.moveTo(creature.x, creature.y); ctx.lineTo(other.x, other.y); ctx.stroke();
        }
      }

      const glow = 14 + creature.flare * 24;
      ctx.save();
      ctx.translate(creature.x, creature.y);
      ctx.rotate(creature.angle + Math.PI / 2);
      ctx.shadowColor = `hsl(${gene.hue} 90% 68%)`;
      ctx.shadowBlur = glow;
      ctx.fillStyle = `hsla(${gene.hue}, 82%, ${62 + creature.flare * 18}%, .96)`;
      ctx.beginPath();
      if (creature.id === 'pulse') {
        ctx.arc(0, 0, 7 + creature.flare * 6, 0, Math.PI * 2);
      } else if (creature.id === 'drift') {
        ctx.ellipse(0, 0, 12 + creature.flare * 5, 6, 0, 0, Math.PI * 2);
      } else if (creature.id === 'glint') {
        ctx.moveTo(0, -12 - creature.flare * 5); ctx.lineTo(8, 8); ctx.lineTo(-8, 8); ctx.closePath();
      } else {
        ctx.arc(0, 0, 11 + creature.flare * 4, 0, Math.PI * 2);
        ctx.arc(0, 0, 5, 0, Math.PI * 2, true);
      }
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = 'rgba(213, 248, 233, .7)';
    ctx.font = '500 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`GEN ${this.genome.generation} · ${this.genome.tempo} BPM`, cx, cy + 4);
    this.frame = requestAnimationFrame((next) => this.draw(next));
  }

  dispose(): void { this.stop(); this.resizeObserver.disconnect(); }
}
