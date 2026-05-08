import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tickets/phone/[phone] - 通过手机号获取门票状态
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const { phone } = await params

    const ticket = await prisma.ticket.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' }
    })

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: '未找到相关申请记录' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        name: ticket.name,
        phone: ticket.phone,
        status: ticket.status,
        verificationCode: ticket.verificationCode,
        isRedeemed: ticket.isRedeemed,
        createdAt: ticket.createdAt,
        reviewedAt: ticket.reviewedAt
      }
    })
  } catch (error) {
    console.error('通过手机号查询门票错误:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}
