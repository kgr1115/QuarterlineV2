# QuarterlineV2 Design System Specification

Date: 2026-05-09

## Purpose

This document translates the concept artwork and the original technical design
specification into implementable design-system guidance. It is the reference
for all future UI work.

Source material:

- `docs/design/quarterline-v2-industrial-minimalism-concept.png` (concept art)
- `docs/design/technical-design-specification.md` (original spec)

## 1. Color Tokens

### Backgrounds

| Token                | Hex       | Usage                                      |
|----------------------|-----------|---------------------------------------------|
| `bg-app`             | `#0F172A` | App-level background (midnight navy)        |
| `bg-surface`         | `#1E293B` | Cards, panels, modals                       |
| `bg-surface-raised`  | `#263548` | Elevated surfaces, dropdowns, popovers      |
| `bg-sidebar`         | `#0C1220` | Portfolio sidebar background                |
| `bg-input`           | `#162032` | Input fields, search boxes                  |

### Borders

| Token                | Hex       | Usage                                      |
|----------------------|-----------|---------------------------------------------|
| `border-subtle`      | `#334155` | Panel and card borders (1px)                |
| `border-focus`       | `#6366F1` | Focus rings, active borders                 |
| `border-divider`     | `#1E293B` | Table row dividers, section separators      |

### Text

| Token                | Hex       | Usage                                      |
|----------------------|-----------|---------------------------------------------|
| `text-primary`       | `#F8FAFC` | Primary text, headings                      |
| `text-secondary`     | `#94A3B8` | Secondary text, labels, descriptions        |
| `text-tertiary`      | `#64748B` | Disabled text, placeholders                 |
| `text-inverse`       | `#0F172A` | Text on light/accent backgrounds            |

### Accent and Status

| Token                | Hex       | Usage                                      |
|----------------------|-----------|---------------------------------------------|
| `accent-primary`     | `#6366F1` | Primary actions, active nav, links          |
| `accent-primary-hover` | `#818CF8` | Hover state for primary accent            |
| `status-positive`    | `#10B981` | Positive trends, up arrows, gains           |
| `status-negative`    | `#EF4444` | Negative trends, down arrows, losses        |
| `status-anomaly`     | `#F59E0B` | Anomaly alerts, burnt orange highlights     |
| `status-expiring`    | `#D946EF` | Expiring leases, magenta alerts             |

### Data Visualization

| Token                | Hex       | Usage                                      |
|----------------------|-----------|---------------------------------------------|
| `viz-occupied`       | `#6366F1` | Occupied floors in stacking plan            |
| `viz-vacant`         | `#475569` | Vacant floors/suites                        |
| `viz-expiring`       | `#D946EF` | Expiring leases in stacking plan            |
| `viz-chart-1`        | `#6366F1` | Primary chart series                        |
| `viz-chart-2`        | `#10B981` | Secondary chart series                      |
| `viz-chart-3`        | `#F59E0B` | Tertiary chart series                       |
| `viz-chart-4`        | `#D946EF` | Quaternary chart series                     |
| `viz-grid`           | `#1E293B` | Chart gridlines                             |

## 2. Typography

### Font Stack

| Role              | Font Family           | Fallback                    |
|-------------------|-----------------------|-----------------------------|
| Interface         | Inter                 | system-ui, sans-serif       |
| Financial data    | JetBrains Mono        | Consolas, monospace         |

### Type Scale

| Token          | Size  | Weight | Line Height | Usage                        |
|----------------|-------|--------|-------------|------------------------------|
| `heading-lg`   | 18px  | 600    | 24px        | Section headings             |
| `heading-md`   | 16px  | 600    | 22px        | Card titles, module headers  |
| `heading-sm`   | 14px  | 600    | 20px        | Subheadings, column headers  |
| `body`         | 14px  | 400    | 20px        | Body text, descriptions      |
| `body-sm`      | 12px  | 400    | 16px        | Compact labels, metadata     |
| `caption`      | 11px  | 400    | 14px        | Footnotes, source citations  |
| `data-lg`      | 24px  | 700    | 28px        | Hero metric values           |
| `data-md`      | 14px  | 500    | 20px        | Table cell values            |
| `data-sm`      | 12px  | 500    | 16px        | Compact metric values        |

### Tabular Numerics

All financial data uses `font-variant-numeric: tabular-nums` or the JetBrains
Mono font. Columns of numbers must align vertically. Right-align numeric
columns. Use consistent decimal precision within a column.

Formatting conventions:

- Currency: `$33.75` (no thousands separator under 10,000; `$1,234` above).
- Percentage: `33.1%` (one decimal).
- Square footage: `443,000 SF` or `146.95 MSF`.
- Negative values: parentheses for financials — `(443,000)` not `-443,000`.

## 3. Spacing

