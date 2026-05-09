export const IpcChannels = {
  DB_QUERY: 'db:query',
  DB_STATUS: 'db:status',
  PING: 'app:ping'
} as const

export type DbStatusResult = {
  connected: boolean
  path: string
  version: string
}

export type PingResult = {
  pong: true
  timestamp: number
  electronVersion: string
  nodeVersion: string
}
