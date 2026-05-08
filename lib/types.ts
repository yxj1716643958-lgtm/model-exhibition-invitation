export type TicketStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Ticket {
  id: string
  name: string
  phone: string
  email?: string | null
  organization?: string | null   // 企业/学校
  idCard?: string | null         // 身份证号
  companions?: string | null     // 随行人员
  status: TicketStatus
  verificationCode?: string | null
  isRedeemed: boolean
  redeemedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  reviewedAt?: Date | null
  reviewedBy?: string | null
  rejectReason?: string | null
}

export interface CreateTicketRequest {
  name: string
  phone: string
  email: string
  organization: string     // 企业/学校（必填）
  idCard: string           // 身份证号（必填）
  companions?: string       // 随行人员（可选）
}

export interface ReviewTicketRequest {
  ticketId: string
  action: 'approve' | 'reject'
  reviewerName: string
  rejectReason?: string
}

export interface RedeemTicketRequest {
  verificationCode: string
}

export interface RedeemTicketResponse {
  success: boolean
  message: string
  ticket?: {
    name: string
    phone: string
    status: string
  }
}