| Token     | Value | Usage                                       |
|-----------|-------|----------------------------------------------|
| `space-1` | 4px   | Tight internal padding, icon gaps            |
| `space-2` | 8px   | Default internal padding, element spacing    |
| `space-3` | 12px  | Card internal padding                        |
| `space-4` | 16px  | Section spacing, panel padding               |
| `space-5` | 20px  | Major section gaps                           |
| `space-6` | 24px  | Panel-to-panel gaps                          |
| `space-8` | 32px  | Large layout gaps                            |

## 4. Radius

| Token            | Value | Usage                                    |
|------------------|-------|-------------------------------------------|
| `radius-sm`      | 4px   | Buttons, inputs, badges                   |
| `radius-md`      | 8px   | Cards, panels, modals                     |
| `radius-lg`      | 12px  | Large containers, dialog windows          |
| `radius-full`    | 9999px| Circular avatars, status dots             |

## 5. Layout Grid

### App Shell

```
┌─────────────────────────────────────────────────────────────────┐
│  Title Bar (Electron native frame)                              │
├──────────┬──────────────────────────────────────────────────────┤
│          │  Filter Bar [Market/Property] [Market] [Qtr] [Type] │
│          ├──────────────────────────────────────────────────────┤
│ Portfolio│                                                      │
│ Sidebar  │  Main Workspace                                      │
│          │                                                      │
│  ~20%    │  ~80%                                                │
│          │                                                      │
│          │                                                      │
├──────────┴──────────────────────────────────────────────────────┤
│  Status Bar (workspace name, save status, connection)           │
└─────────────────────────────────────────────────────────────────┘
```

### Sidebar (20% width, min 240px, max 320px)

- App logo and name at top.
- Workspace switcher (dropdown or list).
- Primary navigation: Portfolio, Assets, Reports, Market Intelligence,
  Scenarios, Data Studio, Watchlist, Alerts, Settings.
- Each nav item: icon + label, indigo highlight when active.
- Portfolio list below navigation: asset names with summary metrics.
- Sidebar is collapsible to icon-only mode (~60px).

### Filter Bar (full width of main workspace, 48px height)

- Segmented control: Market Level / Property Level.
- Market selector dropdown.
- Quarter selector dropdown.
- Property type selector dropdown.
- Filter/search action.
- Report assembly action (opens report panel).

### Main Workspace Tiers

The main workspace is a vertical stack of three tiers. Each tier is a row of
one or more module cards. Tiers can scroll vertically if the viewport is
shorter than the content.

**Tier 1 — AI Synthesis (top, ~160px height)**

A horizontal row of 3-4 insight cards. Each card:

