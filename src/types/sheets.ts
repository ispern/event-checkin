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

export interface SheetsService {
  testConnection(): Promise<boolean>
  readParticipants(range?: SheetRange): Promise<Participant[]>
  updateParticipant(participant: Participant): Promise<void>
  addSystemColumns(columns: string[]): Promise<void>
}
