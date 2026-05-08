import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tickets/[id] - 获取门票详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const ticket = await prisma.ticket.findUnique({
      where: { id }
    })

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: '门票不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        name: ticket.name,
        phone: ticket.phone,
        email: ticket.email,
        status: ticket.status,
        verificationCode: ticket.verificationCode,
        isRedeemed: ticket.isRedeemed,
        createdAt: ticket.createdAt,
        reviewedAt: ticket.reviewedAt
      }
    })
  } catch (error) {
    console.error('获取门票详情错误:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}

// GET /api/tickets/phone/[phone] - 通过手机号查询门票
