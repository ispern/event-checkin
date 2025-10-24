/**
 * プロジェクト初期化確認テスト
 * このテストは、プロジェクトの基本構成が正しく設定されていることを確認します
 */

import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('プロジェクト初期化とビルド設定', () => {
  it('package.jsonが存在し、必要な設定が含まれている', () => {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

    // 基本情報
    expect(packageJson.name).toBe('event-checkin')
    expect(packageJson.private).toBe(true)
    expect(packageJson.type).toBe('module')

    // 必須スクリプト
    expect(packageJson.scripts).toHaveProperty('dev')
    expect(packageJson.scripts).toHaveProperty('build')
    expect(packageJson.scripts).toHaveProperty('preview')
    expect(packageJson.scripts).toHaveProperty('test')
    expect(packageJson.scripts).toHaveProperty('lint')
    expect(packageJson.scripts).toHaveProperty('format')
  })

  it('必要な依存関係がインストールされている', () => {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

    // React関連
    expect(packageJson.dependencies).toHaveProperty('react')
    expect(packageJson.dependencies).toHaveProperty('react-dom')

    // 状態管理
    expect(packageJson.dependencies).toHaveProperty('zustand')

    // UI関連
    expect(packageJson.dependencies).toHaveProperty('@headlessui/react')

    // データベース
    expect(packageJson.dependencies).toHaveProperty('dexie')

    // 開発依存関係
    expect(packageJson.devDependencies).toHaveProperty('@vitejs/plugin-react')
    expect(packageJson.devDependencies).toHaveProperty('typescript')
    expect(packageJson.devDependencies).toHaveProperty('vite')
    expect(packageJson.devDependencies).toHaveProperty('vitest')
    expect(packageJson.devDependencies).toHaveProperty('tailwindcss')
  })

  it('TypeScript設定ファイルが存在する', () => {
    expect(fs.existsSync('./tsconfig.json')).toBe(true)
    expect(fs.existsSync('./tsconfig.app.json')).toBe(true)
  })

  it('Vite設定ファイルが存在する', () => {
    expect(fs.existsSync('./vite.config.ts')).toBe(true)
  })

  it('基本的なディレクトリ構造が存在する', () => {
    expect(fs.existsSync('./src')).toBe(true)
    expect(fs.existsSync('./public')).toBe(true)
  })
})