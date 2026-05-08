import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ReviewTicketRequest } from '@/lib/types'

// POST /api/tickets/[id]/review - 审核门票
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: ReviewTicketRequest = await request.json()
    const { action, reviewerName, rejectReason } = body

    // 验证请求参数
    if (!action || !reviewerName) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 查找门票
    const ticket = await prisma.ticket.findUnique({
      where: { id }
    })

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: '门票不存在' },
        { status: 404 }
      )
    }

    // 检查状态是否允许审核
    if (ticket.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, message: '该申请已被处理' },
        { status: 400 }
      )
    }

    // 生成唯一的核销码（用于通过审核的情况）
    const generateVerificationCode = (): string => {
      const timestamp = Date.now().toString(36)
      const random = Math.random().toString(36).substring(2, 8)
      return `${timestamp}-${random}`.toUpperCase()
    }

    // 更新门票状态
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        verificationCode: action === 'approve' ? generateVerificationCode() : null,
        reviewedAt: new Date(),
        reviewedBy: reviewerName,
        rejectReason: action === 'reject' ? rejectReason : null
      }
    })

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? '审核通过' : '审核拒绝',
      ticket: {
        id: updatedTicket.id,
        name: updatedTicket.name,
        phone: updatedTicket.phone,
        status: updatedTicket.status,
        verificationCode: updatedTicket.verificationCode
      }
    })
  } catch (error) {
    console.error('审核门票错误:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}
