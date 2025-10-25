import React from 'react'
import type { Participant } from '../../store/checkinStore'

interface ParticipantCardProps {
  participant: Participant
  onCheckin: () => void
  loading?: boolean
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, onCheckin, loading }) => {
  const isCheckedIn = participant.checkinStatus === 'checked_in'

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{participant.name}</h3>
        {participant.email && (
          <p className="text-gray-600 text-sm">{participant.email}</p>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">ステータス</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isCheckedIn
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {isCheckedIn ? 'チェックイン済み' : '未チェックイン'}
          </span>
        </div>

        {isCheckedIn && participant.checkinAt && (
          <div className="mb-4 text-sm text-gray-600">
            <p>チェックイン時刻: {new Date(participant.checkinAt).toLocaleString('ja-JP')}</p>
            {participant.checkinBy && <p>担当者: {participant.checkinBy}</p>}
          </div>
        )}

        <button
          onClick={onCheckin}
          disabled={isCheckedIn || loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isCheckedIn
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : loading
              ? 'bg-blue-400 text-white cursor-wait'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {isCheckedIn ? 'チェックイン済み' : loading ? '処理中...' : 'チェックイン'}
        </button>
      </div>
    </div>
  )
}

export default ParticipantCard