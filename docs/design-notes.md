# Design notes

## Product hook

**Shape a song by shaping life.** EchoFauna opens on four moving creatures. Their crossings and alignment are both visible actions and scheduled musical events. The shortest convincing demo is: start, hear/see a loop, keep one creature, freeze another, evolve, and immediately hear and see the new generation.

The working name is **EchoFauna** (echo + living creatures). It had one unrelated GitHub repository-name match when checked on 12 August 2026; web search found no established software product dominating the name. Naming remains reversible, and this is not trademark clearance.

## Related projects

- [Otomata](https://earslap.com/page/otomata.html) is an elegant cellular sequencer: motion and collision make causality easy to see. Its grid is immediately playable, but it does not learn a listener's preferences.
- [Chrome Music Lab: Kandinsky](https://musiclab.chromeexperiments.com/Kandinsky/) makes drawn forms sound. Its strength is zero-explanation visual/audio mapping; its composition is authored rather than evolved.
- [Generative.fm](https://github.com/generativefm/generative.fm) proves that coherent generative music can run in the browser. Its listening experience is polished, while the generative actors are largely hidden.
- [LIFESWARM](https://artefactofilms.com/en/articles/lifeswarm-en/) maps boid density and alignment to rhythm and melody. It has compelling emergence, but thousands of similar particles make individual musical causes harder to follow.
- [loopArena](https://jenswunderling.com/works/looparena/) treats interface elements as autonomous agents for performance; it is a useful precedent for visible musical agency.
- Feature-based [interactive evolutionary composition](https://link.springer.com/article/10.1186/s40064-016-2398-8) supports the core algorithm choice: listeners judge subjective musical traits while explicit features keep generation tractable.

What often feels boring: random-note particles, a wall of sliders, long A/B rating forms, or visuals that merely react to finished audio. Our difference is bidirectional and immediate: a creature's behavior schedules sound, and the listener's response changes that creature's heritable behavior.

## Technical options

| Choice | Fit | Decision |
| --- | --- | --- |
| Tone.js | Musical transport, synths, effects, sample-accurate callbacks; no samples required | **Use** |
| Raw Web Audio | Maximum control but more scheduling and node lifecycle code | Wrap later if needed |
| Canvas 2D | Fast, direct, responsive, easy visual/audio event flashes | **Use** |
| SVG | Better semantics but less natural for continuous trails/particles | Not for arena |
| Phaser / Three.js | Helpful for game scenes or 3D, but unnecessary weight for four readable agents | Defer |
| React | Strong component ecosystem, but state is small and animation/audio are imperative | Skip for MVP |

Selected stack: TypeScript, Vite, Tone.js, DOM/CSS, Canvas 2D, Vitest. Static and client-side, with synthesized audio only; there are no sample copyright concerns, accounts, APIs, models, secrets, or backend.

## Learning and evolution approach

The MVP uses **interactive evolutionary computation with a tiny online preference profile**:

1. A genome contains tempo, energy, harmonic context, and four modular agent genes (16-step action pattern, pitch offsets, density, activity, brightness, variation).
2. `Keep this` moves the user's preferred-feature centroid toward that agent's current phenotype. `Change` lowers affinity and increases exploratory pressure.
3. `Freeze` copies the selected gene exactly into the child.
4. Evolution samples a child toward preferred features plus seeded Gaussian mutation. Hard bounds, a fixed scale, quantization, role ranges, progression, and density limits prevent invalid/noisy output.
5. The seed, genome, preferences, and history are plain serializable data.

This adapts in one click, runs locally, is deterministic in tests, and is explainable to a viewer. A contextual bandit could later choose among mutation operators (rewarded by keeps/listening duration). Tabular or multi-agent RL can later optimize an optional arena objective, but deep RL would add latency, opacity, and training risk without improving the first interaction.

Intrinsic structure comes from orbital motion, periodic crossings, agent role constraints, and coherent harmony. Human reward decides which behaviors survive. The MVP deliberately avoids pretending its preference vector is deep learning.

## Proposed MVP

- Immediate animated ecosystem; one required click unlocks browser audio.
- Four readable but nontraditional musical behaviors: impact pulse, low drift, melodic glint, harmonic halo.
- One-bar loop in a constrained minor-pentatonic/modal palette, synthesized entirely with Tone.js.
- Keep/change feedback, per-creature freeze, global energy, one-click evolution.
- Bounded origin/previous/current history and press-and-hold Before comparison.
- Keyboard play/pause (`Space`), evolve (`E`), mute (`M`), visible focus, master mute, responsive layout, reduced motion.

## Name candidates

GitHub name search counts (12 August 2026) suggested the least dominated options were EchoFauna (0), Motoflora (0), Cadence Colony (0), Swarmuse (1), Echofauna (1), Loopkin (2), Bloombeat (2), Pulsekin (3), Sonalife (4), and Orbitone (31). **EchoFauna** is the working name because it is compact, searchable, and directly evokes a living sound ecosystem without sounding like generic AI software. This is not a trademark clearance.

## Unresolved questions

- Should future generations evolve the visual policy itself, or only the musical phenotype that visual motion expresses?
- Does pairwise A/B breeding feel more meaningful than single-lineage keep/change after the first 60 seconds?
- Are four agents the right readability ceiling on phones?
- Should the next mode learn mutation-operator choices with a contextual bandit?
- How should a share URL encode lineage without becoming too large?
