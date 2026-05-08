'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import Link from 'next/link'
import { Suspense } from 'react'

type TicketStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

interface TicketData {
  id: string
  name: string
  phone: string
  status: TicketStatus
  verificationCode?: string
  isRedeemed: boolean
  createdAt: string
}

export function StatusPageContent() {
  const searchParams = useSearchParams()
  const [phone, setPhone] = useState(searchParams.get('phone') || '')
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (phone) {
      checkStatus()
    }
  }, [])

  const checkStatus = async () => {
    if (!phone) {
      setError('请输入手机号')
      return
    }

    setLoading(true)
    setError(null)
    setTicket(null)

    try {
      const response = await fetch(`/api/tickets/phone/${encodeURIComponent(phone)}`)
      const data = await response.json()

      if (data.success) {
        setTicket(data.ticket)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('查询失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    checkStatus()
  }

  const getStatusInfo = (status: TicketStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          text: '待审核',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          icon: '⏳'
        }
      case 'APPROVED':
        return {
          text: '已通过',
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          icon: '✅'
        }
      case 'REJECTED':
        return {
          text: '已拒绝',
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          icon: '❌'
        }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">查询申请状态</h1>
          <p className="text-gray-600">输入手机号查询您的申请进度</p>
        </div>

        {/* 查询表单 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              pattern="^1[3-9]\d{9}$"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {loading ? '查询中...' : '查询'}
            </button>
          </form>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* 门票信息卡片 */}
        {ticket && (
          <div className={`bg-white rounded-lg shadow-md overflow-hidden ${getStatusInfo(ticket.status).borderColor} border-2`}>
            {/* 状态头部 */}
            <div className={`${getStatusInfo(ticket.status).bgColor} ${getStatusInfo(ticket.status).textColor} px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getStatusInfo(ticket.status).icon}</span>
                  <span className="font-semibold text-lg">{getStatusInfo(ticket.status).text}</span>
                </div>
              </div>
            </div>

            {/* 申请信息 */}
            <div className="px-6 py-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">姓名</span>
                <span className="font-medium text-gray-900">{ticket.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">手机号</span>
                <span className="font-medium text-gray-900">{ticket.phone}</span>
              </div>
              {(ticket as any).organization && (
                <div className="flex justify-between">
                  <span className="text-gray-600">企业/学校</span>
                  <span className="font-medium text-gray-900">{(ticket as any).organization}</span>
                </div>
              )}
              {(ticket as any).idCard && (
                <div className="flex justify-between">
                  <span className="text-gray-600">身份证号</span>
                  <span className="font-medium text-gray-900">
                    {(ticket as any).idCard.replace(/(.{6})(.*)(.{4})/, '$1****$3')}
                  </span>
                </div>
              )}
              {(ticket as any).companions && (
                <div className="flex justify-between">
                  <span className="text-gray-600">随行人员</span>
                  <span className="font-medium text-gray-900">{(ticket as any).companions}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">申请时间</span>
                <span className="text-gray-900">
                  {new Date(ticket.createdAt).toLocaleString('zh-CN')}
                </span>
              </div>
            </div>

            {/* 已通过：显示二维码 */}
            {ticket.status === 'APPROVED' && (
              <div className="px-6 pb-6">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  {ticket.isRedeemed ? (
                    <div>
                      <div className="text-6xl mb-3">✅</div>
                      <p className="text-green-600 font-semibold text-lg">门票已核销</p>
                      <p className="text-gray-600 text-sm mt-2">感谢您的参与！</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 font-medium mb-4">您的入场二维码</p>
                      <div className="flex justify-center mb-4">
                        <div className="bg-white p-4 rounded-lg shadow-inner">
                          {ticket.verificationCode && (
                            <QRCodeSVG
                              value={ticket.verificationCode}
                              size={180}
                              level="H"
                              includeMargin={false}
                            />
                          )}
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm">
                        核销码：{ticket.verificationCode}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        请在活动当天出示此二维码入场
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 待审核 */}
            {ticket.status === 'PENDING' && (
              <div className="px-6 pb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-blue-800">
                    您的申请正在审核中，请耐心等待
                  </p>
                  <p className="text-blue-600 text-sm mt-2">
                    审核通过后将自动生成入场二维码
                  </p>
                </div>
              </div>
            )}

            {/* 已拒绝 */}
            {ticket.status === 'REJECTED' && (
              <div className="px-6 pb-6">
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-red-800">
                    很抱歉，您的申请未通过审核
                  </p>
                  <p className="text-red-600 text-sm mt-2">
                    如有疑问，请联系活动主办方
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 返回首页 */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← 返回首页
          </Link>
        </div>

        {/* 底部导航 */}
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <Link href="/" className="text-gray-600 hover:text-indigo-600">
            首页
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/admin" className="text-gray-600 hover:text-indigo-600">
            管理后台
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/redeem" className="text-gray-600 hover:text-indigo-600">
            核销页面
          </Link>
        </div>
      </div>
    </div>
  )
}
