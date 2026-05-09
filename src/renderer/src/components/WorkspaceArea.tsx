import { useWorkspace } from '../state/workspace'

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

type Props = {
  onCreateWorkspace: () => void
}

export function WorkspaceArea({ onCreateWorkspace }: Props) {
  const { current, loading } = useWorkspace()

  if (loading) {
    return (
      <div className="workspace workspace-empty">
        <div className="workspace-empty-text">Loading…</div>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="workspace workspace-empty">
        <div className="workspace-empty-card">
          <div className="workspace-empty-eyebrow">No workspace open</div>
          <div className="workspace-empty-title">
            Create a workspace to begin
          </div>
          <div className="workspace-empty-body">
            A workspace holds the data, narratives, and exports for one market
            and quarter. Each workspace lives as a folder under
            <code> ~/.quarterline/workspaces/</code> so external AI tools can
            read and write content alongside the app.
          </div>
          <button
            type="button"
            className="workspace-empty-btn"
            onClick={onCreateWorkspace}
          >
            New workspace
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="workspace">
      <div className="tier-row cols-3">
        <ModuleCard
          title="AI Synthesis"
          placeholder="Insight cards will appear here"
        />
        <ModuleCard title="AI Synthesis" placeholder="Market trend analysis" />
        <ModuleCard title="AI Synthesis" placeholder="Anomaly detection" />
      </div>

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
