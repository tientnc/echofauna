# Parts2Melody

**Shape a song by shaping life.** Four visible creatures turn movement into a coherent generative loop. Keep what you like, freeze a favorite behavior, and evolve the rest—in one browser, with no backend or copyrighted samples.

> Screenshot/GIF coming after the first public demo capture.

**Live demo:** deployment pending · [Design notes](docs/design-notes.md)

## Run locally

```bash
npm install
npm run dev
```

Open the shown local URL and click **Start listening**. Browser audio intentionally begins only after that user gesture.

## How to play

- **Start listening** wakes the audio and ecosystem.
- **Keep this** teaches the next generation which current traits you prefer.
- **Change** asks for more exploration around that creature.
- **Freeze** preserves a creature exactly while the others evolve.
- **Evolve the song** creates the next seeded musical genome.
- Hold **Before** to compare with the previous generation. Use `Space` to pause, `E` to evolve, and `M` to mute.

## Stack and structure

TypeScript + Vite + Tone.js + Canvas 2D + Vitest. Everything runs locally in the browser; all sounds are synthesized.

```text
src/audio       Tone transport, synthesis, lifecycle
src/visuals     creature simulation and event flashes
src/music       serializable genome and musical constraints
src/evolution   feedback, freezing, lineage state
src/ui          semantic controls and views
src/core        shared types and seeded randomness
```

## Checks

```bash
npm run check
```

## Todo/Next steps
- Different genres
- Testing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the three-person workflow. MIT licensed.
