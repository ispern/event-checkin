/**
 * 開発環境とコード品質ツール設定確認テスト
 */

import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('開発環境とコード品質ツールの設定', () => {
  describe('ESLint設定', () => {
    it('ESLint設定ファイルが存在する', () => {
      expect(fs.existsSync('./eslint.config.js')).toBe(true)
    })

    it('ESLintがpackage.jsonのlintスクリプトで実行可能', () => {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
      expect(packageJson.scripts.lint).toBeDefined()
      expect(packageJson.scripts.lint).toContain('eslint')
    })

    it('TypeScript用のESLint設定が含まれている', async () => {
      const config = await import(path.resolve('./eslint.config.js'))
      const configString = fs.readFileSync('./eslint.config.js', 'utf-8')
      expect(configString).toContain('typescript-eslint')
    })
  })

  describe('Prettier設定', () => {
    it('Prettier設定ファイルが存在する', () => {
      expect(fs.existsSync('./.prettierrc')).toBe(true)
    })

    it('Prettier設定がAGENTS.mdの規約に準拠している', () => {
      const prettierConfig = JSON.parse(fs.readFileSync('./.prettierrc', 'utf-8'))
      expect(prettierConfig.singleQuote).toBe(true)
      expect(prettierConfig.trailingComma).toBe('all')
      expect(prettierConfig.tabWidth).toBe(2)
      expect(prettierConfig.semi).toBe(false)
    })

    it('.prettierignoreファイルが存在する', () => {
      expect(fs.existsSync('./.prettierignore')).toBe(true)
    })
  })

  describe('Tailwind CSS設定', () => {
    it('Tailwind設定が正しく構成されている', () => {
      const tailwindConfig = fs.readFileSync('./tailwind.config.js', 'utf-8')
      expect(tailwindConfig).toContain('content')
      expect(tailwindConfig).toContain('./src/**/*.{js,ts,jsx,tsx}')
    })

    it('PostCSS設定にTailwindが含まれている', () => {
      const postcssConfig = fs.readFileSync('./postcss.config.js', 'utf-8')
      expect(postcssConfig).toContain('tailwindcss')
      expect(postcssConfig).toContain('autoprefixer')
    })
  })

  describe('Git設定', () => {
    it('.gitignoreが適切に設定されている', () => {
      const gitignore = fs.readFileSync('./.gitignore', 'utf-8')
      expect(gitignore).toContain('node_modules')
      expect(gitignore).toContain('dist')
      expect(gitignore).toContain('.env.local')
      expect(gitignore).toContain('.DS_Store')
    })

    it('.editorconfig ファイルが存在する', () => {
      expect(fs.existsSync('./.editorconfig')).toBe(true)
    })
  })

  describe('TypeScript設定', () => {
    it('strictモードが有効になっている', () => {
      const tsconfigApp = JSON.parse(fs.readFileSync('./tsconfig.app.json', 'utf-8'))
      expect(tsconfigApp.compilerOptions.strict).toBe(true)
    })

    it('paths aliasが設定されている', () => {
      const tsconfigApp = JSON.parse(fs.readFileSync('./tsconfig.app.json', 'utf-8'))
      expect(tsconfigApp.compilerOptions.paths).toBeDefined()
      expect(tsconfigApp.compilerOptions.paths['@/*']).toEqual(['./src/*'])
    })
  })

  describe('開発用スクリプト', () => {
    it('必要な開発用スクリプトがpackage.jsonに定義されている', () => {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

      expect(packageJson.scripts['lint:fix']).toBeDefined()
      expect(packageJson.scripts['format:check']).toBeDefined()
      expect(packageJson.scripts['type-check']).toBeDefined()
      expect(packageJson.scripts['test:coverage']).toBeDefined()
    })
  })

  describe('VS Code設定', () => {
    it('.vscode/settings.json が存在する', () => {
      expect(fs.existsSync('./.vscode/settings.json')).toBe(true)
    })

    it('.vscode/extensions.json が存在する', () => {
      expect(fs.existsSync('./.vscode/extensions.json')).toBe(true)
    })
  })
})