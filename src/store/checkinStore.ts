import { create } from 'zustand'

export interface Participant {
  id: string
  name: string
  email?: string
  registrationTimestamp: string
  checkinStatus: 'not_checked_in' | 'checked_in'
  checkinAt?: string
  checkinBy?: string
  updatedAt: string
  updatedBy: string
}

interface CheckinState {
  // 状態
  searchQuery: string
  currentParticipant: Participant | null
  loading: boolean
  error: string | null

  // アクション
  setSearchQuery: (query: string) => void
  searchParticipant: (name: string) => Promise<void>
  checkinParticipant: () => Promise<void>
  clearError: () => void
  clearParticipant: () => void
}

// モックデータ（ミュータブルにして永続化をシミュレート）
let mockParticipants: Participant[] = [
  {
    id: 'p001',
    name: '田中太郎',
    email: 'tanaka@example.com',
    registrationTimestamp: '2024-01-01T10:00:00Z',
    checkinStatus: 'not_checked_in',
    updatedAt: '2024-01-01T10:00:00Z',
    updatedBy: 'system'
  },
  {
    id: 'p002',
    name: '山田花子',
    email: 'yamada@example.com',
    registrationTimestamp: '2024-01-02T11:00:00Z',
    checkinStatus: 'checked_in',
    checkinAt: '2024-01-10T09:00:00Z',
    checkinBy: 'staff@example.com',
    updatedAt: '2024-01-10T09:00:00Z',
    updatedBy: 'staff@example.com'
  },
  {
    id: 'p003',
    name: '佐藤次郎',
    email: 'sato@example.com',
    registrationTimestamp: '2024-01-03T12:00:00Z',
    checkinStatus: 'not_checked_in',
    updatedAt: '2024-01-03T12:00:00Z',
    updatedBy: 'system'
  }
]

export const useCheckinStore = create<CheckinState>((set, get) => ({
  searchQuery: '',
  currentParticipant: null,
  loading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  searchParticipant: async (name) => {
    // 検索開始時に前の参加者をクリア
    set({ loading: true, error: null, currentParticipant: null })

    // シミュレート API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const normalizedName = name.trim()
    const participant = mockParticipants.find(p => p.name === normalizedName)

    if (participant) {
      set({ currentParticipant: participant, loading: false })
    } else {
      set({
        currentParticipant: null,
        loading: false,
        error: '参加者が見つかりません'
      })
    }
  },

  checkinParticipant: async () => {
    const { currentParticipant } = get()
    if (!currentParticipant) return

    if (currentParticipant.checkinStatus === 'checked_in') {
      set({ error: 'すでにチェックイン済みです' })
      return
    }

    set({ loading: true })

    // シミュレート API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const updatedParticipant: Participant = {
      ...currentParticipant,
      checkinStatus: 'checked_in',
      checkinAt: new Date().toISOString(),
      checkinBy: 'current-user@example.com',
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user@example.com'
    }

    // モックデータも更新して永続化をシミュレート
    const participantIndex = mockParticipants.findIndex(p => p.id === currentParticipant.id)
    if (participantIndex !== -1) {
      mockParticipants[participantIndex] = updatedParticipant
    }

    set({
      currentParticipant: updatedParticipant,
      loading: false
    })
  },

  clearError: () => set({ error: null }),

  clearParticipant: () => set({ currentParticipant: null, searchQuery: '' })
}))