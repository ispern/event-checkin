import type { Participant } from './participant'

export interface SheetRange {
  sheetName: string
  startRow: number
  endRow?: number
  startColumn?: number
  endColumn?: number
}

export interface SpreadsheetMetadata {
  spreadsheetId: string
  title: string
  locale?: string
  defaultFormat?: string
  sheets: Array<{
    sheetId: number
    title: string
    index: number
    rowCount: number
    columnCount: number
  }>
}

export interface ConnectionResult {
  success: boolean
  error?: string
  metadata?: SpreadsheetMetadata
}

export interface ISheetsService {
  testConnection(sheetUrl?: string): Promise<ConnectionResult>
  readParticipants(sheetId?: string, range?: SheetRange): Promise<Participant[]>
  updateParticipant(sheetId: string, participant: Participant): Promise<void>
  addSystemColumns(sheetId: string): Promise<void>
}
