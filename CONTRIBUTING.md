# Contributing

Thanks for helping Parts2Melody grow. Keep pull requests focused and keep `main` deployable.

## Local workflow

1. Create a branch such as `audio/new-creature-voice`, `visuals/trails`, or `evolution/bandit`.
2. Run `npm install` and `npm run dev`.
3. Add tests for deterministic state, bounds, serialization, or lifecycle behavior when relevant.
4. Run `npm run check` before opening a pull request.

The modules intentionally support three parallel owners: musical systems (`audio/`, `music/`), agent behavior (`visuals/`), and preference/product work (`evolution/`, `ui/`). Discuss changes to shared types before merging conflicting genome formats.

## Guidelines

- Keep audio synthesized or document a redistributable asset license.
- Audio must begin only after a user gesture.
- Do not leave Tone transport events scheduled after stop/reset.
- Preserve keyboard, contrast, and reduced-motion behavior.
- Avoid adding a backend, paid API, or secret unless a core experiment requires it.
