export interface AppConfig {
  spreadsheetId: string
  sheetName: string
  nameColumnIndex: number
  emailColumnIndex: number
  apiKey: string
  clientId: string
  undoTimeLimitMs: number
  systemColumns: string[]
}
