import { homedir } from 'os'
import { join } from 'path'

export function getQuarterlineRoot(): string {
  return join(homedir(), '.quarterline')
}

export function getAppConfigPath(): string {
  return join(getQuarterlineRoot(), 'config.json')
}

export function getWorkspacesRoot(): string {
  return join(getQuarterlineRoot(), 'workspaces')
}

export function getWorkspaceFolder(id: string): string {
  return join(getWorkspacesRoot(), id)
}

export function getWorkspaceDbPath(id: string): string {
  return join(getWorkspaceFolder(id), 'workspace.db')
}

export function getWorkspaceManifestPath(id: string): string {
  return join(getWorkspaceFolder(id), 'WORKSPACE.md')
}

export function getWorkspaceConfigPath(id: string): string {
  return join(getWorkspaceFolder(id), '.quarterline', 'config.json')
}
