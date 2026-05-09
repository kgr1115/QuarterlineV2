# Data Model

Date: 2026-05-09

## Purpose

This document defines the QuarterlineV2 data model. The model uses a hybrid
approach: SQLite for structured data and indexing, plus human-readable files
(markdown, JSON, CSV) for content that external AI tools need to access.

## Current Status

No V2 data model is implemented. The structure below is the approved target.

## Multi-Workspace Model

Each analyst can maintain multiple workspaces. A workspace represents a single
research context, typically one market (e.g., "Atlanta Office Q1 2026").

Workspace storage is a folder on disk:

```
~/.quarterline/workspaces/
  <workspace-id>/
    WORKSPACE.md          # manifest for external AI tools
    workspace.db          # SQLite database
    narratives/           # markdown report sections (AI-bridge writable)
    data/                 # JSON/CSV data exports (AI-bridge readable)
    sources/              # ingested source files (confidential)
    notes/                # analyst notes in markdown
    exports/              # generated report artifacts
```

The `WORKSPACE.md` manifest describes the folder structure, current quarter,
market scope, and which files an external AI tool can safely read or write.
This enables the AI bridge: an analyst can point Claude Desktop, Codex, or
another agent at the workspace folder and have it generate narratives or
analysis.

## Entity Areas

### Core Entities (SQLite)

- **Workspace** — id, name, market, property type, current quarter, created,
  last modified, settings.
- **Portfolio** — id, workspace, name, description.
- **Asset** — id, portfolio, name, address, submarket, property class, RSF,
  year built, floors.
- **Market** — id, workspace, name, metro area, submarkets list.
- **Submarket** — id, market, name, boundary definition.
- **Quarter** — id, year, quarter number (Q1-Q4).

### Market Statistics (SQLite)

Modeled after the CBRE reference report structure (see
`docs/reference-artifacts/`):

- **MarketStatistic** — id, market or submarket, quarter, property class,
  net rentable area (MSF), total vacancy (%), total availability (%),
  direct availability (%), sublease availability (%), avg direct asking rate
  ($/SF FSG/yr), current quarter net absorption (SF), YTD net absorption (SF),
  deliveries (SF), under construction (SF).

### Property and Lease Data (SQLite)

- **Property** — id, asset, name, address, submarket, property class, RSF,
  floors, year built.
- **Lease** — id, property, tenant, suite, floor, RSF, lease type, start date,
  expiration date, rent ($/SF), status (occupied/vacant/expiring).
- **StackingPlanEntry** — id, property, floor, suite, tenant, RSF, status,
  WALT, lease expiration.

### Financial and Scenario Data (SQLite)

- **FinancialMetric** — id, entity (asset/market/submarket), quarter, metric
  type (NOI, cap rate, asking rent, absorption, vacancy, etc.), value, unit.
- **Scenario** — id, workspace, name, base quarter, parameters (interest rate
  shift, rent growth, cap rate shift), created.
- **ScenarioResult** — id, scenario, quarter, metric type, simulated value.

### Evidence and AI (SQLite + files)

- **SourceFile** — id, workspace, filename, file type, ingestion date, hash,
  confidentiality flag. Physical file stored in `sources/`.
- **EvidenceItem** — id, source file, extracted claim, page/location, date
  extracted.
- **AISynthesisCard** — id, workspace, quarter, card type (market overview,
  trend alert, anomaly), content, source evidence IDs, generated date, model
  used.

### Report Assembly (SQLite + files)

- **ReportPin** — id, workspace, module type (synthesis card, table, chart,
  map, scenario, note), module reference ID, pin order, section assignment.
- **ReportDraft** — id, workspace, name, quarter, created, last modified,
  status (draft/review/final).
- **ReportSection** — id, draft, section type (market overview, availability,
  asking rent, net absorption, construction, leasing, statistics, map),
  narrative file path (in `narratives/`), exhibit references.
- **ExportArtifact** — id, draft, format (PDF/HTML), file path (in
  `exports/`), generated date.

### Operational (SQLite)

- **AuditEvent** — id, workspace, timestamp, event type, entity type, entity
  id, description, user.
- **AnalystNote** — id, workspace, entity type, entity id, content file path
  (in `notes/`), created.

## AI Bridge File Contracts

Files that external AI tools can **read**:

- `WORKSPACE.md` — workspace manifest and structure guide.
- `data/*.json` or `data/*.csv` — market statistics, financial metrics,
  property data exported from SQLite.
- `notes/*.md` — analyst notes.
- `narratives/*.md` — existing report section drafts.

Files that external AI tools can **write**:

- `narratives/*.md` — report section drafts and narratives.
- `notes/*.md` — analysis notes.

Files that external AI tools should **not modify**:

- `workspace.db` — SQLite database (app-managed).
- `sources/*` — confidential ingested source files.
- `exports/*` — generated report artifacts (app-managed).

## Remaining Decisions

- Source-file retention and cleanup rules.
- Encryption for source files at rest.
- Sync-ready identifier format (UUIDs vs. prefixed IDs).
- Backup and restore mechanism.
- Workspace portability/export format.

## Acceptance Criteria

When implemented, the data model should support:

- Creating, opening, and switching between multiple workspaces.
- Offline workspace open/save.
- Confidential source-file boundaries.
- Deterministic report assembly from pinned modules.
- Traceability from report statements back to evidence or data.
- External AI tools reading workspace data and writing narratives.
- Safe future sync without rewriting core IDs.
