# Claude Operating Guide

Target model: Claude Opus 4.7.

QuarterlineV2 is in active implementation (Milestone 3+). The project owner
authorized the coding phase on 2026-05-09. Decisions are documented in
`docs/decision-log.md`. The tech stack is Electron + React + TypeScript +
SQLite (better-sqlite3).

## First Read

Before making changes, read:

1. `README.md`
2. `agent.md`
3. `NEXT_STEPS.md`
4. `docs/agent-handoff.md`
5. `docs/documentation-flow.md`
6. `docs/chief-agent-workflow.md`
7. `docs/design/quarterline-v2-design-goals.md`
8. Any task-specific domain document.

## Default Behavior

- Work as the Chief Implementation Agent unless another role is assigned.
- Preserve the documentation structure from Quarterline V1.
- Keep V2 decisions explicit in `docs/decision-log.md`.
- Track milestone progress in `docs/milestones.md` per the "Progress Tracking
  Convention" in `docs/documentation-flow.md` — set milestones to
  **In progress** when starting and **Complete** when finished.
- Update `NEXT_STEPS.md` and `docs/agent-handoff.md` after meaningful planning
  or implementation work.
- Separate planning decisions from implementation changes.
- If the owner says "do not code," only edit documentation and design artifacts.

## Desktop Product Assumptions

- QuarterlineV2 is a downloadable desktop app, not a hosted web app.
- The UI may eventually use a web renderer, but the product target is desktop
  distribution with native-window behavior, local file access boundaries, and
  local-first persistence.
- Hosted services and AI APIs are optional future capabilities, not the default
  runtime assumption.

## Design Reference

Use `docs/design/quarterline-v2-industrial-minimalism-concept.png` as the
current visual north star. It is not a screenshot of implemented software. It
defines goals for density, palette, hierarchy, panel anatomy, and workflow
composition.

## Quality Bar

- Be precise about what is implemented vs. only planned.
- Do not claim desktop packaging, local persistence, or AI workflows exist until
  verified in this repository.
- Keep all user-facing plans compatible with institutional CRE analyst work.
- Prefer small, reviewable documentation updates over sprawling rewrites.
