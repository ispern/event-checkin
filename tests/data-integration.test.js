import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('データモデルとGoogle Sheets API統合（タスク4）', () => {
  describe('4.1 コアデータ型とインターフェースの定義', () => {
    it('Participant型定義が存在する', () => {
      const typesPath = './src/types/participant.ts'
      expect(fs.existsSync(typesPath)).toBe(true)
      const content = fs.readFileSync(typesPath, 'utf-8')
      expect(content).toContain('export interface Participant')
      expect(content).toContain('id: string')
      expect(content).toContain('name: string')
      expect(content).toContain('email?: string')
      expect(content).toContain('checkinStatus:')
      expect(content).toContain('checkinAt?: Date')
      expect(content).toContain('checkinBy?: string')
    })

    it('User型定義が存在する', () => {
      const typesPath = './src/types/user.ts'
      expect(fs.existsSync(typesPath)).toBe(true)
      const content = fs.readFileSync(typesPath, 'utf-8')
      expect(content).toContain('export interface User')
      expect(content).toContain('email: string')
      expect(content).toContain('name: string')
      expect(content).toContain('role:')
    })

    it('AppConfig型定義が存在する', () => {
      const typesPath = './src/types/config.ts'
      expect(fs.existsSync(typesPath)).toBe(true)
      const content = fs.readFileSync(typesPath, 'utf-8')
      expect(content).toContain('export interface AppConfig')
      expect(content).toContain('spreadsheetId:')
      expect(content).toContain('nameColumnIndex:')
      expect(content).toContain('emailColumnIndex:')
    })

    it('Google Sheets API型定義が存在する', () => {
      const typesPath = './src/types/sheets.ts'
      expect(fs.existsSync(typesPath)).toBe(true)
      const content = fs.readFileSync(typesPath, 'utf-8')
      expect(content).toContain('export interface SheetsService')
      expect(content).toContain('export interface SpreadsheetMetadata')
      expect(content).toContain('export interface SheetRange')
    })
  })

  describe('4.2 Google認証サービスの実装', () => {
    it('GoogleAuthServiceが存在する', () => {
      const servicePath = './src/services/googleAuth.ts'
      expect(fs.existsSync(servicePath)).toBe(true)
      const content = fs.readFileSync(servicePath, 'utf-8')
      expect(content).toContain('export class GoogleAuthService')
      expect(content).toContain('signIn')
      expect(content).toContain('signOut')
      expect(content).toContain('getCurrentUser')
      expect(content).toContain('isSignedIn')
    })

    it('認証用の環境変数設定が存在する', () => {
      const envExamplePath = './.env.example'
      expect(fs.existsSync(envExamplePath)).toBe(true)
      const content = fs.readFileSync(envExamplePath, 'utf-8')
      expect(content).toContain('VITE_GOOGLE_CLIENT_ID')
      expect(content).toContain('VITE_GOOGLE_API_KEY')
    })

    it('認証フックuseGoogleAuthが存在する', () => {
      const hookPath = './src/hooks/useGoogleAuth.ts'
      expect(fs.existsSync(hookPath)).toBe(true)
      const content = fs.readFileSync(hookPath, 'utf-8')
      expect(content).toContain('export function useGoogleAuth')
      expect(content).toContain('user')
      expect(content).toContain('signIn')
      expect(content).toContain('signOut')
      expect(content).toContain('loading')
    })
  })

  describe('4.3 Google Sheets API基本操作の実装', () => {
    it('SheetsServiceが存在する', () => {
      const servicePath = './src/services/sheets.ts'
      expect(fs.existsSync(servicePath)).toBe(true)
      const content = fs.readFileSync(servicePath, 'utf-8')
      expect(content).toContain('export class SheetsService')
      expect(content).toContain('testConnection')
      expect(content).toContain('readParticipants')
      expect(content).toContain('updateParticipant')
      expect(content).toContain('addSystemColumns')
    })

    it('API呼び出しのエラーハンドリングが実装されている', () => {
      const servicePath = './src/services/sheets.ts'
      const content = fs.readFileSync(servicePath, 'utf-8')
      expect(content).toContain('try')
      expect(content).toContain('catch')
      expect(content).toContain('throw')
    })

    it('リトライロジックが実装されている', () => {
      const utilsPath = './src/utils/retry.ts'
      expect(fs.existsSync(utilsPath)).toBe(true)
      const content = fs.readFileSync(utilsPath, 'utf-8')
      expect(content).toContain('export async function retryWithBackoff')
      expect(content).toContain('maxRetries')
      expect(content).toContain('setTimeout')
    })
  })

  describe('4.4 Google Sheets API統合テスト', () => {
    it('モックテストファイルが存在する', () => {
      const testPath = './src/services/__tests__/sheets.test.ts'
      expect(fs.existsSync(testPath)).toBe(true)
    })

    it('エラーハンドリングのテストが存在する', () => {
      const testPath = './src/services/__tests__/sheets.test.ts'
      const content = fs.readFileSync(testPath, 'utf-8')
      expect(content).toContain('権限エラー')
      expect(content).toContain('ネットワークエラー')
      expect(content).toContain('スプレッドシートが見つからない')
    })
  })
})

