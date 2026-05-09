# Decision Log

## QuarterlineV2 Desktop Documentation-First Pivot

Decision: Create QuarterlineV2 as a separate desktop-app planning repository
and pause implementation until the owner explicitly starts coding.

Date: 2026-05-09

Owner: Chief Implementation Agent

Context: The project owner requested a new sibling repo/folder named
`QuarterlineV2`, preservation of the documentation structure and agent
workflow, a downloadable desktop-app direction rather than a hosted web app, and
documentation-only work for the current pass. The owner also requested
`claude.md` and `agent.md` for Claude Opus 4.7 agent structure and asked that
the generated artwork be included as design goals.

Options considered:

- Continue altering the copied app scaffold.
- Start desktop implementation immediately.
- Treat V2 as a documentation-first desktop planning repository and defer code.

Decision made: Keep V2 documentation-first for now. Preserve the documentation
flow, document the desktop product direction, store the industrial-minimalist
concept artwork under `docs/design/`, and add root agent guidance files.

Reasoning: The desktop runtime, local-first persistence boundary, packaging
strategy, and security model need explicit agreement before code begins. The
design artwork can guide future implementation without creating a false
impression that the UI already exists.

Risks: Future agents may assume V1 implementation history still applies unless
they follow the V2 reading order.

Follow-up: Compare Electron, Tauri, and any other serious runtime candidate in a
desktop architecture decision record before implementation.

## Documentation-Only Repository Cleanup

Decision: Remove all copied non-documentation files from QuarterlineV2.

Date: 2026-05-09

Owner: Chief Implementation Agent

Context: The project owner wanted to start fresh and asked to remove anything
that is not documentation from QuarterlineV2.

Options considered:

- Keep the copied V1 source scaffold as hidden reference material.
- Remove only app source but keep package/config files.
- Remove all non-documentation files and keep root markdown plus `docs/`.

Decision made: Remove copied app source, package files, build/runtime config,
public assets, automation scripts, backend files, exports, `.env.example`, and
`.gitignore`. Keep `.git`, root markdown guidance, and the `docs/` tree.

Reasoning: A clean documentation-only repository prevents future agents from
mistaking inherited V1 implementation files for the V2 desktop starting point.

Risks: Future implementation work will need to recreate standard project
scaffolding, ignore rules, dependency manifests, and verification scripts from
the approved desktop architecture plan.

Follow-up: When coding begins, create fresh scaffold files intentionally rather
than reviving copied V1 app files by default.

## Active Documentation Reset

Decision: Replace inherited V1 planning content with V2-native documentation
templates.

Date: 2026-05-09

Owner: Chief Implementation Agent

Context: The project owner wants the system to understand the documentation
flow but build its own milestones, next steps, scope, path, and specs for V2.

Options considered:

- Keep V1 milestone and product docs as historical context.
- Delete all inherited docs and keep only root guidance.
- Keep the documentation structure but reset active content to V2 templates.

Decision made: Keep the documentation structure and reset active planning docs
to V2-native scaffolds. Remove V1-only pilot and tester artifacts.

Reasoning: The file structure teaches future agents how to work, while the
cleaned content prevents them from blindly continuing the V1 web-app roadmap.

Risks: Some retained reference artifacts may still need interpretation notes as
V2 report-output work begins.

Follow-up: Fill the templates from fresh V2 decisions: desktop runtime, local
persistence, design system, MVP scope, and verification strategy.

## Desktop Runtime: Electron

Decision: Use Electron as the desktop runtime for QuarterlineV2.

Date: 2026-05-09

Owner: Chief Implementation Agent

Context: The project owner has no runtime preference and asked for whatever
produces the most robust app. QuarterlineV2 requires dense financial tables, 3D
map rendering, 3D stacking plans, chart-heavy dashboards, AI API integration,
PDF export, and consistent cross-platform rendering.

Options considered:

- Electron.
- Tauri.

Decision made: Electron.

Reasoning: Electron bundles Chromium, giving consistent rendering across
machines for 3D (Three.js / deck.gl), dense tables, and charts. Node.js backend
makes AI SDK integration (Anthropic, OpenAI) straightforward. Chromium's
print-to-PDF is mature and fits the report export workflow. The ecosystem is
battle-tested for complex desktop apps (VS Code, Figma desktop, Slack). Tauri's
advantages (smaller binary, lower memory) matter more for lightweight utilities;
QuarterlineV2 targets institutional analysts on capable hardware where binary
size and baseline memory are acceptable tradeoffs for rendering reliability and
ecosystem depth.

Risks: Electron apps carry a ~150MB+ base binary and higher memory baseline.
Future optimization may be needed for very large workspaces.

Follow-up: Define the Electron project scaffold, preload/main/renderer split,
and build/packaging pipeline in Milestone 3.

## Multi-Workspace Data Model

Decision: Support multiple workspaces per analyst from the start.

Date: 2026-05-09

Owner: Chief Implementation Agent

Context: The project owner confirmed that analysts typically cover multiple
markets simultaneously and need separate workspaces for each.

Options considered:

- Single workspace, refactor later.
- Multi-workspace from day one.

Decision made: Multi-workspace from day one. Each workspace represents a
market or research context. An analyst can create, open, switch, and manage
multiple workspaces independently.

Reasoning: Retrofitting multi-workspace onto a single-workspace model touches
persistence, navigation, state management, and export. Designing for it from the
start avoids that rework.

