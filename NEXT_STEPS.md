# QuarterlineV2 Next Steps

Date: 2026-05-09

## Current State

- Milestones 0-3: **Complete.**
- Milestone 4 (Workspace Management and Navigation): **In progress** —
  implementation done, pending Windows smoke test.

The Electron scaffold runs. Workspace lifecycle is implemented: analysts can
create, open, switch, and close workspaces through the sidebar switcher and
the new-workspace dialog. Each workspace creates its folder under
`~/.quarterline/workspaces/<slug>/` with `WORKSPACE.md`, a per-workspace
SQLite database, and the AI-bridge subfolder layout. App config persists the
last opened workspace and window state across launches.

## Immediate Priorities

1. **Smoke-test M4 on Windows.**
   - Run `npm start`, confirm the empty-state card.
   - Create "Atlanta Office Q1 2026"; confirm the folder appears under
     `%USERPROFILE%\.quarterline\workspaces\atlanta-office-q1-2026\` with
     `WORKSPACE.md`, `workspace.db`, and the subfolders.
   - Switch / close / reopen workspaces via the sidebar switcher.
   - Close the app and relaunch; confirm last workspace and window position
     restore.
   - Report any deltas; if clean, promote M4 status to **Complete** and add
     a decision-log entry.

2. **Begin Milestone 5 (Data Ingestion and Storage)** once M4 is verified.
   - CSV import for market statistics.
   - JSON import for property and lease data.
   - SQLite schema for entity tables from `docs/data-model.md`.
   - Auto-export to `data/*.json` for the AI bridge.
   - Source-file handling with confidentiality flag.
   - Basic data studio view.

## Open Decisions Still to Resolve

- Source-file retention and cleanup rules (M5/M9).
- Encryption expectations for source files at rest (M9).
- Workspace backup and restore model (post-MVP).

## What Exists

- Electron app shell: main / preload / renderer split.
- Workspace lifecycle: create, list, open, close, switch.
- Persistent app config (`~/.quarterline/config.json`).
- Per-workspace SQLite (`workspace.db`) with `workspace` table.
- WORKSPACE.md manifest generator (matches `docs/ai-bridge-spec.md`).
- React workspace context, sidebar switcher, create-workspace dialog,
  empty-state card, status bar with workspace context, filter bar wired to
  workspace.
- ESLint + Prettier, Windows packaging via electron-builder.
