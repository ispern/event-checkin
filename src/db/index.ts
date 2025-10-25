import Dexie, { Table } from 'dexie'
import type { Participant } from '@/types/participant'

export interface PendingOperationRecord {
  id?: number
  type: string
  payload: unknown
  createdAt: number
}

export interface ConfigRecord {
  key: string
  value: string
}

class EventCheckinDB extends Dexie {
  participants!: Table<Participant, string>
  pendingOperations!: Table<PendingOperationRecord, number>
  config!: Table<ConfigRecord, string>

  constructor() {
    super('EventCheckinDB')
    this.version(1).stores({
      participants: 'id, name, email, checkinStatus',
      pendingOperations: '++id, type, createdAt',
      config: '&key'
    })
  }
}

export const db = new EventCheckinDB()
