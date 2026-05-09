# Path Forward

Date: 2026-05-09

## Purpose

This document explains how QuarterlineV2 should move from documentation to an
approved desktop implementation plan. It is not a backlog and should not carry
over V1 milestone history.

## Current Path

1. Finish the documentation reset.
2. Select the desktop architecture.
3. Specify the design system from the artwork.
4. Define the first desktop MVP scope.
5. Create a fresh implementation scaffold.
6. Build in milestone slices with verification and documentation updates.

## Decision Gates

No code should begin until these are answered:

- What runtime should package the desktop app?
- Where does local workspace data live?
- How are confidential source files handled?
- What export path is required first?
- Which modules need real interactivity in the first MVP?
- What must remain offline-capable?
- Which services, if any, are allowed in the first MVP?

## Planning Outputs

The next planning pass should produce:

- Desktop architecture decision record.
- V2 MVP scope.
- Design-system specification.
- Fresh milestone plan.
- Verification strategy.

## Implementation Principle

Future code should be built from V2 decisions, not copied from the V1 web-app
implementation.
