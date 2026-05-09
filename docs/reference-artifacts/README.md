# Reference Artifacts

Date: 2026-05-09

## Purpose

This folder stores external reference reports and benchmark material that define
the quality bar for QuarterlineV2 report output. The publication output spec
(`docs/publication-output-spec.md`) references these artifacts directly.

## Current Artifacts

### Atlanta_Office_2026_Q1_Figures.pdf

Source: CBRE Research, Q1 2026.

A real institutional CRE quarterly market report for the Atlanta Office market.
8 pages. This is the primary benchmark for QuarterlineV2 report output quality.

Structure:

1. **Page 1 — Cover/Market Overview**: headline, 5 key metrics with directional
   arrows (availability rate, net absorption, construction delivered, under
   construction, asking lease rate), 2-paragraph market narrative, historical
   combo chart (net absorption bars + deliveries bars + availability rate line).
2. **Page 2 — Availability + Asking Rent**: narrative paragraphs paired with
   availability-by-class line chart and asking-rent-by-class line chart.
3. **Page 3 — Net Absorption + Construction**: narrative paragraphs paired with
   net absorption trend bar chart (Class A vs. other) and construction activity
   area/bar chart.
4. **Page 4 — Leasing Activity**: narrative, leasing trend stacked bar chart,
   leasing-by-submarket donut chart, key lease transactions table
   (tenant, SF, type, address, submarket).
5. **Pages 5-6 — Market Statistics by Class**: dense tables for suburban, urban,
   and metro markets. Columns: property class, net rentable area (MSF), total
   vacancy (%), total availability (%), direct availability (%), sublease
   availability (%), avg direct asking rate ($/SF FSG/yr), current quarter net
   absorption (SF), YTD net absorption (SF), deliveries (SF), under
   construction (SF).
6. **Page 7 — Market Statistics by Submarket**: same column structure, one row
   per submarket.
7. **Page 8 — Market Area Overview**: color-coded submarket boundary map,
   definitions glossary, survey criteria, analyst contacts.

Design notes: clean white background, minimal CBRE branding (logo + accent
color), two-column layout for narrative+chart pages, full-width tables, muted
color palette (teal/charcoal/gold). Monospaced tabular numerics in data tables.

## Usage Rules

- Treat reference artifacts as the quality bar and structural benchmark for
  QuarterlineV2 report output.
- Do not infer that old V1 workflows or milestones still apply.
- When a future report-output spec uses an artifact, record exactly what was
  learned and what decision changed in `docs/decision-log.md`.
- Additional reference reports (other markets, property types, or firms) can be
  added here as the product evolves.
