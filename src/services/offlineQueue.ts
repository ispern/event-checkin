import { db } from '@/db'
import type { PendingOperationRecord } from '@/db'
import type { ParticipantUpdate } from '@/types/participant'

export interface OfflineOperation<TPayload = ParticipantUpdate> extends PendingOperationRecord {
  payload: TPayload
}

export type OfflineProcessor<TPayload = ParticipantUpdate> = (
  operation: OfflineOperation<TPayload>
) => Promise<void>

export class OfflineQueueService {
  async addToQueue<TPayload = ParticipantUpdate>(
    operation: Omit<OfflineOperation<TPayload>, 'id'>
  ): Promise<number> {
    const record: OfflineOperation<TPayload> = {
      ...operation,
      createdAt: operation.createdAt ?? Date.now()
    }
    return db.pendingOperations.add(record)
  }

  async getQueuedOperations<TPayload = ParticipantUpdate>(): Promise<OfflineOperation<TPayload>[]> {
    return db.pendingOperations.orderBy('createdAt').toArray() as Promise<OfflineOperation<TPayload>[]>
  }

  async processQueue<TPayload = ParticipantUpdate>(processor: OfflineProcessor<TPayload>): Promise<void> {
    const queued = await this.getQueuedOperations<TPayload>()

    for (const operation of queued) {
      try {
        await processor(operation)
        if (operation.id) {
          await db.pendingOperations.delete(operation.id)
        }
      } catch (error) {
        if (!this.shouldRetry(error)) {
          throw error
        }
        break
      }
    }
  }

  private shouldRetry(error: unknown): boolean {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return true
    }

    if (error instanceof Error && /timeout/i.test(error.message)) {
      return true
    }

    return false
  }
}
