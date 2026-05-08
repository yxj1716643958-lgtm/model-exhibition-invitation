'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PasswordGuard } from '@/components/PasswordGuard'

type TicketStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

interface Ticket {
  id: string
  name: string
  phone: string
  email?: string
  organization?: string  // 企业/学校
  idCard?: string        // 身份证号
  companions?: string    // 随行人员
  status: TicketStatus
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
}

function AdminPageContent() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all')
  const [loading, setLoading] = useState(true)
  const [reviewerName, setReviewerName] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [filter])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const url = filter === 'all' ? '/api/tickets' : `/api/tickets?status=${filter}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error('获取门票列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (action: 'approve' | 'reject', rejectReason?: string) => {
    if (!selectedTicket || !reviewerName) {
      alert('请输入审核员姓名')
      return
    }

    try {
      const response = await fetch(`/api/tickets/${selectedTicket.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reviewerName,
          rejectReason
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(action === 'approve' ? '审核通过' : '审核拒绝')
        setShowReviewModal(false)
        fetchTickets()
      } else {
        alert(data.message || '操作失败')
      }
    } catch (error) {
      alert('操作失败，请稍后重试')
    }
  }

  const getStatusBadge = (status: TicketStatus) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    }

    const labels = {
      PENDING: '待审核',
      APPROVED: '已通过',
      REJECTED: '已拒绝'
    }

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const filteredTickets = filter === 'all' ? tickets : tickets.filter(t => t.status === filter)
  const pendingCount = tickets.filter(t => t.status === 'PENDING').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">邀请函管理后台</h1>
              <p className="text-gray-600 text-sm mt-1">管理模玩展邀请函申请</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">待审核申请</p>
                <p className="text-2xl font-bold text-indigo-600">{pendingCount}</p>
              </div>
              <Link
                href="/redeem"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                前往核销
              </Link>
              <Link
                href="/"
                className="text-gray-600 hover:text-indigo-600 px-3 py-2"
              >
                首页
              </Link>
            </div>
          </div>
          {/* 导航标签 */}
          <div className="flex gap-6 mt-4 text-sm">
            <Link href="/" className="text-gray-600 hover:text-indigo-600">
              首页
            </Link>
            <Link href="/status" className="text-gray-600 hover:text-indigo-600">
              状态查询
            </Link>
            <span className="text-indigo-600 font-medium">
              管理后台
            </span>
            <Link href="/redeem" className="text-gray-600 hover:text-indigo-600">
              核销页面
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 筛选器 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部 ({tickets.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'PENDING'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              待审核 ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('APPROVED')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'APPROVED'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              已通过
            </button>
            <button
              onClick={() => setFilter('REJECTED')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'REJECTED'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              已拒绝
            </button>
          </div>

          {/* 审核员姓名 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              审核员姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="请输入您的姓名"
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 门票列表 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600">暂无申请记录</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      申请时间
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      姓名
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      手机号
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      企业/学校
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      随行人员
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      审核信息
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(ticket.createdAt).toLocaleString('zh-CN')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ticket.name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.phone}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {ticket.organization || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate" title={ticket.companions || ''}>
                        {ticket.companions || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {ticket.reviewedBy ? (
                          <div>
                            <div>{ticket.reviewedBy}</div>
                            {ticket.reviewedAt && (
                              <div className="text-xs text-gray-500">
                                {new Date(ticket.reviewedAt).toLocaleString('zh-CN')}
                              </div>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {ticket.status === 'PENDING' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedTicket(ticket)
                                setShowReviewModal(true)
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              审核
                            </button>
                          </div>
                        )}
                        {ticket.status === 'APPROVED' && (
                          <span className="text-gray-400">已通过</span>
                        )}
                        {ticket.status === 'REJECTED' && (
                          <span className="text-gray-400">已拒绝</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 审核弹窗 */}
      {showReviewModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">审核申请</h3>

              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">姓名</span>
                  <span className="font-medium">{selectedTicket.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">手机号</span>
                  <span className="font-medium">{selectedTicket.phone}</span>
                </div>
                {selectedTicket.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">邮箱</span>
                    <span className="font-medium">{selectedTicket.email}</span>
                  </div>
                )}
                {selectedTicket.organization && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">企业/学校</span>
                    <span className="font-medium">{selectedTicket.organization}</span>
                  </div>
                )}
                {selectedTicket.idCard && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">身份证号</span>
                    <span className="font-medium">{selectedTicket.idCard}</span>
                  </div>
                )}
                {selectedTicket.companions && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">随行人员</span>
                    <span className="font-medium">{selectedTicket.companions}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleReview('approve')}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                >
                  ✓ 通过
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('请输入拒绝原因（选填）：')
                    if (reason !== null) {
                      handleReview('reject', reason)
                    }
                  }}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
                >
                  ✗ 拒绝
                </button>
              </div>

              <button
                onClick={() => {
                  setShowReviewModal(false)
                  setSelectedTicket(null)
                }}
                className="w-full mt-3 text-gray-600 hover:text-gray-800 py-2"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 导出带密码保护的页面
export default function AdminPage() {
  return (
    <PasswordGuard pageName="管理后台">
      <AdminPageContent />
    </PasswordGuard>
  )
}
