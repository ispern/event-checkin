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
})
