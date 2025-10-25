export type UserRole = 'organizer' | 'staff' | 'viewer'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatarUrl?: string
  token?: string
}
