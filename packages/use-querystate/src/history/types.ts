
export interface LocationDescriptor {
  pathname?: string
  search?: string
  state?: unknown
  hash?: string
}

export interface Location {
  readonly pathname: string
  readonly search: string
  readonly hash: string
}

export interface HistoryType {
  push(path: string, state?: unknown): void
  push(location: LocationDescriptor): void
}