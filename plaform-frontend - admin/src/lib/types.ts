export interface ContentItem {
  id: string
  type: string
  slug: string | null
  position: number
  payload: Record<string, unknown>
  updatedAt: string
}

export interface MediaFile {
  id: string
  objectKey: string
  filename: string
  contentType: string
  folder?: string
  size: number
  createdAt: string
  url: string
}

export interface Subscriber {
  id: string
  email: string
  name?: string
  source?: string
  active: boolean
  createdAt: string
}

export type CampaignStatus = "draft" | "sending" | "sent" | "failed"

export interface Campaign {
  id: string
  subject: string
  body: string
  status: CampaignStatus
  recipientCount: number
  createdAt: string
  sentAt: string | null
}

export interface ContactMessage {
  id: string
  name?: string
  email: string
  subject?: string
  message: string
  readFlag: boolean
  createdAt: string
}

export type CandidatureStatus =
  | "new"
  | "in_progress"
  | "accepted"
  | "rejected"
  | "archived"

export interface Candidature {
  id: string
  program: string
  form: Record<string, unknown>
  readFlag: boolean
  status: CandidatureStatus
  /** Transitions autorisées depuis le statut courant (calculées par l'API). */
  allowedStatuses?: CandidatureStatus[]
  note?: string
  createdAt: string
}

/** Réponse paginée Spring Data (Page<T>). */
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface CandidaturesSummary {
  total: number
  unread: number
  byProgram: Record<string, number>
  byStatus: Record<string, number>
  newByProgram: Record<string, number>
}

export interface MessagesSummary {
  total: number
  unread: number
}

/** Un jour d'activité de la boîte de réception (tableau de bord). */
export interface DayActivity {
  day: string
  candidatures: number
  messages: number
}

/** Inscriptions newsletter par jour (tableau de bord). */
export interface DayCount {
  day: string
  count: number
}
