export const template = `
  <main class="shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="EchoFauna home">
        <span class="brand-mark" aria-hidden="true"></span>
        <span>EchoFauna <em>LAB 01</em></span>
      </a>
      <div class="header-actions">
        <span class="status"><i></i> evolving locally</span>
        <button class="icon-button" id="mute" type="button" aria-label="Mute audio" aria-pressed="false">⌁</button>
      </div>
    </header>

    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow">A living musical ecosystem</p>
        <h1 id="hero-title">Shape a song<br><span>by shaping life.</span></h1>
        <p class="lede">Four creatures turn motion into rhythm, melody, roots, and harmony. Keep what moves you. Evolve the rest.</p>
        <button class="start-button" id="start" type="button"><span>Start listening</span><kbd>Space</kbd></button>
        <p class="gesture-note">Headphones recommended · sound begins after your click</p>
      </div>
      <div class="stage-wrap">
        <canvas id="ecosystem" aria-label="Four musical creatures orbiting and interacting in a living sound ecosystem"></canvas>
        <div class="stage-hint" id="stage-hint"><span></span> Movement becomes music</div>
        <div class="generation-badge">GENERATION <strong id="generation">0</strong></div>
      </div>
    </section>

    <section class="lab" id="lab" aria-labelledby="lab-title">
      <div class="lab-heading">
        <div><p class="eyebrow">Guide the next generation</p><h2 id="lab-title">Which creatures belong in this song?</h2></div>
        <div class="history" role="group" aria-label="Compare generations">
          <button type="button" id="before" disabled>Before <span>Gen 0</span></button>
          <button type="button" id="after" disabled>Current <span>Gen 0</span></button>
        </div>
      </div>
      <div class="agent-grid" id="agent-grid"></div>
      <div class="evolve-bar">
        <label for="energy"><span>Calm</span><input id="energy" type="range" min="0" max="100" value="56" aria-label="Song energy"><span>Electric</span></label>
        <button id="evolve" class="evolve-button" type="button" disabled>Evolve the song <span>↗</span></button>
        <p id="change-summary" aria-live="polite">React to a creature, then evolve.</p>
      </div>
    </section>
  </main>
`;