- Card background: `bg-surface`.
- Heading: plain-language market narrative (e.g., "Declining Vacancy Driven
  by Upper Tier Demand").
- Body: 2-3 sentence synthesis.
- Footer: "Pin to Report" action button.
- Cards scroll horizontally if more than fit in the viewport width.

**Tier 2 — Spatial (middle, ~40% of remaining height)**

Two modules side by side, equal width:

- Left: Market Overview (2D map in MVP, 3D in finished product).
- Right: Property Stacking Plan (2D grid in MVP, 3D in finished product).

Each module has a card header with title and controls.

**Tier 3 — Financial + Scenario (bottom, ~40% of remaining height)**

Two modules side by side:

- Left (~60% width): Financial Overview table.
- Right (~40% width): What-If Scenario Simulation.

### Responsive Behavior

The app targets desktop windows (1280px minimum width). On narrower windows,
tier 2 and tier 3 modules stack vertically (one per row) instead of side by
side. The sidebar collapses to icon-only below 1440px viewport width.

## 6. Component Anatomy

### Module Card

Every workspace module is wrapped in a card:

```
┌──────────────────────────────────────┐
│  Header: Title          [Controls]   │  ← bg-surface, border-subtle
│──────────────────────────────────────│
│                                      │
│  Content area                        │
│                                      │
│──────────────────────────────────────│
│  Footer: Source / Pin to Report      │  ← optional
└──────────────────────────────────────┘
```

- Border: 1px `border-subtle`.
- Radius: `radius-md` (8px).
- Padding: `space-3` (12px) internal.
- Header: `heading-md` title, secondary text for subtitle.
- Controls: filter, expand, pin, more menu.

### Financial Table

- Sticky header row with `heading-sm` column labels.
- Row height: 36px.
- Cell padding: `space-2` horizontal, centered vertically.
- Alternating row backgrounds: `bg-surface` and `bg-app` for readability.
- Numeric columns: right-aligned, JetBrains Mono, `data-md`.
- Text columns: left-aligned, Inter, `body`.
- Negative values in parentheses, `status-negative` color.
- Positive change arrows: `status-positive` color.
- Row hover: subtle highlight at `bg-surface-raised`.
- Column sorting indicators in header.

### Key Metrics Banner

A horizontal row of 4-6 hero metrics (used on report cover page and dashboard
header):

```
  ▼ 33.1%        ▼ (443,052)      ▶ 0              ▶ 224,000        ▼ $33.75
  Availability    SF Net           SF Construction   SF Under         FSG/YR Direct
  Rate            Absorption       Delivered         Construction     Lease Rate
```

- Value: `data-lg`, `text-primary`.
- Directional arrow: colored by `status-positive` (up/good) or
  `status-negative` (down/bad), context-dependent.
- Label: `body-sm`, `text-secondary`.
- Spacing: evenly distributed across the banner width.

### Scenario Controls

- Slider tracks: thin horizontal bar, `border-subtle` background,
  `accent-primary` fill for the active range.
- Slider thumb: 16px circle, `accent-primary`, `border-focus` ring on drag.
- Label above slider: parameter name (`body-sm`).
- Value readout next to slider: `data-md`, updates in real time.
- Reset button per slider.
- Chart below sliders: "Actual" line (solid, `viz-chart-1`) vs. "Simulated"
  line (dashed, `viz-chart-3`).

### Navigation Item

- Default: icon + label, `text-secondary`.
- Hover: `text-primary`, `bg-surface` background.
- Active: `accent-primary` left border (3px), `text-primary`, label in
  `accent-primary`.
- Icon size: 20px.
- Item height: 40px.
- Padding: `space-3` left, `space-2` right.

### Buttons

| Variant   | Background       | Text            | Border           |
|-----------|------------------|-----------------|-------------------|
| Primary   | `accent-primary` | `text-primary`  | none              |
| Secondary | transparent      | `accent-primary`| `accent-primary`  |
| Ghost     | transparent      | `text-secondary`| none              |
| Danger    | `status-negative`| `text-primary`  | none              |

- Height: 32px (compact), 36px (default).
- Radius: `radius-sm` (4px).
- Padding: `space-2` vertical, `space-3` horizontal.
- Hover: lighten background 10%.
- Disabled: 40% opacity, no pointer events.

### Pin to Report Badge

A small action affordance on module cards:

- Icon: pin/bookmark icon, 16px.
- Default: `text-tertiary`.
- Hover: `accent-primary`.
- Pinned state: `accent-primary` filled icon, subtle glow.
- Click toggles pin state and adds/removes from report assembly queue.

## 7. Interaction States

| State      | Visual Treatment                                    |
|------------|------------------------------------------------------|
| Default    | Base token colors                                    |
| Hover      | Lighten background, show pointer cursor              |
| Active     | Accent-primary indicator (border, fill, or text)     |
| Focus      | 2px `border-focus` ring, offset 2px                  |
| Disabled   | 40% opacity, no interaction                          |
| Selected   | `accent-primary` background at 10% opacity + border  |
| Pinned     | Filled pin icon, `accent-primary`                    |
| Loading    | Skeleton placeholder with subtle pulse animation     |
| Error      | `status-negative` border and icon                    |

## 8. Elevation and Shadows

Use elevation sparingly. The dark palette reduces the need for shadows.

| Level | Usage               | Shadow                                    |
|-------|---------------------|-------------------------------------------|
| 0     | Base surfaces       | None                                      |
| 1     | Cards, panels       | None (use `border-subtle` instead)        |
| 2     | Dropdowns, popovers | `0 4px 12px rgba(0,0,0,0.4)`             |
| 3     | Modals, dialogs     | `0 8px 24px rgba(0,0,0,0.5)`             |

## 9. Motion

- Default transition duration: 150ms.
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (standard ease-out).
- Sidebar collapse/expand: 200ms.
- Panel resize: 150ms.
- Chart data transitions: 300ms.
- No decorative animations. Motion communicates state changes only.

## 10. Desktop Chrome

### Title Bar

Use Electron's native frame on Windows (familiar minimize/maximize/close
buttons). The app title and logo appear in the title bar or just below it.

### Status Bar (bottom, 28px height)

- Left: workspace name and market.
- Center: save status ("Saved" / "Unsaved changes" / "Saving...").
- Right: AI provider status (connected/disconnected), notification count.
- Background: `bg-sidebar`.
- Text: `body-sm`, `text-secondary`.

### Window Behavior

- Minimum size: 1280 x 720.
- Remember window position and size across sessions.
- Support multi-monitor awareness.

## 11. Iconography

- Style: outlined, 1.5px stroke, rounded caps.
- Size: 16px (inline), 20px (navigation), 24px (empty states).
- Color: inherits from text token of context.
- Icon set: use a consistent set (Lucide, Phosphor, or similar). Pick one
  and commit across the app.

## 12. Design Non-Goals

- No light theme in MVP (dark-only industrial workspace).
- No rounded "friendly" UI patterns (pill buttons, pastel colors).
- No marketing visuals, hero sections, or onboarding tours in the workspace.
- No animated illustrations or decorative graphics.
- No drag-and-drop rearrangement of workspace tiers (fixed layout).
