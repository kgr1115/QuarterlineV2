# Documentation Flow

Date: 2026-05-09

## Purpose

This document explains how QuarterlineV2 documentation should be used. It exists
so future agents understand the flow without inheriting V1 implementation plans.

## Read Order

1. `claude.md`
2. `agent.md`
3. `README.md`
4. `NEXT_STEPS.md`
5. `docs/agent-handoff.md`
6. `docs/documentation-flow.md`
7. `docs/chief-agent-workflow.md`
8. `docs/design/quarterline-v2-design-goals.md`
9. Task-specific domain docs.

## Update Order

After meaningful work:

1. Record major decisions in `docs/decision-log.md`.
2. Update affected domain docs.
3. Update `NEXT_STEPS.md`.
4. Update `docs/agent-handoff.md`.

## Progress Tracking Convention

Milestones in `docs/milestones.md` carry one of these statuses, and the
status is the source of truth for "where are we":

- **Not started** — no status line; the milestone is documented but no work
  has begun.
- **In progress** — `Status: **In progress.**` plus a "Work to date" list of
  what has been built or decided since work began. Update this list as the
  milestone advances; do not wait until the end.
- **Complete** — `Status: **Complete.**` plus a "Deliverables" list and
  "Acceptance criteria (all met)" with the verification date. Add a matching
  entry to `docs/decision-log.md` capturing what landed and any
  scaffold-level decisions worth preserving.

When work begins on a milestone:

1. Set its status to **In progress** with a one-line note on what is being
   built first.
2. Update `NEXT_STEPS.md` to point at it.
3. Update `docs/agent-handoff.md` so the next session sees the active
   milestone immediately.

When work completes on a milestone:

1. Promote the status to **Complete** with deliverables and verification date.
2. Add a decision-log entry summarizing what shipped.
3. Update `NEXT_STEPS.md` to point at the next milestone.
4. Update `docs/agent-handoff.md` with the new "Completed Milestones" entry
   and the recommended next step.

This keeps `docs/milestones.md` honest at all times — readers should never
have to guess whether a milestone is partway done.

## Document Roles

- `README.md` tells a new agent what this repo is.
- `NEXT_STEPS.md` tells the next agent what to do now.
- `agent.md` and `claude.md` define agent behavior.
- `docs/chief-agent-workflow.md` defines roles and templates.
- `docs/decision-log.md` preserves decisions.
- `docs/milestones.md` defines the concrete milestone plan (M0-M10+).
- `docs/mvp-scope.md` defines the MVP boundary with acceptance criteria.
- `docs/architecture.md` defines Electron runtime, AI bridge, data architecture.
- `docs/data-model.md` defines multi-workspace entities and SQLite + file hybrid.
- `docs/ai-bridge-spec.md` defines the WORKSPACE.md manifest, data export
  schemas, and the contract for external AI tools.
- `docs/ux-flows.md` defines analyst journeys.
- `docs/design/quarterline-v2-design-goals.md` defines design goals and artwork.
- `docs/design/technical-design-specification.md` is the original spec for the
  concept artwork.
- `docs/design/design-system-spec.md` defines tokens, typography, layout grid,
  component anatomy, and interaction states.
- `docs/publication-output-spec.md` defines report structure benchmarked against
  the CBRE reference.
- `docs/reference-artifacts/` stores the CBRE Atlanta Q1 2026 benchmark report.

## Current Rule

The current phase is implementation. Milestones 0-3 are complete. Continue
through the milestone plan in `docs/milestones.md`. After meaningful work,
update `docs/milestones.md`, `NEXT_STEPS.md`, and `docs/agent-handoff.md` so
future agents see accurate progress.
