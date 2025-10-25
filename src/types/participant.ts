export type CheckinStatus = 'not_checked_in' | 'checked_in'

export interface Participant {
  id: string
  name: string
  nameReading?: string
  email?: string
  organization?: string
  ticketType?: string
  registrationTimestamp?: string
  checkinStatus: CheckinStatus
  checkinAt?: Date
  checkinBy?: string
  updatedAt?: Date
  updatedBy?: string
  auditNote?: string
  rowNumber?: number
  metadata?: Record<string, string | number | boolean | null>
}

export interface ParticipantUpdate {
  participantId: string
  checkinStatus: CheckinStatus
  checkinAt?: Date
  checkinBy?: string
  auditNote?: string
  undoReason?: string
}