Risks: Slightly more upfront data-model work. Workspace switching UX needs
specification.

Follow-up: Update `docs/data-model.md` with workspace entity definition and
multi-workspace navigation flow.

## AI Integration: Dual Model (Built-in + External AI Bridge)

Decision: Support both built-in AI (API-backed) and an external AI bridge where
tools like Claude Desktop or Codex can open a workspace folder and generate
content.

Date: 2026-05-09

Owner: Chief Implementation Agent

Context: The project owner wants AI synthesis as an option within the app, but
also wants the workspace to be structured so that an analyst can point an
external AI tool at the workspace folder and have it read context, generate
narratives, or fill in report sections. This means workspace data must be stored
in human-readable, AI-parseable formats.

Options considered:

- Built-in AI only (binary database, opaque to external tools).
- External AI only (file-based, no built-in AI features).
- Dual model: built-in AI for in-app synthesis + file-based workspace structure
  that external AI tools can read and write.

Decision made: Dual model.

Reasoning: Built-in AI handles structured synthesis (cards, scenario
narratives). The file-based bridge lets analysts use whatever AI tool they
prefer for longer-form work like drafting report sections. This requires the
workspace to store key content in readable formats (markdown for narratives,
JSON or CSV for structured data) alongside any local database used for indexing
and state.

Risks: Maintaining coherence between file-based content and database state
requires a sync or import/refresh mechanism. External AI edits may conflict with
in-app state.

Follow-up: Define the workspace folder structure, which files are
AI-bridge-readable, and how the app detects external changes.

## 3D Visualization: MVP Placeholder, Full 3D as Product Goal

Decision: Use 2D map and simplified stacking-plan views in the MVP. Document
full 3D interactive modules as the finished-product goal.

Date: 2026-05-09

Owner: Chief Implementation Agent

Context: The concept artwork and design goals show a 3D market overview map and
a 3D property stacking plan as first-class tiers. The project owner confirmed
that 3D is the target for the finished product but acceptable to use 2D
placeholders in the MVP.

Options considered:

- Full 3D in MVP.
- 2D placeholder in MVP, 3D later.

Decision made: 2D for MVP, 3D documented as finished-product target.

Reasoning: 3D map rendering (deck.gl or Three.js) and interactive stacking
plans are substantial engineering efforts. Getting the data model, workspace
navigation, report assembly, and AI integration right in the MVP is more
valuable than premature 3D work.

Risks: If the 2D placeholder is too far from the 3D target, the transition may
require significant UI restructuring.

Follow-up: Design the 2D placeholder to occupy the same layout regions and
accept the same data contracts as the future 3D modules, so the swap is
contained.

## Implementation Phase Authorized

Decision: Begin implementation. Milestone 3 (Electron scaffold) is the first
coded milestone.

Date: 2026-05-09

Owner: Project Owner

Context: Milestones 0-2 (documentation reset, architecture decisions, design
system spec) were complete. The owner authorized the coding phase.

Decision made: Move from documentation-only to active implementation. All
agent docs that previously gated coding ("do not code", "documentation-only",
"planning phase only") are updated to reflect implementation status.

Reasoning: The architecture, data model, MVP scope, and design system spec
are stable enough to begin building against. Remaining data-boundary
decisions (source-file retention, encryption, identifier format, backup) can
be resolved as their implementing milestones come up.

Risks: Implementation may surface gaps in the planning docs that require
revisits to architecture or data-model decisions. That is expected; record
those as new entries in this log when they happen.

Follow-up: Begin Milestone 3.

## Milestone 3 Complete: Electron Scaffold

Decision: Accept the Electron scaffold as the implementation foundation.

Date: 2026-05-09

Owner: Chief Implementation Agent

Context: Milestone 3 acceptance criteria were met: app launches via
`npm start`, the shell layout from the design spec renders, SQLite is
created and queried from the main process, the IPC bridge round-trips a
ping from renderer to main, and `npm run package` produces a Windows
NSIS installer.

Decision made: Treat the scaffold (`src/main/`, `src/preload/`,
`src/renderer/`, `src/shared/`) as the canonical structure for subsequent
milestones. Future modules extend this structure rather than restructuring
it.

Stack confirmed in scaffold:

- electron-vite for build/dev (HMR for renderer).
- React 19 + TypeScript for the renderer.
- better-sqlite3 with WAL mode in the main process.
- Typed IPC bridge with shared channel constants
  (`src/shared/ipc-channels.ts`).
- electron-builder targeting Windows NSIS.
- ESLint (typescript-eslint) + Prettier.

Reasoning: Locking the structure now prevents churn during M4-M9. The
scaffold matches the architecture doc and the design tokens match the
design-system spec.

Risks: Some choices (e.g., exact charting library, map library) are
deferred to the milestones that introduce them. The scaffold does not
prejudge those.

Follow-up: Begin Milestone 4 (Workspace Management and Navigation).

## Windows-First Target Confirmed

Decision: Target Windows as the first release platform.

Date: 2026-05-09

Owner: Project Owner

Context: Reconfirmed from the architecture doc. Mac and Linux are optional
later.

Reasoning: Institutional CRE analysts predominantly use Windows workstations.

Follow-up: Electron packaging should target Windows (NSIS or Squirrel installer)
first, with Mac/Linux builds added after the MVP ships.
