# UX Flows

Date: 2026-05-09

## Current Status

QuarterlineV2 UX is in design-planning mode. No V2 desktop UI has been
implemented yet.

Primary visual reference:

- `docs/design/quarterline-v2-design-goals.md`
- `docs/design/quarterline-v2-industrial-minimalism-concept.png`

## Information Architecture Target

Desktop app shell:

- Portfolio.
- Assets.
- Reports.
- Market Intelligence.
- Scenarios.
- Data Studio.
- Watchlist.
- Alerts.
- Settings.

Global controls:

- Market Level / Property Level.
- Market.
- Quarter.
- Property type.
- Filters.
- Export or report assembly action.

Primary dashboard tiers:

1. AI Synthesis.
2. Market Overview 3D and Property Stacking Plan.
3. Financial Overview and What-If Scenario Simulation.

## Analyst Workflow Target

1. Open local desktop app.
2. Create or select a workspace (one per market/research context).
3. Confirm global scope: market, quarter, property type.
4. Review AI synthesis cards (if AI is configured).
5. Inspect market map and stacking plan.
6. Review financial table and anomalies.
7. Adjust scenario sliders.
8. Pin useful modules to report assembly queue.
9. Optionally: open workspace folder in Claude Desktop, Codex, or another AI
   tool to generate narrative drafts for report sections.
10. Import external AI-generated narratives (app detects new files in
    `narratives/`).
11. Assemble report: order sections, review narratives, confirm exhibits.
12. Export quarterly report as PDF.

## Desktop UX Principles

- Optimize for sustained analyst work, not marketing presentation.
- Keep controls compact and stable.
- Use tabular numerical alignment for financial data.
- Keep the portfolio sidebar persistent.
- Make global filters visible and persistent.
- Make pin-to-report actions available at module level.
- Prefer dense tables, maps, panels, and scenario controls over large empty
  hero space.

## Required Interaction Details To Specify Before Coding

- How report pins are stored and organized.
- Whether the portfolio sidebar can collapse.
- How Market Level and Property Level change visible modules.
- What a selected building floor reveals.
- What happens when a scenario becomes report-ready.
- How analyst notes attach to cards, rows, and exhibits.
- How local save/snapshot status appears in desktop chrome.

## Non-Goals

- No public landing page.
- No browser-first IA.
- No mobile-first MVP.
- No decorative dashboard filler.
- No fake workflow controls that do not change state once implementation begins.
