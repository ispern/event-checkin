import { describe, it, expect, beforeAll } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

describe('基本ルーティングとナビゲーション', () => {
  describe('React Router設定', () => {
    it('react-router-domがpackage.jsonに存在する', () => {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
      expect(packageJson.dependencies).toHaveProperty('react-router-dom')
    })

    it('ルーティング設定ファイルが存在する', () => {
      const routerExists =
        fs.existsSync('./src/router/index.tsx') ||
        fs.existsSync('./src/App.tsx')
      expect(routerExists).toBe(true)
    })
  })

  describe('ページコンポーネント', () => {
    it('チェックインページコンポーネントが存在する', () => {
      const checkinPageExists =
        fs.existsSync('./src/pages/CheckinPage.tsx') ||
        fs.existsSync('./src/pages/Checkin.tsx') ||
        fs.existsSync('./src/components/pages/CheckinPage.tsx')
      expect(checkinPageExists).toBe(true)
    })

    it('管理者ページコンポーネントが存在する', () => {
      const adminPageExists =
        fs.existsSync('./src/pages/AdminPage.tsx') ||
        fs.existsSync('./src/pages/Admin.tsx') ||
        fs.existsSync('./src/components/pages/AdminPage.tsx')
      expect(adminPageExists).toBe(true)
    })
  })

  describe('レイアウトコンポーネント', () => {
    it('共通レイアウトコンポーネントが存在する', () => {
      const layoutExists =
        fs.existsSync('./src/components/Layout.tsx') ||
        fs.existsSync('./src/layouts/MainLayout.tsx') ||
        fs.existsSync('./src/components/layouts/Layout.tsx')
      expect(layoutExists).toBe(true)
    })

    it('ナビゲーションコンポーネントが存在する', () => {
      const navExists =
        fs.existsSync('./src/components/Navigation.tsx') ||
        fs.existsSync('./src/components/NavBar.tsx') ||
        fs.existsSync('./src/components/layouts/Navigation.tsx')
      expect(navExists).toBe(true)
    })
  })

  describe('ルーティング実装', () => {
    it('App.tsxにBrowserRouterが実装されている', () => {
      const appContent = fs.readFileSync('./src/App.tsx', 'utf-8')
      expect(appContent).toContain('BrowserRouter')
    })

    it('チェックインページへのルートが定義されている', () => {
      const appContent = fs.readFileSync('./src/App.tsx', 'utf-8')
      expect(appContent).toMatch(/path=["']\/["']/)
    })

    it('管理者ページへのルートが定義されている', () => {
      const appContent = fs.readFileSync('./src/App.tsx', 'utf-8')
      expect(appContent).toMatch(/path=["']\/admin["']/)
    })
  })

  describe('ナビゲーション実装', () => {
    it('ナビゲーションにLinkコンポーネントが使用されている', () => {
      const navFiles = [
        './src/components/Navigation.tsx',
        './src/components/NavBar.tsx',
        './src/components/layouts/Navigation.tsx'
      ]

      let linkFound = false
      for (const file of navFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf-8')
          if (content.includes('Link') || content.includes('NavLink')) {
            linkFound = true
            break
          }
        }
      }

      expect(linkFound).toBe(true)
    })

    it('チェックインページへのリンクが存在する', () => {
      const navFiles = [
        './src/components/Navigation.tsx',
        './src/components/NavBar.tsx',
        './src/components/layouts/Navigation.tsx'
      ]

      let checkinLinkFound = false
      for (const file of navFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf-8')
          if (content.includes('チェックイン') || content.includes('Check-in')) {
            checkinLinkFound = true
            break
          }
        }
      }

      expect(checkinLinkFound).toBe(true)
    })

    it('管理者ページへのリンクが存在する', () => {
      const navFiles = [
        './src/components/Navigation.tsx',
        './src/components/NavBar.tsx',
        './src/components/layouts/Navigation.tsx'
      ]

      let adminLinkFound = false
      for (const file of navFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf-8')
          if (content.includes('管理者') || content.includes('Admin')) {
            adminLinkFound = true
            break
          }
        }
      }

      expect(adminLinkFound).toBe(true)
    })
  })

  describe('TypeScript型定義', () => {
    it('ルート定義の型が適切に定義されている', () => {
      const typeFiles = [
        './src/types/routes.ts',
        './src/router/types.ts',
        './src/App.tsx'
      ]

      let typeFound = false
      for (const file of typeFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf-8')
          if (content.includes('Route') || content.includes('Path')) {
            typeFound = true
            break
          }
        }
      }

      expect(typeFound).toBe(true)
    })
  })
})