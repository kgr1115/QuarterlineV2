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

## Workspace Storage Location

Decision: Store all workspaces under `~/.quarterline/workspaces/<id>/`, with
app-level config at `~/.quarterline/config.json`. Do not use Electron's
per-platform `userData` path for workspace folders.

Date: 2026-05-09

Owner: Chief Implementation Agent

Context: M4 needed a workspace storage layout. Two options: (a) Electron's
`userData` path (`%APPDATA%/QuarterlineV2/` on Windows, `~/Library/Application
Support/...` on macOS, `~/.config/...` on Linux) or (b) a fixed cross-platform
path under the user's home directory.

Decision made: Option (b). All workspaces and app config live under
`~/.quarterline/`.

Reasoning: The AI bridge is a folder contract — analysts need to point Claude
Desktop, Codex, or another agent at the workspace folder. A discoverable,
predictable path under the user's home directory makes that point-and-aim
flow trivial. Electron's userData path varies by platform and is buried in
appdata directories that analysts don't browse.

Risks: Users who routinely change machines or sync their home directory may
sync workspace databases. WAL mode helps but cross-machine SQLite syncing is
a known footgun. Document this when the backup/restore model is finalized.

Follow-up: Workspace portability and backup format (a remaining decision
from `docs/data-model.md`) should preserve the relocatability of workspace
folders.

## Workspace ID Format: Slugged Folder Names

Decision: Generate workspace folder IDs as kebab-case slugs of the workspace
name, with a numeric suffix on collision (`atlanta-office-q1-2026`,
`atlanta-office-q1-2026-2`).

Date: 2026-05-09

Owner: Chief Implementation Agent

Context: `docs/data-model.md` listed "Sync-ready identifier format
(UUIDs vs. prefixed IDs)" as an open decision. M4 had to commit to a folder
naming convention.

Options considered:

- UUIDs (e.g., `b3f9...`): sync-safe, collision-free, but unreadable when
  analysts browse `~/.quarterline/workspaces/` or point AI tools at the folder.
- Slug + collision suffix: human-readable, AI-bridge-friendly, requires a
  collision check at create time.
- Prefixed IDs (e.g., `ws_001`): readable but uninformative.

Decision made: Slug + collision suffix.

Reasoning: The AI bridge depends on a folder being recognizably about a market
and quarter. `atlanta-office-q1-2026/` is self-describing; `b3f9.../` is not.
Collisions are cheap to handle (filesystem stat at create time).

Risks: Cross-device sync conflicts (two devices creating the same slug) will
need a real ID at sync time. The internal `workspace.id` column is a string,
so we can migrate to a stable hash or UUID-namespaced ID later without
restructuring data — the folder name is just the local addressing scheme.

Follow-up: When team sync lands, generate a stable `workspace.sync_id` (UUID)
separate from the local folder slug. The folder slug becomes a display alias.

## CSV Parser: csv-parse

Decision: Use the `csv-parse` package (v6) for CSV ingestion in M5 rather
than hand-rolling a parser.

Date: 2026-05-09

Owner: Chief Backend and Data Agent

Context: M5 needs to import market and submarket statistics from CSV. Real
CBRE-style data may include quoted fields, BOMs from Excel exports, and
parenthesized negatives. A hand-rolled parser is fragile.

Options considered:

- Hand-rolled split-on-comma parser.
- `csv-parse` (no transitive dependencies, ~100KB, battle-tested).
- `papaparse` (browser-friendly, larger).

Decision made: `csv-parse` (sync API).

Reasoning: Zero dependencies, mature, handles edge cases out of the box.
Sync API is appropriate for the main process where we read modest-sized
CSVs (tens to hundreds of rows). Adds 1 dependency, no transitive bloat.

Risks: One more dep to track for security advisories. Mitigated by it
being a stable package with a long maintenance track record.

Follow-up: Numeric coercion (parens for negatives, `%`, `$`, commas) is
implemented in `src/main/csv-import.ts` rather than in csv-parse —
csv-parse returns raw strings.

## Re-import Replaces the Quarter's Rows

Decision: Re-importing market or submarket statistics for the same quarter
deletes that quarter's existing rows before inserting the new ones, in a
single transaction.

Date: 2026-05-09

Owner: Chief Backend and Data Agent

Context: An analyst will iteratively refine market data — fix a typo in
Excel, save, re-import. The importer needs to handle re-import without
producing duplicate rows or requiring the analyst to manually clear
existing data.

Options considered:

