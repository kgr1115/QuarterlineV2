import { useWorkspace } from '../state/workspace'
import { KeyMetricsBanner } from './modules/KeyMetricsBanner'
import { SynthesisCards } from './modules/SynthesisCards'
import { MarketMap } from './modules/MarketMap'
import { StackingPlan } from './modules/StackingPlan'
import { FinancialTable } from './modules/FinancialTable'
import { ScenarioControls } from './modules/ScenarioControls'

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
      <KeyMetricsBanner />

      <SynthesisCards />

      <div className="tier-row cols-2">
        <MarketMap />
        <StackingPlan />
      </div>

      <div className="tier-row split-60-40">
        <FinancialTable />
        <ScenarioControls />
      </div>
    </div>
  )
}
