import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { FilterBar } from './components/FilterBar'
import { WorkspaceArea } from './components/WorkspaceArea'
import { StatusBar } from './components/StatusBar'
import { CreateWorkspaceDialog } from './components/CreateWorkspaceDialog'
import { WorkspaceProvider } from './state/workspace'

export function App() {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <WorkspaceProvider>
      <div className="app-shell">
        <Sidebar onCreateWorkspace={() => setCreateOpen(true)} />
        <div className="main-content">
          <FilterBar />
          <WorkspaceArea onCreateWorkspace={() => setCreateOpen(true)} />
        </div>
        <StatusBar />
      </div>
      <CreateWorkspaceDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </WorkspaceProvider>
  )
}
