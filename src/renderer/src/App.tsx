import { useEffect, useState, type ReactElement } from 'react'
import { Sidebar, type RouteId } from './components/Sidebar'
import { FilterBar } from './components/FilterBar'
import { WorkspaceArea } from './components/WorkspaceArea'
import { DataStudio } from './components/DataStudio'
import { ReportsView } from './components/ReportsView'
import { SettingsView } from './components/SettingsView'
import { StatusBar } from './components/StatusBar'
import { CreateWorkspaceDialog } from './components/CreateWorkspaceDialog'
import { ExternalChangesBanner } from './components/ExternalChangesBanner'
import { ErrorBoundary } from './components/ErrorBoundary'
import { WorkspaceProvider, useWorkspace } from './state/workspace'

const VALID_ROUTES: RouteId[] = [
  'portfolio',
  'assets',
  'market-intel',
  'reports',
  'scenarios',
  'data-studio',
  'watchlist',
  'alerts',
  'settings'
]

function isValidRoute(value: string | null): value is RouteId {
  return value !== null && (VALID_ROUTES as string[]).includes(value)
}

function AppShell() {
  const [createOpen, setCreateOpen] = useState(false)
  const [route, setRouteState] = useState<RouteId>('portfolio')
  const { close: closeWorkspace } = useWorkspace()

  const setRoute = (next: RouteId): void => {
    setRouteState(next)
    void window.quarterline.app.saveLastRoute(next).catch(() => {})
  }

  useEffect(() => {
    let cancelled = false
    window.quarterline.app
      .getLastRoute()
      .then((saved) => {
        if (cancelled) return
        if (isValidRoute(saved)) setRouteState(saved)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const dispose = window.quarterline.app.onMenuAction((action) => {
      if (action === 'new-workspace') {
        setCreateOpen(true)
        return
      }
      if (action === 'close-workspace') {
        void closeWorkspace()
        return
      }
      if (action === 'route:portfolio') setRoute('portfolio')
      else if (action === 'route:reports') setRoute('reports')
      else if (action === 'route:data-studio') setRoute('data-studio')
      else if (action === 'route:settings') setRoute('settings')
    })
    return dispose
  }, [closeWorkspace])

  let mainView: ReactElement
  if (route === 'data-studio') {
    mainView = <DataStudio />
  } else if (route === 'settings') {
    mainView = <SettingsView />
  } else if (route === 'reports') {
    mainView = <ReportsView />
  } else {
    mainView = <WorkspaceArea onCreateWorkspace={() => setCreateOpen(true)} />
  }

  return (
    <>
      <div className="app-shell">
        <Sidebar
          activeRoute={route}
          onRouteChange={setRoute}
          onCreateWorkspace={() => setCreateOpen(true)}
        />
        <div className="main-content">
          <FilterBar />
          <ExternalChangesBanner />
          <ErrorBoundary>{mainView}</ErrorBoundary>
        </div>
        <StatusBar />
      </div>
      <CreateWorkspaceDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <WorkspaceProvider>
        <AppShell />
      </WorkspaceProvider>
    </ErrorBoundary>
  )
}
