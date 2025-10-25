import type { Participant } from '../types/participant'
import type { ISheetsService, SheetRange, SpreadsheetMetadata, ConnectionResult } from '../types/sheets'

export class SheetsService implements ISheetsService {
  private apiKey: string
  private spreadsheetId: string
  private accessToken: string | null = null
  private sheetName: string = 'Sheet1' // Default sheet name

  constructor(apiKey: string, spreadsheetId: string, sheetName?: string) {
    this.apiKey = apiKey
    this.spreadsheetId = spreadsheetId
    if (sheetName) {
      this.sheetName = sheetName
    }
  }

  setAccessToken(token: string) {
    this.accessToken = token
  }

  async testConnection(sheetUrl?: string): Promise<ConnectionResult> {
    try {
      const spreadsheetId = sheetUrl ? this.extractSpreadsheetId(sheetUrl) : this.spreadsheetId
      const response = await this.makeRequest(`/v4/spreadsheets/${spreadsheetId}`)

      if (!response.ok) {
        throw new Error(`Failed to connect: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        metadata: {
          spreadsheetId: data.spreadsheetId,
          title: data.properties.title,
          locale: data.properties.locale,
          defaultFormat: data.properties.defaultFormat,
          sheets: data.sheets.map((sheet: any) => ({
            sheetId: sheet.properties.sheetId,
            title: sheet.properties.title,
            index: sheet.properties.index,
            rowCount: sheet.properties.gridProperties.rowCount,
            columnCount: sheet.properties.gridProperties.columnCount
          }))
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async readParticipants(sheetId?: string, range?: SheetRange): Promise<Participant[]> {
    try {
      const spreadsheetId = sheetId || this.spreadsheetId
      const rangeStr = this.buildRangeString(range)
      const response = await this.makeRequest(
        `/v4/spreadsheets/${spreadsheetId}/values/${rangeStr}`
      )

      if (!response.ok) {
        throw new Error(`Failed to read data: ${response.statusText}`)
      }

      const data = await response.json()
      const rows = data.values || []

      if (rows.length === 0) return []

      // First row contains headers
      const headers = rows[0]
      const idCol = headers.indexOf('_participant_id')
      const nameCol = headers.indexOf('name') >= 0 ? headers.indexOf('name') : 1
      const emailCol = headers.indexOf('email') >= 0 ? headers.indexOf('email') : 2
      const statusCol = headers.indexOf('_checkin_status')
      const checkinAtCol = headers.indexOf('_checkin_at')
      const checkinByCol = headers.indexOf('_checkin_by')
      const updatedAtCol = headers.indexOf('_updated_at')
      const updatedByCol = headers.indexOf('_updated_by')
      const auditNoteCol = headers.indexOf('_audit_note')

      // Skip header row and map to participants
      return rows.slice(1).map((row: any[], index: number) => ({
        id: (idCol >= 0 && row[idCol]) || `participant-${index + 2}`,
        name: row[nameCol] || '',
        email: row[emailCol] || undefined,
        checkinStatus: (statusCol >= 0 && row[statusCol] === 'checked_in') ? 'checked_in' : 'not_checked_in',
        checkinAt: (checkinAtCol >= 0 && row[checkinAtCol]) ? new Date(row[checkinAtCol]) : undefined,
        checkinBy: (checkinByCol >= 0 && row[checkinByCol]) || undefined,
        updatedAt: (updatedAtCol >= 0 && row[updatedAtCol]) ? new Date(row[updatedAtCol]) : undefined,
        updatedBy: (updatedByCol >= 0 && row[updatedByCol]) || undefined,
        auditNote: (auditNoteCol >= 0 && row[auditNoteCol]) || undefined,
        rowNumber: index + 2 // Store the actual row number (accounting for header)
      }))
    } catch (error) {
      throw new Error(`Failed to read participants: ${error}`)
    }
  }

  async updateParticipant(sheetId: string, participant: Participant): Promise<void> {
    try {
      const spreadsheetId = sheetId || this.spreadsheetId

      if (!participant.rowNumber) {
        throw new Error('Row number is required for update')
      }

      // First, get headers to find system column positions
      const headerRange = this.sheetName ? `'${this.sheetName}'!1:1` : '1:1'
      const headerResponse = await this.makeRequest(
        `/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(headerRange)}`
      )

      if (!headerResponse.ok) {
        throw new Error(`Failed to read headers: ${headerResponse.statusText}`)
      }

      const headerData = await headerResponse.json()
      const headers = headerData.values?.[0] || []

      // Find system column indices
      const statusCol = headers.indexOf('_checkin_status')
      const checkinAtCol = headers.indexOf('_checkin_at')
      const checkinByCol = headers.indexOf('_checkin_by')
      const updatedAtCol = headers.indexOf('_updated_at')
      const updatedByCol = headers.indexOf('_updated_by')
      const auditNoteCol = headers.indexOf('_audit_note')

      // Build update requests for each system column
      const requests = []

      // Helper to create range with sheet name
      const makeRange = (col: string, row: number) => {
        return this.sheetName ? `'${this.sheetName}'!${col}${row}` : `${col}${row}`
      }

      if (statusCol >= 0) {
        const col = this.columnIndexToLetter(statusCol)
        requests.push({
          range: makeRange(col, participant.rowNumber),
          values: [[participant.checkinStatus]]
        })
      }

      if (checkinAtCol >= 0) {
        const col = this.columnIndexToLetter(checkinAtCol)
        requests.push({
          range: makeRange(col, participant.rowNumber),
          values: [[participant.checkinAt ? participant.checkinAt.toISOString() : '']]
        })
      }

      if (checkinByCol >= 0) {
        const col = this.columnIndexToLetter(checkinByCol)
        requests.push({
          range: makeRange(col, participant.rowNumber),
          values: [[participant.checkinBy || '']]
        })
      }

      if (updatedAtCol >= 0) {
        const col = this.columnIndexToLetter(updatedAtCol)
        requests.push({
          range: makeRange(col, participant.rowNumber),
          values: [[new Date().toISOString()]]
        })
      }

      if (updatedByCol >= 0) {
        const col = this.columnIndexToLetter(updatedByCol)
        requests.push({
          range: makeRange(col, participant.rowNumber),
          values: [[participant.updatedBy || 'system']]
        })
      }

      if (auditNoteCol >= 0) {
        const col = this.columnIndexToLetter(auditNoteCol)
        requests.push({
          range: makeRange(col, participant.rowNumber),
          values: [[participant.auditNote || '']]
        })
      }

      // Batch update all values
      const response = await this.makeRequest(
        `/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
        {
          method: 'POST',
          body: JSON.stringify({
            valueInputOption: 'RAW',
            data: requests
          })
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to update participant: ${response.statusText}`)
      }
    } catch (error) {
      throw new Error(`Failed to update participant: ${error}`)
    }
  }

  async addSystemColumns(sheetId: string): Promise<void> {
    try {
      const spreadsheetId = sheetId || this.spreadsheetId
      const systemColumns = [
        '_participant_id',
        '_checkin_status',
        '_checkin_at',
        '_checkin_by',
        '_updated_at',
        '_updated_by',
        '_audit_note'
      ]

      // Get current headers
      const headerRange = this.sheetName ? `'${this.sheetName}'!1:1` : '1:1'
      const response = await this.makeRequest(
        `/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(headerRange)}`
      )

      if (!response.ok) {
        throw new Error(`Failed to read headers: ${response.statusText}`)
      }

      const data = await response.json()
      const currentHeaders = data.values?.[0] || []

      // Check which system columns are missing
      const columnsToAdd = systemColumns.filter(col => !currentHeaders.includes(col))

      if (columnsToAdd.length === 0) {
        // All system columns already exist
        return
      }

      // Add only missing system columns to the end
      const newHeaders = [...currentHeaders, ...columnsToAdd]

      // Update headers
      const updateResponse = await this.makeRequest(
        `/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(headerRange)}?valueInputOption=RAW`,
        {
          method: 'PUT',
          body: JSON.stringify({ values: [newHeaders] })
        }
      )

      if (!updateResponse.ok) {
        throw new Error(`Failed to add system columns: ${updateResponse.statusText}`)
      }
    } catch (error) {
      throw new Error(`Failed to add system columns: ${error}`)
    }
  }

  private buildRangeString(range?: SheetRange): string {
    if (!range) {
      // Use default sheet name if no range specified
      const defaultRange = 'A:Z'
      return this.sheetName ? `'${this.sheetName}'!${defaultRange}` : defaultRange
    }

    const { sheetName, startRow, endRow, startColumn, endColumn } = range
    const colStart = startColumn ? this.columnIndexToLetter(startColumn) : 'A'
    const colEnd = endColumn ? this.columnIndexToLetter(endColumn) : 'Z'
    const rowStart = startRow || 1
    const rowEnd = endRow || ''
    const sheet = sheetName || this.sheetName // Use provided sheet or default

    return sheet
      ? `'${sheet}'!${colStart}${rowStart}:${colEnd}${rowEnd}`
      : `${colStart}${rowStart}:${colEnd}${rowEnd}`
  }

  private columnIndexToLetter(index: number): string {
    let letter = ''
    while (index >= 0) {
      letter = String.fromCharCode(65 + (index % 26)) + letter
      index = Math.floor(index / 26) - 1
    }
    return letter
  }

  private extractSpreadsheetId(url: string): string {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    if (!match) {
      throw new Error('Invalid spreadsheet URL')
    }
    return match[1]
  }

  private async makeRequest(path: string, options: RequestInit = {}): Promise<Response> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    const url = `https://sheets.googleapis.com${path}${
      path.includes('?') ? '&' : '?'
    }key=${this.apiKey}`

    return fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    })
  }
}