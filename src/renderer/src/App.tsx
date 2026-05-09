import { Sidebar } from './components/Sidebar'
import { FilterBar } from './components/FilterBar'
import { WorkspaceArea } from './components/WorkspaceArea'
import { StatusBar } from './components/StatusBar'

export function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <FilterBar />
        <WorkspaceArea />
      </div>
      <StatusBar />
    </div>
  )
}
