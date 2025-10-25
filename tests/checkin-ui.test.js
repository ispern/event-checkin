import { describe, it, expect, beforeAll } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

describe('チェックインページUI (タスク2.2-2.5)', () => {
  describe('2.2 氏名入力フォームとレイアウト', () => {
    it('CheckinPageコンポーネントに氏名入力フォームが存在する', () => {
      const checkinPageContent = fs.readFileSync('./src/pages/CheckinPage.tsx', 'utf-8')
      expect(checkinPageContent).toContain('input')
      expect(checkinPageContent).toContain('name')
    })

    it('検索ボタンが実装されている', () => {
      const checkinPageContent = fs.readFileSync('./src/pages/CheckinPage.tsx', 'utf-8')
      expect(checkinPageContent).toContain('button')
      expect(checkinPageContent).toContain('検索')
    })

    it('フォームのonSubmitハンドラが実装されている', () => {
      const checkinPageContent = fs.readFileSync('./src/pages/CheckinPage.tsx', 'utf-8')
      expect(checkinPageContent).toContain('onSubmit')
    })

    it('レスポンシブデザインのクラスが適用されている', () => {
      const checkinPageContent = fs.readFileSync('./src/pages/CheckinPage.tsx', 'utf-8')
      expect(checkinPageContent).toMatch(/sm:|md:|lg:/)
    })
  })

  describe('2.3 参加者情報表示カード', () => {
    it('ParticipantCardコンポーネントが存在する', () => {
      const componentExists =
        fs.existsSync('./src/components/ParticipantCard.tsx') ||
        fs.existsSync('./src/components/checkin/ParticipantCard.tsx')
      expect(componentExists).toBe(true)
    })

    it('参加者カードに必要な情報が表示される', () => {
      const cardFiles = [
        './src/components/ParticipantCard.tsx',
        './src/components/checkin/ParticipantCard.tsx'
      ]

      let cardContent = ''
      for (const file of cardFiles) {
        if (fs.existsSync(file)) {
          cardContent = fs.readFileSync(file, 'utf-8')
          break
        }
      }

      expect(cardContent).toContain('name')
      expect(cardContent).toContain('email')
      expect(cardContent).toContain('checkinStatus')
    })

    it('モックデータが定義されている', () => {
      const mockExists =
        fs.existsSync('./src/data/mockParticipants.ts') ||
        fs.existsSync('./src/mocks/participants.ts') ||
        fs.existsSync('./src/test/fixtures/participants.json')
      expect(mockExists).toBe(true)
    })
  })

  describe('2.4 チェックインボタンと基本状態管理', () => {
    it('Zustandストアが設定されている', () => {
      const storeExists =
        fs.existsSync('./src/store/checkinStore.ts') ||
        fs.existsSync('./src/stores/checkinStore.ts') ||
        fs.existsSync('./src/store/useStore.ts')
      expect(storeExists).toBe(true)
    })

    it('チェックインボタンコンポーネントが存在する', () => {
      const checkinPageContent = fs.readFileSync('./src/pages/CheckinPage.tsx', 'utf-8')
      expect(checkinPageContent).toContain('チェックイン')
      expect(checkinPageContent).toContain('onClick')
    })

    it('チェックイン状態の管理が実装されている', () => {
      const storeFiles = [
        './src/store/checkinStore.ts',
        './src/stores/checkinStore.ts',
        './src/store/useStore.ts'
      ]

      let storeContent = ''
      for (const file of storeFiles) {
        if (fs.existsSync(file)) {
          storeContent = fs.readFileSync(file, 'utf-8')
          break
        }
      }

      expect(storeContent).toContain('checkin')
      expect(storeContent).toContain('participant')
    })

    it('ボタンの無効化状態が管理されている', () => {
      const checkinPageContent = fs.readFileSync('./src/pages/CheckinPage.tsx', 'utf-8')
      expect(checkinPageContent).toContain('disabled')
    })
  })

  describe('2.5 エラーメッセージとローディング状態', () => {
    it('エラーメッセージコンポーネントが存在する', () => {
      const errorExists =
        fs.existsSync('./src/components/ErrorMessage.tsx') ||
        fs.existsSync('./src/components/ui/ErrorMessage.tsx') ||
        fs.existsSync('./src/components/common/ErrorMessage.tsx')
      expect(errorExists).toBe(true)
    })

    it('ローディングスピナーコンポーネントが存在する', () => {
      const spinnerExists =
        fs.existsSync('./src/components/LoadingSpinner.tsx') ||
        fs.existsSync('./src/components/ui/LoadingSpinner.tsx') ||
        fs.existsSync('./src/components/common/LoadingSpinner.tsx')
      expect(spinnerExists).toBe(true)
    })

    it('「参加者が見つかりません」エラーが実装されている', () => {
      const errorFiles = [
        './src/components/ErrorMessage.tsx',
        './src/components/ui/ErrorMessage.tsx',
        './src/components/common/ErrorMessage.tsx',
        './src/pages/CheckinPage.tsx'
      ]

      let found = false
      for (const file of errorFiles) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf-8')
          if (content.includes('見つかりません')) {
            found = true
            break
          }
        }
      }

      expect(found).toBe(true)
    })

    it('ローディング状態が状態管理に含まれている', () => {
      const storeFiles = [
        './src/store/checkinStore.ts',
        './src/stores/checkinStore.ts',
        './src/store/useStore.ts'
      ]

      let storeContent = ''
      for (const file of storeFiles) {
        if (fs.existsSync(file)) {
          storeContent = fs.readFileSync(file, 'utf-8')
          break
        }
      }

      expect(storeContent).toContain('loading')
    })
  })

  describe('レスポンシブデザインとアクセシビリティ', () => {
    it('モバイル対応のスタイルが適用されている', () => {
      const checkinPageContent = fs.readFileSync('./src/pages/CheckinPage.tsx', 'utf-8')
      expect(checkinPageContent).toMatch(/max-w-|container|mx-auto/)
    })

    it('アクセシビリティ属性が設定されている', () => {
      const checkinPageContent = fs.readFileSync('./src/pages/CheckinPage.tsx', 'utf-8')
      const hasAriaLabel = checkinPageContent.includes('aria-label')
      const hasHtmlFor = checkinPageContent.includes('htmlFor')
      const hasType = checkinPageContent.includes('type=')

      expect(hasAriaLabel || hasHtmlFor || hasType).toBe(true)
    })
  })
})