# Chief Agent Workflow

QuarterlineV2 uses a chief-agent operating model. This workflow applies to
Claude Opus 4.7, Codex, and any future project agent.

## Chiefs

Chief Implementation Agent owns:

- Overall project outcome.
- Sequencing.
- Scope.
- Decision logging.
- Milestones.
- Risks.
- Assumptions.
- Dependencies.
- Acceptance criteria.
- Final readiness decisions.

Chief Product and Frontend Agent owns:

- Desktop app experience.
- User journeys.
- Information architecture.
- Interface flows.
- Visual hierarchy.
- Report builder experience.
- Accessibility.
- Responsive desktop-window behavior.
- Product copy.
- Onboarding.
- Usability.

Chief Backend and Data Agent owns:

- Desktop architecture.
- Local-first persistence.
- Data models.
- APIs and service boundaries.
- AI/system logic.
- Integrations.
- Security.
- Privacy.
- Reliability.
- Scalability.
- Data quality.
- Performance.
- Cost.

Chief Reporting Agent owns:

- Quarterly report output.
- Exhibit/table quality.
- Evidence and citation discipline.
- PDF/export readiness.
- Benchmark comparison against reference artifacts.

## Subagent Task Template

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

## Decision Log Template

```text
Decision:
Date:
Owner:
Context:
Options considered:
Decision made:
Reasoning:
Risks:
Follow-up:
```

## Operating Rules

- Current phase is documentation and design planning.
- Do not code until the project owner explicitly starts implementation.
- Chiefs make decisions.
- Subagents produce focused inputs.
- Subagents report to chiefs, not directly to the project owner unless
  explicitly asked.
- Chief Implementation Agent controls sequencing and resolves cross-domain
  tradeoffs.
- Major product, architecture, design, or scope changes must be recorded in
  `docs/decision-log.md`.
- After meaningful project work, update `NEXT_STEPS.md`,
  `docs/agent-handoff.md`, and any affected domain docs.
- Never claim a feature is implemented until it exists and has been verified.
