# MVP Scope

Date: 2026-05-09

## Purpose

This document defines the first downloadable QuarterlineV2 desktop MVP.

## Resolved Decisions

- Desktop runtime: **Electron** (see `docs/decision-log.md`).
- Local database: **SQLite** via better-sqlite3.
- Workspaces: **Multi-workspace from day one**. Each workspace is a folder on
  disk representing one market/research context.
- AI in MVP: **Optional, API-backed** (Anthropic/OpenAI). App must work without
  AI configured. External AI bridge is also supported (workspace folder is
  structured for tools like Claude Desktop or Codex to read/write).
- Map/stacking in MVP: **2D placeholder**. Full 3D is the finished-product
  target, documented in design goals.
- Export target: **Local PDF** as the primary MVP export.
- Target platform: **Windows first**.

## MVP Thesis

The first useful V2 MVP should let one CRE research analyst create and manage
multiple local workspaces (one per market), inspect market and property
portfolio views, evaluate financial metrics, run limited scenarios, assemble a
report draft from pinned modules, and export a PDF. An analyst should also be
able to point an external AI tool at a workspace folder and have it generate
narrative content that the app can import.

## In Scope

- One local analyst, multiple workspaces.
- Workspace creation, opening, switching, and management.
- Portfolio/sidebar navigation with workspace list.
- Market Level and Property Level global scope.
- AI synthesis cards (optional, API-backed when configured).
- External AI bridge: workspace folder readable/writable by Claude Desktop,
  Codex, or other AI agents.
- 2D market map (Mapbox or similar flat map with submarket boundaries).
- Simplified property stacking plan (2D floor grid, colored by occupancy).
- Financial table with tabular numeric alignment.
- Market statistics tables matching CBRE reference structure.
- What-if simulation controls (interest rate, rent growth, cap rate).
- Report pinning from any module.
- Report assembly and section ordering.
- Narrative authoring (manual + AI-generated + external AI bridge).
- PDF export via Chromium print-to-PDF.
- Desktop app startup, workspace save status, offline operation.
- Data import: CSV/JSON for market statistics and property data.

## Out Of Scope

- 3D interactive map and stacking plan (finished-product goal, not MVP).
- Hosted collaboration or team sync.
- Team permissions.
- Enterprise admin console.
- External data-provider integrations (CoStar, RCA, etc.).
- Multi-user sync.
- Mobile experience.
- Mac/Linux packaging.
- Auto-update mechanism (can be added post-MVP).

## Acceptance Criteria

- **Startup**: Electron app launches on Windows, shows workspace selector or
  last-opened workspace.
- **Multi-workspace**: analyst can create a new workspace, name it, assign a
  market, and switch between workspaces from the sidebar.
- **Local persistence**: workspace data persists in SQLite + files across app
  restarts. No data loss on normal close.
- **Data import**: analyst can import market statistics from CSV or JSON into a
  workspace.
- **Core analysis workflow**: analyst can navigate portfolio, view market
  overview, inspect financial table, review AI synthesis cards (when AI is
  configured).
- **Scenario interaction**: scenario sliders update simulated values and chart.
- **Report pinning**: analyst can pin modules and see them in a report assembly
  queue.
- **Report assembly**: analyst can order sections, edit narratives, and preview
  the report layout.
- **AI bridge**: an external AI tool can open the workspace folder, read
  `WORKSPACE.md` and `data/` files, write to `narratives/`, and the app
  imports the changes.
- **PDF export**: analyst can export the assembled report as a PDF.
- **Offline behavior**: all core features work without network access (AI
  features degrade gracefully).
- **Confidentiality**: source files in `sources/` are not exposed in exports or
  AI bridge readable files.
