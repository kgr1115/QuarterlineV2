# QuarterlineV2

QuarterlineV2 is the desktop version of Quarterline: a downloadable,
local-first CRE research and reporting app for institutional analysts. The goal
is to combine continuous market research, AI-assisted synthesis, dense financial
analysis, portfolio views, scenario simulation, and quarterly report assembly in
one high-performance desktop workspace.

The Electron scaffold (Milestone 3) is complete. Implementation now proceeds
through the milestone plan in `docs/milestones.md`.

## Product Direction

- Delivery model: downloadable desktop app.
- Primary user: institutional CRE research analyst.
- Working mode: local-first by default, with optional hosted collaboration,
  governed sync, and AI services after security decisions are made.
- Design language: industrial minimalism for high-density research and report
  generation.
- Primary artifact: a quarterly market report assembled from continuously
  validated evidence, data tables, maps, scenario outputs, and AI synthesis.

## Design Goals

The current visual goal is captured in:

- `docs/design/quarterline-v2-design-goals.md`
- `docs/design/quarterline-v2-industrial-minimalism-concept.png`

The artwork is a design target, not implemented code. Future UI work should use
it to preserve the intended density, palette, layout hierarchy, desktop-app
chrome, AI synthesis tier, 3D map/stacking-plan tier, financial tables, and
what-if simulation modules.

## Agent Reading Order

Every future Claude/Codex/agent session should read these first:

1. `claude.md`
2. `agent.md`
3. `README.md`
4. `NEXT_STEPS.md`
5. `docs/agent-handoff.md`
6. `docs/documentation-flow.md`
7. `docs/chief-agent-workflow.md`
8. `docs/design/quarterline-v2-design-goals.md`
9. Relevant domain docs:
   - Product and planning: `docs/product-brief.md`, `docs/mvp-scope.md`,
     `docs/milestones.md`
   - UX: `docs/ux-flows.md`
   - Architecture/data: `docs/architecture.md`, `docs/data-model.md`
   - Reporting: `docs/publication-output-spec.md`
   - Decisions: `docs/decision-log.md`

## Documentation Map

- `claude.md` — Claude Opus 4.7 operating instructions.
- `agent.md` — shared multi-agent structure and handoff rules.
- `NEXT_STEPS.md` — active V2 planning priorities.
- `docs/agent-handoff.md` — continuity note for future sessions.
- `docs/documentation-flow.md` — how future agents should read and update docs.
- `docs/chief-agent-workflow.md` — chief-agent operating model.
- `docs/decision-log.md` — chronological product and technical decisions.
- `docs/architecture.md` — Electron runtime, AI bridge, data architecture.
- `docs/data-model.md` — multi-workspace entity model, SQLite + file hybrid.
- `docs/mvp-scope.md` — MVP scope with resolved decisions and acceptance criteria.
- `docs/milestones.md` — concrete milestone plan (M0-M10+).
- `docs/ai-bridge-spec.md` — WORKSPACE.md manifest, data schemas, AI tool contract.
- `docs/design/quarterline-v2-design-goals.md` — design goals and artwork notes.
- `docs/design/technical-design-specification.md` — original design spec for artwork.
- `docs/design/design-system-spec.md` — tokens, typography, layout, components.
- `docs/publication-output-spec.md` — report structure benchmarked against CBRE ref.
- `docs/ux-flows.md` — V2 desktop IA and workflow targets.
- `docs/product-brief.md` — stable product context and principles.
- `docs/path-forward.md` — V2 planning path from docs to implementation.
- `docs/production-quality-path-forward.md` — V2 quality-bar scaffold.
- `docs/reference-artifacts/` — CBRE Atlanta Q1 2026 benchmark report.

## Repository Status

Milestones 0-8 are complete. M9 (Polish, Packaging, Release Prep)
is the active milestone — Phase 3b is wiring the first GitHub
release. The Electron app shell runs on Windows with workspace
lifecycle, CSV/JSON ingestion, six analysis modules, AI integration
(Anthropic), report assembly + PDF export, and a polished UX
including a native menu, keyboard shortcuts, accessibility pass,
crash logging, error boundaries, and route persistence. See
`NEXT_STEPS.md` for the cut-the-first-release workflow.

## Dev Setup

Prerequisites: Node.js 20+ and Windows (primary target).

```
npm install
npm start          # electron-vite dev with HMR
npm run build      # production build
npm run package    # Windows NSIS installer (output to dist/)
npm run smoke-test # Electron-runtime data-layer test (32/32)
npm run lint       # ESLint
npm run format     # Prettier
```

## Releases

Hosted at `https://github.com/kgr1115/QuarterlineV2/releases`. To
cut a release:

```
npm version patch                                  # bumps and tags
git push --follow-tags
$env:GH_TOKEN = "<token-with-repo-scope>"
npm run package -- --publish always
```

The auto-updater in installed builds checks for new releases on
launch and downloads in the background.

## Project Structure

- `src/main/` — Electron main process (window, SQLite, IPC handlers).
- `src/preload/` — Preload script exposing the typed `window.quarterline` API.
- `src/renderer/` — React 19 + TypeScript renderer (UI components, styles).
- `src/shared/` — Shared types and IPC channel constants.
- `electron.vite.config.ts` — Build configuration for all three processes.
- `electron-builder.yml` — Packaging configuration (Windows NSIS).
