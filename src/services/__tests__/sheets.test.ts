import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SheetsService } from '../sheets'

describe('SheetsService', () => {
  let service: SheetsService

  beforeEach(() => {
    service = new SheetsService('test-api-key', 'test-spreadsheet-id')
    global.fetch = vi.fn()
  })

  describe('testConnection', () => {
    it('権限エラーをハンドリングする', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
        json: async () => ({ error: { message: 'Insufficient permissions' } })
      } as Response)

      const result = await service.testConnection()
      expect(result.success).toBe(false)
      expect(result.error).toContain('Unauthorized')
    })

    it('ネットワークエラーをハンドリングする', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))

      const result = await service.testConnection()
      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })

    it('スプレッドシートが見つからないエラーをハンドリングする', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        json: async () => ({ error: { message: 'Spreadsheet not found' } })
      } as Response)

      const result = await service.testConnection()
      expect(result.success).toBe(false)
      expect(result.error).toContain('Not Found')
    })
  })

  describe('readParticipants', () => {
    it('ヘッダーに基づいて動的にカラムをマッピングする', async () => {
      const mockData = {
        values: [
          ['name', 'email', '_participant_id', '_checkin_status', '_updated_at'],
          ['田中太郎', 'tanaka@example.com', 'p001', 'not_checked_in', '2024-01-01T10:00:00Z']
        ]
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response)

      const participants = await service.readParticipants()
      expect(participants).toHaveLength(1)
      expect(participants[0].id).toBe('p001')
      expect(participants[0].name).toBe('田中太郎')
      expect(participants[0].rowNumber).toBe(2)
    })

    it('システムカラムがない場合もハンドリングする', async () => {
      const mockData = {
        values: [
          ['name', 'email'],
          ['田中太郎', 'tanaka@example.com']
        ]
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as Response)

      const participants = await service.readParticipants()
      expect(participants).toHaveLength(1)
      expect(participants[0].id).toBe('participant-2')
      expect(participants[0].checkinStatus).toBe('not_checked_in')
    })
  })

  describe('updateParticipant', () => {
    it('rowNumberが必須', async () => {
      const participant = {
        id: '1',
        name: '田中太郎',
        checkinStatus: 'checked_in' as const,
        updatedAt: new Date(),
        updatedBy: 'system'
        // rowNumber is missing
      }

      await expect(service.updateParticipant('test-sheet', participant)).rejects.toThrow('Row number is required')
    })

    it('undoで空文字列を送信してクリアする', async () => {
      const mockHeaders = {
        values: [['name', '_checkin_status', '_checkin_at', '_checkin_by']]
      }

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({ ok: true, json: async () => mockHeaders } as Response) // headers
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response) // update

      const participant = {
        id: '1',
        name: '田中太郎',
        checkinStatus: 'not_checked_in' as const,
        checkinAt: undefined,
        checkinBy: undefined,
        updatedAt: new Date(),
        updatedBy: 'system',
        rowNumber: 2
      }

      await service.updateParticipant('test-sheet', participant)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('""') // Empty string in values
        })
      )
    })
  })

  describe('addSystemColumns', () => {
    it('既存のカラムはスキップする', async () => {
      const mockHeaders = {
        values: [['name', 'email', '_participant_id', '_checkin_status']]
      }

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({ ok: true, json: async () => mockHeaders } as Response) // read
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response) // update

      await service.addSystemColumns('test-sheet')

      // Should only add missing columns
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('_checkin_at')
        })
      )
    })

    it('全てのシステムカラムが存在する場合は何もしない', async () => {
      const mockHeaders = {
        values: [['name', '_participant_id', '_checkin_status', '_checkin_at', '_checkin_by', '_updated_at', '_updated_by', '_audit_note']]
      }

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({ ok: true, json: async () => mockHeaders } as Response)

      await service.addSystemColumns('test-sheet')

      // Should only call fetch once for reading headers
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })
})
