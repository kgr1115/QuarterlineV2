# Agent Structure

QuarterlineV2 uses a chief-agent operating model. Agents may be Claude Opus 4.7,
Codex, or another capable coding/research agent, but the responsibilities stay
the same.

## Chiefs

Chief Implementation Agent owns:

- Overall sequencing.
- Scope control.
- Milestone definition.
- Decision logging.
- Cross-domain tradeoffs.
- Acceptance criteria.
- Final readiness calls.

Chief Product and Frontend Agent owns:

- Desktop app information architecture.
- Analyst workflows.
- Visual hierarchy.
- Design-system fidelity.
- Accessibility.
- Report-builder ergonomics.
- Product copy.
- Usability validation.

Chief Backend and Data Agent owns:

- Local-first data architecture.
- Desktop persistence and file boundaries.
- Source ingestion contracts.
- AI/service integration architecture.
- Security, privacy, and auditability.
- Hosted sync and collaboration assumptions.
- Performance and reliability.

Chief Reporting Agent owns:

- Quarterly report output structure.
- Exhibit/table standards.
- Citation and evidence discipline.
- PDF/export readiness.
- Benchmark comparison against reference artifacts.

## Subagent Template

```text
Subagent:
Reports to:
Task:
Context:
Constraints:
Deliverable:
Deadline or urgency:
Do not do:
```

## Chief Report Template

```text
Chief:
Domain:
Recommendation:
Key reasoning:
Risks:
Open questions:
Subagents used:
Decisions needed from project owner:
```

## Required Handoff Updates

After meaningful work, update:

- `docs/decision-log.md` for major decisions.
- Any affected domain docs.
- `docs/milestones.md` — set status to **In progress** when starting,
  **Complete** when finished. See "Progress Tracking Convention" in
  `docs/documentation-flow.md` for the exact format.
- `NEXT_STEPS.md`
- `docs/agent-handoff.md`

## Current Phase Rules

- Current phase: implementation. Milestones 0-3 are complete.
- Coding is authorized. Work against the active milestone defined in
  `docs/milestones.md` and tracked in `NEXT_STEPS.md`.
- The generated artwork remains a design goal. Implementation should converge
  toward it without claiming visual fidelity that does not yet exist.
- Update `docs/milestones.md`, `NEXT_STEPS.md`, and `docs/agent-handoff.md`
  whenever a milestone is started, advanced, or completed.
