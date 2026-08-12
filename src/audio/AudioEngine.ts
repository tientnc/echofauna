import * as Tone from 'tone';
import type { AgentId, MusicalEvent, MusicalGenome } from '../core/types';
import { eventsForStep } from '../music/events';

type EventListener = (event: MusicalEvent) => void;

export class AudioEngine {
  private genome: MusicalGenome;
  private sequence: Tone.Sequence<number> | null = null;
  private master = new Tone.Gain(0.7);
  private limiter = new Tone.Limiter(-2).toDestination();
  private reverb = new Tone.Reverb({ decay: 2.8, wet: 0.24 });
  private delay = new Tone.FeedbackDelay('8n.', 0.18);
  private instruments: Partial<Record<AgentId, Tone.ToneAudioNode>> = {};
  private listener: EventListener | null = null;
  private started = false;

  constructor(genome: MusicalGenome) {
    this.genome = structuredClone(genome);
    this.master.connect(this.limiter);
    this.reverb.connect(this.master);
    this.delay.connect(this.reverb);
  }

  setEventListener(listener: EventListener): void { this.listener = listener; }

  async start(): Promise<void> {
    if (this.started) return;
    await Tone.start();
    await this.reverb.generate();
    this.createInstruments();
    Tone.getTransport().bpm.value = this.genome.tempo;
    Tone.getTransport().timeSignature = 4;
    Tone.getTransport().loop = true;
    Tone.getTransport().loopEnd = '1m';
    this.sequence = new Tone.Sequence((time, step) => this.playStep(time, step), Array.from({ length: 16 }, (_, index) => index), '16n');
    this.sequence.start(0);
    Tone.getTransport().start('+0.08');
    this.started = true;
  }

  private createInstruments(): void {
    const pulse = new Tone.MembraneSynth({
      pitchDecay: 0.04, octaves: 5,
      envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.1 },
    }).connect(this.master);
    const drift = new Tone.MonoSynth({
      oscillator: { type: 'triangle' }, filter: { Q: 2, type: 'lowpass', rolloff: -24 },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.25, release: 0.45 },
      filterEnvelope: { attack: 0.02, decay: 0.18, sustain: 0.2, release: 0.6, baseFrequency: 90, octaves: 3 },
    }).connect(this.master);
    const glint = new Tone.Synth({
      oscillator: { type: 'sine' }, envelope: { attack: 0.008, decay: 0.12, sustain: 0.08, release: 0.65 },
    }).connect(this.delay);
    const halo = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 1.5,
      envelope: { attack: 0.2, decay: 0.5, sustain: 0.22, release: 1.8 },
    }).connect(this.reverb);
    pulse.volume.value = -8;
    drift.volume.value = -12;
    glint.volume.value = -14;
    halo.volume.value = -18;
    this.instruments = { pulse, drift, glint, halo };
  }

  private playStep(time: number, step: number): void {
    for (const event of eventsForStep(this.genome, step)) {
      const frequency = Tone.Frequency(event.note, 'midi').toFrequency();
      if (event.agentId === 'pulse') (this.instruments.pulse as Tone.MembraneSynth).triggerAttackRelease(frequency, '16n', time, event.velocity);
      if (event.agentId === 'drift') (this.instruments.drift as Tone.MonoSynth).triggerAttackRelease(frequency, '8n', time, event.velocity);
      if (event.agentId === 'glint') (this.instruments.glint as Tone.Synth).triggerAttackRelease(frequency, '16n', time, event.velocity);
      if (event.agentId === 'halo') {
        const root = Tone.Frequency(event.note, 'midi');
        (this.instruments.halo as Tone.PolySynth).triggerAttackRelease([root.toFrequency(), root.transpose(3).toFrequency(), root.transpose(7).toFrequency()], '2n', time, event.velocity * 0.68);
      }
      Tone.getDraw().schedule(() => this.listener?.(event), time);
    }
  }

  updateGenome(genome: MusicalGenome): void {
    this.genome = structuredClone(genome);
    Tone.getTransport().bpm.rampTo(genome.tempo, 0.35);
  }

  setVolume(value: number): void { this.master.gain.rampTo(Math.max(0, value), 0.08); }

  stop(): void {
    if (!this.started) return;
    Tone.getTransport().stop();
    this.sequence?.stop().dispose();
    this.sequence = null;
    Object.values(this.instruments).forEach((instrument) => instrument?.dispose());
    this.instruments = {};
    this.started = false;
  }

  dispose(): void {
    this.stop();
    Tone.getTransport().cancel();
    this.delay.dispose();
    this.reverb.dispose();
    this.master.dispose();
    this.limiter.dispose();
  }

  get isStarted(): boolean { return this.started; }
}
