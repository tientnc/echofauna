import './styles.css';
import { AudioEngine } from './audio/AudioEngine';
import { EvolutionEngine } from './evolution/EvolutionEngine';
import { Ecosystem } from './visuals/Ecosystem';
import { renderAgents, readAgentId } from './ui/agents';
import { template } from './ui/template';
import type { MusicalGenome } from './core/types';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('App root not found');
root.innerHTML = template;

const canvas = document.querySelector<HTMLCanvasElement>('#ecosystem')!;
const startButton = document.querySelector<HTMLButtonElement>('#start')!;
const evolveButton = document.querySelector<HTMLButtonElement>('#evolve')!;
const agentGrid = document.querySelector<HTMLDivElement>('#agent-grid')!;
const energySlider = document.querySelector<HTMLInputElement>('#energy')!;
const generationLabel = document.querySelector<HTMLElement>('#generation')!;
const beforeButton = document.querySelector<HTMLButtonElement>('#before')!;
const afterButton = document.querySelector<HTMLButtonElement>('#after')!;
const muteButton = document.querySelector<HTMLButtonElement>('#mute')!;
const changeSummary = document.querySelector<HTMLElement>('#change-summary')!;
const stageHint = document.querySelector<HTMLElement>('#stage-hint')!;

const evolution = new EvolutionEngine();
let state = evolution.snapshot();
let audio = new AudioEngine(state.current);
const ecosystem = new Ecosystem(canvas, state.current);
let started = false;
let muted = false;
let reacting = false;
ecosystem.start();

function render(): void {
  state = evolution.snapshot();
  agentGrid.innerHTML = renderAgents(state.current, state.preferences, state.frozen);
  generationLabel.textContent = String(state.current.generation);
  beforeButton.querySelector('span')!.textContent = state.current.generation === 0 ? 'Gen 0' : `Gen ${state.previous.generation}`;
  afterButton.querySelector('span')!.textContent = `Gen ${state.current.generation}`;
  beforeButton.disabled = state.current.generation === 0;
  afterButton.disabled = state.current.generation === 0;
}

async function togglePlayback(): Promise<void> {
  if (!started) {
    startButton.disabled = true;
    startButton.querySelector('span')!.textContent = 'Waking the ecosystem…';
    try {
      audio.setEventListener((event) => ecosystem.trigger(event));
      await audio.start();
      ecosystem.start();
      started = true;
      startButton.querySelector('span')!.textContent = 'Pause listening';
      startButton.querySelector('kbd')!.textContent = 'Space';
      startButton.disabled = false;
      evolveButton.disabled = false;
      stageHint.classList.add('is-active');
      document.body.classList.add('is-playing');
    } catch (error) {
      console.error(error);
      startButton.disabled = false;
      startButton.querySelector('span')!.textContent = 'Try audio again';
    }
  } else {
    audio.stop();
    ecosystem.stop();
    started = false;
    startButton.querySelector('span')!.textContent = 'Resume listening';
    document.body.classList.remove('is-playing');
  }
}

function preview(genome: MusicalGenome): void {
  audio.updateGenome(genome);
  ecosystem.updateGenome(genome);
}

startButton.addEventListener('click', () => void togglePlayback());

agentGrid.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
  if (!button) return;
  const id = readAgentId(button);
  if (!id) return;
  const action = button.dataset.action;
  if (action === 'freeze') evolution.toggleFreeze(id);
  if (action === 'like' || action === 'dislike') {
    evolution.feedback(id, action);
    reacting = true;
    evolveButton.classList.add('is-ready');
    changeSummary.textContent = action === 'like' ? `${state.current.agents[id].name} will guide the next generation.` : `${state.current.agents[id].name} will change more boldly.`;
  }
  render();
});

evolveButton.addEventListener('click', () => {
  const prior = evolution.snapshot().current;
  const next = evolution.evolve(reacting ? 0.44 : 0.56);
  preview(next);
  render();
  reacting = false;
  evolveButton.classList.remove('is-ready');
  const changed = Object.values(next.agents).filter((agent) => agent.pattern.join('') !== prior.agents[agent.id].pattern.join('')).map((agent) => agent.name);
  changeSummary.textContent = changed.length ? `Generation ${next.generation}: ${changed.join(', ')} found new behavior.` : `Generation ${next.generation}: subtle timbre and motion changes.`;
  document.querySelector('.stage-wrap')?.classList.add('just-evolved');
  setTimeout(() => document.querySelector('.stage-wrap')?.classList.remove('just-evolved'), 900);
});

energySlider.addEventListener('input', () => {
  const genome = evolution.setEnergy(Number(energySlider.value) / 100);
  preview(genome);
  generationLabel.textContent = String(genome.generation);
});

beforeButton.addEventListener('pointerdown', () => preview(evolution.snapshot().previous));
beforeButton.addEventListener('pointerup', () => preview(evolution.snapshot().current));
beforeButton.addEventListener('pointerleave', () => preview(evolution.snapshot().current));
beforeButton.addEventListener('keydown', (event) => { if (event.code === 'Space' || event.code === 'Enter') preview(evolution.snapshot().previous); });
beforeButton.addEventListener('keyup', () => preview(evolution.snapshot().current));
afterButton.addEventListener('click', () => preview(evolution.snapshot().current));

muteButton.addEventListener('click', () => {
  muted = !muted;
  audio.setVolume(muted ? 0 : 0.7);
  muteButton.setAttribute('aria-pressed', String(muted));
  muteButton.textContent = muted ? '×' : '⌁';
  muteButton.setAttribute('aria-label', muted ? 'Unmute audio' : 'Mute audio');
});

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLButtonElement)) {
    event.preventDefault();
    void togglePlayback();
  }
  if (event.key.toLowerCase() === 'e' && started) evolveButton.click();
  if (event.key.toLowerCase() === 'm') muteButton.click();
});

window.addEventListener('beforeunload', () => { audio.dispose(); ecosystem.dispose(); });
render();
