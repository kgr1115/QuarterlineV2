import { useState, type ReactElement } from 'react'
import { Sidebar, type RouteId } from './components/Sidebar'
import { FilterBar } from './components/FilterBar'
import { WorkspaceArea } from './components/WorkspaceArea'
import { DataStudio } from './components/DataStudio'
import { SettingsView } from './components/SettingsView'
import { StatusBar } from './components/StatusBar'
import { CreateWorkspaceDialog } from './components/CreateWorkspaceDialog'
import { ExternalChangesBanner } from './components/ExternalChangesBanner'
import { WorkspaceProvider } from './state/workspace'

export function App() {
  const [createOpen, setCreateOpen] = useState(false)
  const [route, setRoute] = useState<RouteId>('portfolio')

  let mainView: ReactElement
  if (route === 'data-studio') {
    mainView = <DataStudio />
  } else if (route === 'settings') {
    mainView = <SettingsView />
  } else {
    mainView = <WorkspaceArea onCreateWorkspace={() => setCreateOpen(true)} />
  }

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
          <ExternalChangesBanner />
          {mainView}
        </div>
        <StatusBar />
      </div>
      <CreateWorkspaceDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </WorkspaceProvider>
  )
}
