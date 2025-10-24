import React, { useState } from 'react'
import { useCheckinStore } from '../store/checkinStore'
import ParticipantCard from '../components/checkin/ParticipantCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ErrorMessage from '../components/ui/ErrorMessage'

const CheckinPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('')
  const {
    currentParticipant,
    loading,
    error,
    searchParticipant,
    checkinParticipant,
    clearError,
    clearParticipant
  } = useCheckinStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      await searchParticipant(inputValue)
    }
  }

  const handleCheckin = async () => {
    await checkinParticipant()
  }

  const handleReset = () => {
    setInputValue('')
    clearParticipant()
    clearError()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">
        参加者チェックイン
      </h1>

      {/* 検索フォーム */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              参加者氏名
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="name"
                name="name"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="氏名を入力してください"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                disabled={loading}
                aria-label="参加者氏名入力"
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                検索
              </button>
              {currentParticipant && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                >
                  クリア
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onClose={clearError} />
        </div>
      )}

      {/* ローディング状態 */}
      {loading && !currentParticipant && (
        <div className="bg-white rounded-lg shadow-md p-12">
          <LoadingSpinner size="large" message="検索中..." />
        </div>
      )}

      {/* 参加者カード */}
      {currentParticipant && (
        <div className="flex justify-center">
          <ParticipantCard
            participant={currentParticipant}
            onCheckin={handleCheckin}
            loading={loading}
          />
        </div>
      )}

      {/* 初期状態のメッセージ */}
      {!loading && !currentParticipant && !error && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-gray-600 text-lg">
            参加者の氏名を入力して検索してください
          </p>
          <p className="text-gray-500 text-sm mt-2">
            完全一致での検索となります
          </p>
        </div>
      )}

      {/* モバイル対応のためのパディング */}
      <div className="h-8 sm:h-12"></div>
    </div>
  )
}

export default CheckinPage