function ModuleCard({
  title,
  placeholder
}: {
  title: string
  placeholder: string
}) {
  return (
    <div className="module-card">
      <div className="module-header">
        <span className="module-title">{title}</span>
      </div>
      <div className="module-body">
        <div className="module-placeholder">{placeholder}</div>
      </div>
    </div>
  )
}

export function WorkspaceArea() {
  return (
    <div className="workspace">
      {/* Tier 1: AI Synthesis */}
      <div className="tier-row cols-3">
        <ModuleCard
          title="AI Synthesis"
          placeholder="Insight cards will appear here"
        />
        <ModuleCard
          title="AI Synthesis"
          placeholder="Market trend analysis"
        />
        <ModuleCard
          title="AI Synthesis"
          placeholder="Anomaly detection"
        />
      </div>

      {/* Tier 2: Spatial */}
      <div className="tier-row cols-2">
        <ModuleCard
          title="Market Overview"
          placeholder="2D market map with submarket boundaries"
        />
        <ModuleCard
          title="Property Stacking Plan"
          placeholder="Floor-by-floor occupancy grid"
        />
      </div>

      {/* Tier 3: Financial + Scenario */}
      <div className="tier-row split-60-40">
        <ModuleCard
          title="Financial Overview"
          placeholder="Market statistics table"
        />
        <ModuleCard
          title="What-If Simulation"
          placeholder="Scenario sliders and comparison chart"
        />
      </div>
    </div>
  )
}
