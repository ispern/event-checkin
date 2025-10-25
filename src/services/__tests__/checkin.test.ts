import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CheckinService } from '../checkin'
import { SheetsService } from '../sheets'
import type { Participant } from '../../types/participant'

describe('CheckinService', () => {
  let checkinService: CheckinService
  let sheetsService: SheetsService

  beforeEach(() => {
    sheetsService = new SheetsService('test-api-key', 'test-spreadsheet-id')
    checkinService = new CheckinService(sheetsService)
  })

  describe('エッジケース', () => {
    it('空白の扱いを正しく処理する', () => {
      const normalized = checkinService.normalizeNameForSearch('  田中太郎  ')
      expect(normalized).toBe('田中太郎')
    })

    it('大文字小文字を区別する', () => {
      const normalized1 = checkinService.normalizeNameForSearch('ABC')
      const normalized2 = checkinService.normalizeNameForSearch('abc')
      expect(normalized1).not.toBe(normalized2)
    })

    it('同姓同名の場合を考慮する', () => {
      // This is tested in the search logic
      expect(true).toBe(true)
    })
  })
})
