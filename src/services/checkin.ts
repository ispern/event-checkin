import type { Participant } from '../types/participant'
import { SheetsService } from './sheets'

export class CheckinService {
  private sheetsService: SheetsService
  private cache: Map<string, Participant> = new Map()
  private readonly UNDO_TIME_LIMIT = 5 * 60 * 1000 // 5 minutes in milliseconds
  private spreadsheetId: string

  constructor(sheetsService: SheetsService, spreadsheetId: string) {
    this.sheetsService = sheetsService
    this.spreadsheetId = spreadsheetId
  }

  async searchParticipant(name: string): Promise<Participant | null> {
    const normalizedName = this.normalizeNameForSearch(name)

    // Check cache first
    const cached = this.getCached(normalizedName)
    if (cached) {
      return cached
    }

    // Fetch from sheets
    const participants = await this.sheetsService.readParticipants(this.spreadsheetId)

    // Find exact match
    const participant = participants.find(p => {
      const participantName = this.normalizeNameForSearch(p.name)
      return participantName === normalizedName
    })

    if (participant) {
      this.setCached(normalizedName, participant)
    }

    return participant || null
  }

  normalizeNameForSearch(name: string): string {
    return name.trim()
  }

  async checkinParticipant(participantId: string): Promise<void> {
    const participants = await this.sheetsService.readParticipants(this.spreadsheetId)
    const participant = participants.find(p => p.id === participantId)

    if (!participant) {
      throw new Error('Participant not found')
    }

    if (this.isAlreadyCheckedIn(participant)) {
      throw new Error('Participant is already checked in')
    }

    // Create updated participant with audit info
    const updatedParticipant = {
      ...participant,
      checkinStatus: 'checked_in' as const,
      checkinAt: new Date(),
      checkinBy: this.getCurrentUser(),
      updatedAt: new Date(),
      updatedBy: this.getCurrentUser(),
      auditNote: `Checked in at ${new Date().toISOString()} by ${this.getCurrentUser()}`
    }

    // Update in sheets
    await this.sheetsService.updateParticipant(this.spreadsheetId, updatedParticipant)

    // Update cache
    const normalizedName = this.normalizeNameForSearch(participant.name)
    this.setCached(normalizedName, updatedParticipant)
  }

  async undoCheckin(participantId: string): Promise<void> {
    const participants = await this.sheetsService.readParticipants(this.spreadsheetId)
    const participant = participants.find(p => p.id === participantId)

    if (!participant) {
      throw new Error('Participant not found')
    }

    if (!this.canUndo(participant)) {
      throw new Error('Cannot undo checkin after time limit')
    }

    const updatedParticipant = {
      ...participant,
      checkinStatus: 'not_checked_in' as const,
      checkinAt: undefined,
      checkinBy: undefined,
      updatedAt: new Date(),
      updatedBy: this.getCurrentUser(),
      auditNote: `Checkin undone at ${new Date().toISOString()} by ${this.getCurrentUser()}`
    }

    await this.sheetsService.updateParticipant(this.spreadsheetId, updatedParticipant)

    // Update cache
    const normalizedName = this.normalizeNameForSearch(participant.name)
    this.setCached(normalizedName, updatedParticipant)
  }

  canUndo(participant: Participant): boolean {
    if (!participant.checkinAt) {
      return false
    }

    const checkinTime = participant.checkinAt.getTime()
    const currentTime = Date.now()
    const timeDiff = currentTime - checkinTime

    return timeDiff <= this.UNDO_TIME_LIMIT
  }

  private isAlreadyCheckedIn(participant: Participant): boolean {
    return participant.checkinStatus === 'checked_in'
  }

  private getCurrentUser(): string {
    // In a real implementation, this would get the current logged-in user
    return 'current-user@example.com'
  }

  private getCached(key: string): Participant | undefined {
    return this.cache.get(key)
  }

  private setCached(key: string, value: Participant): void {
    this.cache.set(key, value)
  }
}