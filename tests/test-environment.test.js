/**
 * テスト環境構築確認テスト
 */

import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('テスト環境の構築', () => {
  describe('Vitest設定', () => {
    it('vitest.config.tsが正しく設定されている', () => {
      const config = fs.readFileSync('./vitest.config.ts', 'utf-8')
      expect(config).toContain('globals: true')
      expect(config).toContain('environment: \'jsdom\'')
      expect(config).toContain('setupFiles')
      expect(config).toContain('coverage')
    })

    it('カバレッジ設定が含まれている', () => {
      const config = fs.readFileSync('./vitest.config.ts', 'utf-8')
      expect(config).toContain('coverage')
      expect(config).toContain('provider')
      expect(config).toContain('reporter')
    })
  })

  describe('Testing Library設定', () => {
    it('テストセットアップファイルが存在する', () => {
      expect(fs.existsSync('./src/test/setup.ts')).toBe(true)
    })

    it('テストユーティリティファイルが存在する', () => {
      expect(fs.existsSync('./src/test/utils.tsx')).toBe(true)
    })

    it('カスタムレンダー関数が定義されている', () => {
      expect(fs.existsSync('./src/test/utils.tsx')).toBe(true)
      const utils = fs.readFileSync('./src/test/utils.tsx', 'utf-8')
      expect(utils).toContain('export function renderWithProviders')
      expect(utils).toContain('testing-library/react')
    })
  })

  describe('モックファイル', () => {
    it('モックディレクトリが存在する', () => {
      expect(fs.existsSync('./src/test/mocks')).toBe(true)
    })

    it('Google Sheets APIモックが存在する', () => {
      expect(fs.existsSync('./src/test/mocks/googleSheets.ts')).toBe(true)
    })

    it('サンプルデータが存在する', () => {
      expect(fs.existsSync('./src/test/fixtures/participants.json')).toBe(true)
    })
  })

  describe('E2Eテスト設定', () => {
    it('Playwrightが依存関係に含まれている', () => {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
      expect(packageJson.devDependencies).toHaveProperty('@playwright/test')
    })

    it('Playwright設定ファイルが存在する', () => {
      expect(fs.existsSync('./playwright.config.ts')).toBe(true)
    })

    it('E2Eテスト用のスクリプトが定義されている', () => {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
      expect(packageJson.scripts['test:e2e']).toBeDefined()
      expect(packageJson.scripts['test:e2e:ui']).toBeDefined()
    })
  })

  describe('テスト用型定義', () => {
    it('Vitest用の型定義が設定されている', () => {
      const tsconfigApp = fs.readFileSync('./tsconfig.app.json', 'utf-8')
      expect(tsconfigApp).toContain('vitest/globals')
    })

    it('テスト用の環境変数型定義ファイルが存在する', () => {
      expect(fs.existsSync('./src/test/test-env.d.ts')).toBe(true)
    })
  })

  describe('テスト実行スクリプト', () => {
    it('必要なテストスクリプトが定義されている', () => {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

      expect(packageJson.scripts['test:unit']).toBeDefined()
      expect(packageJson.scripts['test:watch']).toBeDefined()
      expect(packageJson.scripts['test:ci']).toBeDefined()
    })
  })

  describe('カバレッジツール', () => {
    it('@vitest/coverageが依存関係に含まれている', () => {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
      expect(packageJson.devDependencies).toHaveProperty('@vitest/coverage-v8')
    })
  })
})