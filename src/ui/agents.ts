import type { AgentId, FrozenState, MusicalGenome, PreferenceProfile } from '../core/types';

export function renderAgents(genome: MusicalGenome, preferences: PreferenceProfile, frozen: FrozenState): string {
  return Object.values(genome.agents).map((agent) => `
    <article class="agent-card ${frozen[agent.id] ? 'is-frozen' : ''}" style="--agent-hue:${agent.hue}" data-agent="${agent.id}">
      <div class="agent-heading">
        <span class="agent-glyph glyph-${agent.id}" aria-hidden="true"></span>
        <div><h3>${agent.name}</h3><p>${agent.description}</p></div>
        <button class="freeze" data-action="freeze" data-agent="${agent.id}" type="button" aria-pressed="${frozen[agent.id]}">${frozen[agent.id] ? 'Frozen' : 'Freeze'}</button>
      </div>
      <div class="mini-pattern" aria-label="${agent.name} sixteen-step pattern">
        ${agent.pattern.map((step) => `<i class="${step ? 'on' : ''}"></i>`).join('')}
      </div>
      <div class="agent-stats"><span>Density ${Math.round(agent.density * 100)}%</span><span>Affinity ${preferences[agent.id].affinity > 0 ? '+' : ''}${preferences[agent.id].affinity}</span></div>
      <div class="feedback" role="group" aria-label="Rate ${agent.name}">
        <button type="button" data-action="dislike" data-agent="${agent.id}" aria-label="Change ${agent.name}">Change</button>
        <button type="button" data-action="like" data-agent="${agent.id}" aria-label="Keep more of ${agent.name}">Keep this</button>
      </div>
    </article>
  `).join('');
}

export function readAgentId(target: HTMLElement): AgentId | null {
  const id = target.dataset.agent;
  return id === 'pulse' || id === 'drift' || id === 'glint' || id === 'halo' ? id : null;
}
