import { useCallback, useEffect, useMemo, useState } from 'react'
import { GoogleAuthService } from '@/services/googleAuth'
import type { User } from '@/types/user'

const defaultService = new GoogleAuthService()

export function useGoogleAuth(service: GoogleAuthService = defaultService) {
  const authService = useMemo(() => service, [service])
  const [user, setUser] = useState<User | null>(authService.getCurrentUser())
  const [loading, setLoading] = useState<boolean>(!authService.isSignedIn())

  useEffect(() => {
    let active = true

    authService
      .initialize()
      .then(() => {
        if (active) {
          setUser(authService.getCurrentUser())
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [authService])

  const signIn = useCallback(async () => {
    setLoading(true)
    try {
      const token = await authService.signIn()
      setUser(authService.getCurrentUser())
      return token
    } finally {
      setLoading(false)
    }
  }, [authService])

  const signOut = useCallback(() => {
    authService.signOut()
    setUser(null)
  }, [authService])

  return {
    user,
    loading,
    signIn,
    signOut,
    isSignedIn: authService.isSignedIn(),
    accessToken: authService.getAccessToken()
  }
}
