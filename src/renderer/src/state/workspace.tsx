import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'

type Workspace = {
  id: string
  name: string
  market: string
  propertyType: string
  currentQuarter: string
  createdAt: string
  updatedAt: string
}

type WorkspaceCreateInput = {
  name: string
  market: string
  propertyType: string
  quarter: string
}

type WorkspaceContextValue = {
  current: Workspace | null
  list: Workspace[]
  loading: boolean
  refresh: () => Promise<void>
  create: (input: WorkspaceCreateInput) => Promise<Workspace>
  open: (id: string) => Promise<Workspace>
  close: () => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Workspace | null>(null)
  const [list, setList] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [next, listing] = await Promise.all([
      window.quarterline.workspace.current(),
      window.quarterline.workspace.list()
    ])
    setCurrent(next)
    setList(listing)
  }, [])

  useEffect(() => {
    let cancelled = false
    refresh()
      .catch((err) => console.error('Failed to load workspace state', err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refresh])

  const create = useCallback(
    async (input: WorkspaceCreateInput) => {
      const created = await window.quarterline.workspace.create(input)
      const opened = await window.quarterline.workspace.open(created.id)
      await refresh()
      return opened
    },
    [refresh]
  )

  const open = useCallback(
    async (id: string) => {
      const opened = await window.quarterline.workspace.open(id)
      await refresh()
      return opened
    },
    [refresh]
  )

  const close = useCallback(async () => {
    await window.quarterline.workspace.close()
    await refresh()
  }, [refresh])

  const value = useMemo<WorkspaceContextValue>(
    () => ({ current, list, loading, refresh, create, open, close }),
    [current, list, loading, refresh, create, open, close]
  )

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  )
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
