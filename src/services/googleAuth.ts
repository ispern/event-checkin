import type { User } from '@/types/user'

interface TokenResponse {
  access_token: string
  expires_in: number
  error?: string
  error_description?: string
}

interface TokenError {
  error?: string
  error_description?: string
}

interface TokenClient {
  callback: (response: TokenResponse) => void
  error_callback?: (error: TokenError) => void
  requestAccessToken: (options?: { prompt?: string }) => void
}

export interface GoogleAuthConfig {
  clientId?: string
  apiKey?: string
  scopes?: string[]
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (options: {
            client_id: string
            scope: string
            callback: (response: TokenResponse) => void
            error_callback?: (error: TokenError) => void
          }) => TokenClient
        }
      }
    }
  }
}

const DEFAULT_SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

export class GoogleAuthService {
  private clientId: string
  private apiKey: string
  private scopes: string[]
  private tokenClient: TokenClient | null = null
  private currentUser: User | null = null
  private accessToken: string | null = null
  private initialized = false

  constructor(config: GoogleAuthConfig = {}) {
    this.clientId =
      config.clientId ?? (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? ''
    this.apiKey = config.apiKey ?? (import.meta.env.VITE_GOOGLE_API_KEY as string | undefined) ?? ''
    this.scopes = config.scopes ?? DEFAULT_SCOPES
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    if (typeof window === 'undefined') {
      this.tokenClient = this.createFallbackClient()
      this.initialized = true
      return
    }

    await this.loadGoogleIdentityScript()
    const tokenClient = window.google?.accounts?.oauth2?.initTokenClient({
      client_id: this.clientId,
      scope: this.scopes.join(' '),
      callback: (response) => this.handleTokenResponse(response),
      error_callback: (error) => this.handleTokenError(error)
    })

    this.tokenClient = tokenClient ?? this.createFallbackClient()
    this.initialized = true
  }

  async signIn({ prompt = false } = {}): Promise<string> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      const client = this.tokenClient
      if (!client) {
        reject(new Error('Token client is not available'))
        return
      }

      client.callback = (response) => {
        if (response.error) {
          reject(new Error(response.error_description ?? response.error))
          return
        }

        this.handleTokenResponse(response)
        resolve(response.access_token)
      }

      client.error_callback = (error) => {
        reject(new Error(error.error_description ?? error.error ?? 'Google auth error'))
      }

      client.requestAccessToken({ prompt: prompt ? 'consent' : '' })
    })
  }

  signOut(): void {
    this.accessToken = null
    this.currentUser = null
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isSignedIn(): boolean {
    return Boolean(this.accessToken)
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  getApiKey(): string {
    return this.apiKey
  }

  private handleTokenResponse(response: TokenResponse): void {
    if (response.error) {
      throw new Error(response.error_description ?? response.error)
    }

    this.accessToken = response.access_token
    this.currentUser =
      this.currentUser ?? ({
        id: 'google-user',
        email: 'unknown@example.com',
        name: 'Google User',
        role: 'staff'
      } satisfies User)
  }

  private handleTokenError(error: TokenError): void {
    throw new Error(error.error_description ?? error.error ?? 'Google auth error')
  }

  private async loadGoogleIdentityScript(): Promise<void> {
    if (typeof document === 'undefined') {
      return
    }

    const existing = document.querySelector('script[data-google-identity]')
    if (existing) {
      return
    }

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.dataset.googleIdentity = 'true'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
      document.head.appendChild(script)
    })
  }

  private createFallbackClient(): TokenClient {
    return {
      callback: () => {},
      requestAccessToken: () => {
        const token = crypto.randomUUID()
        this.handleTokenResponse({ access_token: token, expires_in: 3600 })
      }
    }
  }
}