describe('チェックイン機能とGoogle Sheets連携（タスク5）', () => {
  describe('5.1 氏名検索とマッチング機能の実装', () => {
    it('CheckinServiceが存在する', () => {
      const servicePath = './src/services/checkin.ts'
      expect(fs.existsSync(servicePath)).toBe(true)
      const content = fs.readFileSync(servicePath, 'utf-8')
      expect(content).toContain('export class CheckinService')
      expect(content).toContain('searchParticipant')
      expect(content).toContain('normalizeNameForSearch')
    })

    it('完全一致検索が実装されている', () => {
      const servicePath = './src/services/checkin.ts'
      const content = fs.readFileSync(servicePath, 'utf-8')
      expect(content).toContain('trim()')
      expect(content).toContain('===')
    })

    it('検索結果のキャッシュが実装されている', () => {
      const servicePath = './src/services/checkin.ts'
      const content = fs.readFileSync(servicePath, 'utf-8')
      expect(content).toContain('cache')
      expect(content).toContain('getCached')
      expect(content).toContain('setCached')
    })
  })

  describe('5.2 チェックイン処理とデータ更新の実装', () => {
    it('チェックイン処理メソッドが存在する', () => {
      const servicePath = './src/services/checkin.ts'
      const content = fs.readFileSync(servicePath, 'utf-8')
      expect(content).toContain('checkinParticipant')
      expect(content).toContain('updateCheckinStatus')
      expect(content).toContain('recordAuditLog')
    })

    it('重複チェックイン防止が実装されている', () => {
      const servicePath = './src/services/checkin.ts'
      const content = fs.readFileSync(servicePath, 'utf-8')
      expect(content).toContain('isAlreadyCheckedIn')
      expect(content).toContain('checked_in')
      expect(content).toContain('throw new Error')
    })

    it('監査ログ記録が実装されている', () => {
      const servicePath = './src/services/checkin.ts'
      const content = fs.readFileSync(servicePath, 'utf-8')
      expect(content).toContain('auditNote')
      expect(content).toContain('new Date()')
      expect(content).toContain('getCurrentUser')
    })
  })

  describe('5.3 チェックイン取り消し機能の実装', () => {
    it('取り消しメソッドが存在する', () => {
      const servicePath = './src/services/checkin.ts'
      const content = fs.readFileSync(servicePath, 'utf-8')
      expect(content).toContain('undoCheckin')
      expect(content).toContain('canUndo')
    })

    it('時間制限チェックが実装されている', () => {
      const servicePath = './src/services/checkin.ts'
      const content = fs.readFileSync(servicePath, 'utf-8')
      expect(content).toContain('UNDO_TIME_LIMIT')
      expect(content).toContain('Date.now()')
      expect(content).toContain('getTime()')
    })

    it('取り消し理由の記録が実装されている', () => {
      const servicePath = './src/services/checkin.ts'
      const content = fs.readFileSync(servicePath, 'utf-8')
      expect(content).toContain('undoReason')
      expect(content).toContain('チェックイン取り消し')
    })
  })

  describe('5.4 チェックイン機能のテスト', () => {
    it('チェックインサービスのテストファイルが存在する', () => {
      const testPath = './src/services/__tests__/checkin.test.ts'
      expect(fs.existsSync(testPath)).toBe(true)
    })

    it('エッジケースのテストが存在する', () => {
      const testPath = './src/services/__tests__/checkin.test.ts'
      const content = fs.readFileSync(testPath, 'utf-8')
      expect(content).toContain('空白の扱い')
      expect(content).toContain('大文字小文字')
      expect(content).toContain('同姓同名')
    })
  })
})

describe('オフライン対応とIndexedDB（追加実装）', () => {
  it('OfflineQueueServiceが存在する', () => {
    const servicePath = './src/services/offlineQueue.ts'
    expect(fs.existsSync(servicePath)).toBe(true)
    const content = fs.readFileSync(servicePath, 'utf-8')
    expect(content).toContain('export class OfflineQueueService')
    expect(content).toContain('addToQueue')
    expect(content).toContain('processQueue')
    expect(content).toContain('getQueuedOperations')
  })

  it('IndexedDBのDexie設定が存在する', () => {
    const dbPath = './src/db/index.ts'
    expect(fs.existsSync(dbPath)).toBe(true)
    const content = fs.readFileSync(dbPath, 'utf-8')
    expect(content).toContain('import Dexie')
    expect(content).toContain('participants')
    expect(content).toContain('pendingOperations')
    expect(content).toContain('config')
  })

  it('オフライン検出フックが存在する', () => {
    const hookPath = './src/hooks/useOfflineStatus.ts'
    expect(fs.existsSync(hookPath)).toBe(true)
    const content = fs.readFileSync(hookPath, 'utf-8')
    expect(content).toContain('export function useOfflineStatus')
    expect(content).toContain('navigator.onLine')
    expect(content).toContain('addEventListener')
  })

  it('オフライン時の楽観的更新が実装されている', () => {
    const storePath = './src/store/checkinStore.ts'
    const content = fs.readFileSync(storePath, 'utf-8')
    expect(content).toContain('optimisticUpdate')
    expect(content).toContain('revertOnError')
  })
})