- Append-only: each import adds rows; analyst manually deletes old ones.
- Upsert by composite key: requires defining a unique key per row across
  all CBRE permutations (class, subclass, submarket, market). Brittle if
  the CBRE schema evolves.
- Delete-by-quarter then insert: simple, atomic, idempotent.

Decision made: Delete-by-quarter then insert, in one transaction.

Reasoning: Simplicity. The market statistics table is a snapshot of one
quarter's published numbers — the natural unit of replacement is the
quarter itself. Atomic transaction keeps the DB consistent if the import
fails partway. Source files (which back the data) live in `sources/`
with their own retention rules and are not affected.

Risks: An analyst who imports two CSVs covering the *same* quarter
expecting them to merge will be surprised by the second import wiping
the first. Document this in the importer's UI feedback when M9 polishes
copy.

Follow-up: When workspace backup/restore lands (post-MVP), include the
import history (filename, row counts, hash of the source CSV) so reverts
are possible.

## Source File Deduplication by Content Hash

Decision: Source file ingestion deduplicates by sha256 content hash.
Re-ingesting the same file (even under a different filename) is rejected
with a clear error rather than silently storing two copies.

Date: 2026-05-09

Owner: Chief Backend and Data Agent

Context: Source files (lease abstracts, market reports, broker emails)
are confidential and bulky. Analysts often re-save or re-receive the
same document; the app shouldn't bloat `sources/` with duplicates.

Decision made: Compute sha256 at ingest time; reject duplicates.

Reasoning: Content hashing is the only way to detect "same file under a
different name." Filename-based dedup misses the common case of "Final
v2 (1).pdf" vs "Final v2.pdf" being the same content.

Risks: Two genuinely different files with the same content (impossible
under sha256 in practice) would be conflated — acceptable.

Follow-up: When source-file retention policy lands (an open data-model
decision), the policy should be expressed in terms of hash, ingestion
date, and confidentiality flag rather than filename.

## Milestone 4 Complete: Workspace Management and Navigation

Decision: Accept the workspace lifecycle implementation as the foundation
for all future per-workspace work.

Date: 2026-05-09

Owner: Chief Implementation Agent

Context: M4 acceptance criteria were met. Analyst created
"Atlanta Office Q2 2026" via the GUI; folder layout was correct;
status/filter bars updated; relaunch restored workspace and window
state; backend verified by `npm run smoke-test` (31/31 checks).

Decision made: Lock in the active-workspace state model
(`workspace-manager.ts`), the slug-based folder ID format, and the
~/.quarterline/ root location. Future milestones extend the per-workspace
SQLite schema and the WORKSPACE.md manifest, but do not move workspace
storage or change the active-workspace state pattern.

Reasoning: The acceptance walkthrough exercised every mutation path
(create, open, switch, close, restart-restore). Locking now means M5
onward could start without re-litigating storage location or state
ownership.

Risks: When team sync lands (post-MVP), the local folder slug needs a
parallel sync_id (UUID). That follow-up was already recorded in the
"Workspace ID Format" decision and is unchanged.

Follow-up: Begin Milestone 5 (delivered same-day; see next entry).

## Milestone 5 Complete: Data Ingestion and Storage

Decision: Accept the data ingestion pipeline (CSV / JSON imports, source
file ingestion, AI-bridge JSON exports, Data Studio view) as the data
layer for M6 analysis modules.

Date: 2026-05-09

Owner: Chief Implementation Agent + Chief Backend and Data Agent

Context: M5 acceptance criteria were met. CSV imports for market and
submarket stats produced the expected rows and `data/*.json` exports;
the property + lease JSON import produced the expected rows; source file
ingestion landed files under `sources/` without exposing paths in
`data/*.json` or `WORKSPACE.md`; data persisted across app restarts; a
malformed CSV was rejected with clear errors. `npm run smoke-test`
(31/31 Electron-runtime checks) covers the programmatic verification.

Decision made: Treat the per-workspace tables (`market_statistic`,
`submarket_statistic`, `property`, `lease`, `source_file`), the AI-bridge
JSON schema in `docs/ai-bridge-spec.md`, and the Data Studio sub-tab
layout as stable foundations. M6 modules read from these tables.

Reasoning: The data shapes match `docs/data-model.md` and the
JSON contracts match the schemas already documented in
`docs/ai-bridge-spec.md`. Locking now lets the M6 modules render
deterministically without needing schema rework.

Risks: The CBRE column structure may evolve in real client data,
requiring header-tolerant alias additions to `csv-import.ts`. That's a
small, additive change rather than a structural one.

Follow-up: Begin Milestone 6 (Analysis Modules).
