# QuarterlineV2 Next Steps

Date: 2026-05-09

## Current State

Implementation is underway. Milestone 3 (Electron scaffold) is complete. The
app shell runs on Windows with sidebar navigation, global filter bar,
placeholder module cards, SQLite persistence, and a working IPC bridge.

- Milestones 0-3: **Complete.**
- Milestone 4 (Workspace Management and Navigation): **Next.**

Key architecture decisions are resolved (see `docs/decision-log.md`):

- Desktop runtime: Electron.
- Multi-workspace data model (one workspace per market).
- AI: dual model (built-in API-backed + external AI bridge via workspace
  folder structure).
- 3D visualization: 2D placeholder for MVP, full 3D as product goal.
- Windows-first packaging.

## Immediate Priorities

1. **Milestone 4: Workspace Management and Navigation.**
   - Workspace creation flow (name, market, property type, quarter).
   - Workspace list in sidebar with switcher.
   - Workspace folder creation on disk (SQLite + file structure).
   - WORKSPACE.md manifest generation.
   - Workspace open/close/switch.
   - Portfolio sidebar navigation.
   - Global filter bar wired to workspace context.
   - Status bar with workspace name and save status.
   - Window state persistence (size, position, last workspace).

2. Resolve remaining data-boundary decisions as needed during implementation.
   - Source-file retention and cleanup rules.
   - Encryption expectations for source files at rest.
   - Sync-ready identifier format (UUIDs vs. prefixed IDs).
   - Workspace backup and restore model.

## What Exists

- Electron app shell with main/preload/renderer process split.
- React 19 + TypeScript renderer via electron-vite.
- SQLite (better-sqlite3) with WAL mode in main process.
- Typed IPC bridge (ping, db:status channels).
- Sidebar with grouped navigation sections.
- Global filter bar with Market/Property toggle and dropdowns.
- Three-tier workspace area with placeholder module cards.
- Status bar with live database connection indicator.
- Design tokens matching the design-system spec.
- ESLint + Prettier tooling.
- Windows packaging pipeline (electron-builder, NSIS).
