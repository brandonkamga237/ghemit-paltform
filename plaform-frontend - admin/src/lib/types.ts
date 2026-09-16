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
  size: number
  createdAt: string
  url: string
}

export interface Subscriber {
  id: string
  email: string
  active: boolean
  createdAt: string
}

export interface Campaign {
  id: string
  subject: string
  body: string
  recipientCount: number
  sentAt: string
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

export interface Candidature {
  id: string
  program: string
  form: Record<string, unknown>
  readFlag: boolean
  createdAt: string
}
