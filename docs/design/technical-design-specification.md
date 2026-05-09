# Design Specification: CRE Research & Reporting Platform

This is the original design specification used to generate the concept artwork
at `quarterline-v2-industrial-minimalism-concept.png`. It defines the visual
language, layout architecture, and interaction patterns that the artwork
represents.

## Core Concept: "Industrial Minimalism"
A high-performance, institutional aesthetic designed for high-density data analysis and quarterly report generation. The UI prioritizes precision, spatial hierarchy, and cognitive ergonomics.

## 1. Visual Language & Tokens
### Color Palette
- **Primary Background:** Deep Charcoal (#121417) or Midnight Navy (#0F172A). Avoid pure black to reduce eye strain.
- **Surface/Card Background:** Dark Slate (#1E293B) with subtle 1px borders (#334155).
- **Action Primary:** Electric Indigo (#6366F1) for primary CTAs and active states.
- **Data Highlight (Anomaly):** Burnt Orange (#F59E0B) or Deep Magenta (#D946EF) for highlighting critical data outliers or simulation alerts.
- **Success/Neutral:** Emerald (#10B981) for positive trends; Slate (#94A3B8) for secondary text.

### Typography
- **Primary Interface:** Sans-serif (e.g., Inter, Roboto) for readability.
- **Financial Data:** Monospaced Tabular Numbers (e.g., JetBrains Mono) are mandatory for all currency and percentage columns to ensure perfect vertical alignment.
- **Scale:** High-density type scale (12px/14px/16px) to maximize information density without clutter.

## 2. Layout Architecture: "The Bento Grid"
- **Modular Containers:** Data is compartmentalized into cards with consistent padding and rounded corners (8px).
- **Master-Detail Layout:** A persistent left-hand navigation/portfolio list (20% width) paired with a large, modular workspace (80% width) for deep research.
- **Vertical Hierarchy:**
  1. **Top Tier:** AI Synthesis "Insight Cards" (narrative summaries).
  2. **Middle Tier:** Interactive 3D Geospatial Map & Stacking Plans.
  3. **Bottom Tier:** Detailed Financial Tables & 'What-If' Simulation Sliders.

## 3. High-Performance Features
### 3D Stacking Plans
- Visual representations of buildings sliced vertically by floor.
- Color-coded by occupancy: Occupied (Indigo), Vacant (Slate), Expiring (Magenta).
- Hover-states reveal granular lease terms (WALT, Net Absorption).

### Interactive 'What-If' Simulations
- Physical-mode sliders and dials (Industrial aesthetic) to simulate:
  - Interest Rate Impact on Yield.
  - Rent Growth Sensitivity.
  - Cap Rate Shifts.
- Real-time curve updates showing "Actual" vs. "Simulated" scenarios.

### AI Narrative Layer
- "Insight Cards" at the head of every report that translate complex data fluctuations into plain language (e.g., "Industrial vacancy in Phoenix rose 2% due to new supply completions").

## 4. Report Generation Workflow
- **State Persistence:** Persistent global filters (Market Level vs. Property Level) at the top of the viewport.
- **Snapshot Pattern:** "Pin to Report" functionality on every module to allow analysts to assemble quarterly PDFs/Web reports during active research.
- **Tabular Precision:** Use sticky headers for all financial data tables.
