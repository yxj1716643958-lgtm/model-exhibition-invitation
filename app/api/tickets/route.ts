import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateTicketRequest } from '@/lib/types'

// POST /api/tickets - 提交门票申请
export async function POST(request: NextRequest) {
  try {
    const body: CreateTicketRequest = await request.json()
    const { name, phone, email, organization, idCard, companions } = body

    // 验证必填字段
    if (!name || !phone || !email || !organization || !idCard) {
      return NextResponse.json(
        { success: false, message: '姓名、手机号、邮箱、企业/学校和身份证号为必填项' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    // 验证手机号格式（中国手机号）
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, message: '请输入有效的手机号' },
        { status: 400 }
      )
    }

    // 验证身份证号格式
    const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
    if (!idCardRegex.test(idCard)) {
      return NextResponse.json(
        { success: false, message: '请输入有效的身份证号' },
        { status: 400 }
      )
    }

    // 检查是否已有待审核或已通过的申请
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        phone,
        status: { in: ['PENDING', 'APPROVED'] }
      }
    })

    if (existingTicket) {
      return NextResponse.json(
        {
          success: false,
          message: '您已有待审核或已通过的申请',
          ticketId: existingTicket.id
        },
        { status: 409 }
      )
    }

    // 创建新的门票申请
    const ticket = await prisma.ticket.create({
      data: {
        name,
        phone,
        email: email || null,
        organization: organization || null,
        idCard: idCard || null,
        companions: companions || null,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      message: '申请提交成功，请等待管理员审核',
      ticket: {
        id: ticket.id,
        name: ticket.name,
        phone: ticket.phone,
        status: ticket.status
      }
    })
  } catch (error) {
    console.error('创建门票申请错误:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}

// GET /api/tickets - 获取门票列表（管理员用）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    const where = status ? { status: status as any } : {}

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      tickets
    })
  } catch (error) {
    console.error('获取门票列表错误:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}
