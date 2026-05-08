import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RedeemTicketResponse } from '@/lib/types'

// POST /api/tickets/redeem - 核销门票
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { verificationCode } = body

    // 验证核销码
    if (!verificationCode) {
      return NextResponse.json<RedeemTicketResponse>(
        { success: false, message: '请输入核销码' },
        { status: 400 }
      )
    }

    // 查找门票（通过核销码）
    const ticket = await prisma.ticket.findUnique({
      where: { verificationCode }
    })

    if (!ticket) {
      return NextResponse.json<RedeemTicketResponse>(
        { success: false, message: '无效的核销码' },
        { status: 404 }
      )
    }

    // 检查门票状态
    if (ticket.status !== 'APPROVED') {
      return NextResponse.json<RedeemTicketResponse>(
        { success: false, message: `该门票状态为: ${getStatusText(ticket.status)}` },
        { status: 400 }
      )
    }

    // 检查是否已核销
    if (ticket.isRedeemed) {
      return NextResponse.json<RedeemTicketResponse>(
        {
          success: false,
          message: '该门票已被核销',
          ticket: {
            name: ticket.name,
            phone: maskPhone(ticket.phone),
            status: getStatusText(ticket.status)
          }
        },
        { status: 400 }
      )
    }

    // 核销门票（使用事务确保原子性）
    const redeemedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isRedeemed: true,
        redeemedAt: new Date()
      }
    })

    return NextResponse.json<RedeemTicketResponse>({
      success: true,
      message: '核销成功',
      ticket: {
        name: redeemedTicket.name,
        phone: maskPhone(redeemedTicket.phone),
        status: getStatusText(redeemedTicket.status)
      }
    })
  } catch (error) {
    console.error('核销门票错误:', error)
    return NextResponse.json<RedeemTicketResponse>(
      { success: false, message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}

// 辅助函数：获取状态文本
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': '待审核',
    'APPROVED': '已通过',
    'REJECTED': '已拒绝'
  }
  return statusMap[status] || status
}

// 辅助函数：手机号脱敏
function maskPhone(phone: string): string {
  if (phone.length === 11) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }
  return phone
}
