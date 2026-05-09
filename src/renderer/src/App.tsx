import { useState } from 'react'
import { Sidebar, type RouteId } from './components/Sidebar'
import { FilterBar } from './components/FilterBar'
import { WorkspaceArea } from './components/WorkspaceArea'
import { DataStudio } from './components/DataStudio'
import { StatusBar } from './components/StatusBar'
import { CreateWorkspaceDialog } from './components/CreateWorkspaceDialog'
import { WorkspaceProvider } from './state/workspace'

export function App() {
  const [createOpen, setCreateOpen] = useState(false)
  const [route, setRoute] = useState<RouteId>('portfolio')

  return (
    <WorkspaceProvider>
      <div className="app-shell">
        <Sidebar
          activeRoute={route}
          onRouteChange={setRoute}
          onCreateWorkspace={() => setCreateOpen(true)}
        />
        <div className="main-content">
          <FilterBar />
          {route === 'data-studio' ? (
            <DataStudio />
          ) : (
            <WorkspaceArea onCreateWorkspace={() => setCreateOpen(true)} />
          )}
        </div>
        <StatusBar />
      </div>
      <CreateWorkspaceDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </WorkspaceProvider>
  )
}
