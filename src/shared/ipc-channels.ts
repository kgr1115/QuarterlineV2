export const IpcChannels = {
  PING: 'app:ping',
  DB_STATUS: 'db:status',

  WORKSPACE_LIST: 'workspace:list',
  WORKSPACE_CREATE: 'workspace:create',
  WORKSPACE_OPEN: 'workspace:open',
  WORKSPACE_CLOSE: 'workspace:close',
  WORKSPACE_CURRENT: 'workspace:current',

  WINDOW_STATE_GET: 'window:state:get',
  WINDOW_STATE_SAVE: 'window:state:save'
} as const

export type DbStatusResult = {
  connected: boolean
  path: string | null
  version: string | null
}

export type PingResult = {
  pong: true
  timestamp: number
  electronVersion: string
  nodeVersion: string
}

export type Workspace = {
  id: string
  name: string
  market: string
  propertyType: string
  currentQuarter: string
  createdAt: string
  updatedAt: string
}

export type WorkspaceCreateInput = {
  name: string
  market: string
  propertyType: string
  quarter: string
}

export type WindowState = {
  width: number
  height: number
  x?: number
  y?: number
  isMaximized: boolean
}
