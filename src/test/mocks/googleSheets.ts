/**
 * Google Sheets API モック
 */

export const mockSheetsAPI = {
  spreadsheets: {
    get: vi.fn(() => Promise.resolve({
      spreadsheetId: 'test-sheet-id',
      properties: {
        title: 'Test Spreadsheet',
      },
    })),
    values: {
      get: vi.fn(() => Promise.resolve({
        values: [],
      })),
      update: vi.fn(() => Promise.resolve({
        updatedCells: 1,
      })),
      batchGet: vi.fn(() => Promise.resolve({
        valueRanges: [],
      })),
    },
  },
}

export const mockGoogleAuth = {
  requestAccessToken: vi.fn(() => Promise.resolve({
    access_token: 'mock-token',
  })),
  hasGrantedAllScopes: vi.fn(() => true),
}