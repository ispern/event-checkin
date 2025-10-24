import React from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', message }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin`}>
          <div className="h-full w-full border-4 border-gray-200 rounded-full border-t-blue-500" />
        </div>
      </div>
      {message && (
        <p className="mt-3 text-gray-600 text-sm">{message}</p>
      )}
    </div>
  )
}

export default LoadingSpinner