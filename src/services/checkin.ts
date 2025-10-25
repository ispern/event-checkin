import type { Participant } from '../types/participant'
import { SheetsService } from './sheets'

export class CheckinService {
  private sheetsService: SheetsService
  private cache: Map<string, Participant> = new Map()
  private readonly UNDO_TIME_LIMIT = 5 * 60 * 1000 // 5 minutes in milliseconds

  constructor(sheetsService: SheetsService) {
    this.sheetsService = sheetsService
  }

  async searchParticipant(name: string): Promise<Participant | null> {
    const normalizedName = this.normalizeNameForSearch(name)

    // Check cache first
    const cached = this.getCached(normalizedName)
    if (cached) {
      return cached
    }

    // Fetch from sheets
    const participants = await this.sheetsService.readParticipants()

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
    const participants = await this.sheetsService.readParticipants()
    const participant = participants.find(p => p.id === participantId)

    if (!participant) {
      throw new Error('Participant not found')
    }

    if (this.isAlreadyCheckedIn(participant)) {
      throw new Error('Participant is already checked in')
    }

    const updatedParticipant = {
      ...participant,
      checkinStatus: 'checked_in' as const,
      checkinAt: new Date(),
      checkinBy: this.getCurrentUser(),
      updatedAt: new Date(),
      updatedBy: this.getCurrentUser()
    }

    await this.updateCheckinStatus(updatedParticipant)
    this.recordAuditLog(updatedParticipant, '��ï��L')
  }

  async undoCheckin(participantId: string): Promise<void> {
    const participants = await this.sheetsService.readParticipants()
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
      auditNote: this.undoReason('��ï��֊�W')
    }

    await this.sheetsService.updateParticipant(this.sheetsService['spreadsheetId'], updatedParticipant)
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

  private async updateCheckinStatus(participant: Participant): Promise<void> {
    await this.sheetsService.updateParticipant(this.sheetsService['spreadsheetId'], participant)

    // Update cache
    const normalizedName = this.normalizeNameForSearch(participant.name)
    this.setCached(normalizedName, participant)
  }

  private recordAuditLog(participant: Participant, action: string): void {
    // In a real implementation, this would write to a separate audit log
    participant.auditNote = `${action} - ${new Date().toISOString()} by ${this.getCurrentUser()}`
  }

  private getCurrentUser(): string {
    // In a real implementation, this would get the current logged-in user
    return 'current-user@example.com'
  }

  private undoReason(reason: string): string {
    return `チェックイン取り消し: ${reason} - ${new Date().toISOString()} by ${this.getCurrentUser()}`
  }

  private getCached(key: string): Participant | undefined {
    return this.cache.get(key)
  }

  private setCached(key: string, value: Participant): void {
    this.cache.set(key, value)
  }
}