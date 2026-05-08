'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface FormData {
  name: string
  phone: string
  email: string
  organization: string  // 企业/学校
  idCard: string        // 身份证号
  companions: string    // 随行人员
}

export default function Home() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    organization: '',
    idCard: '',
    companions: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        // 跳转到状态查询页面
        setTimeout(() => {
          router.push(`/status?phone=${encodeURIComponent(formData.phone)}`)
        }, 1500)
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请稍后重试' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">模玩展邀请函申请</h1>
          <p className="text-gray-600">请填写您的信息申请模玩展邀请函</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 姓名 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="请输入您的姓名"
              />
            </div>

            {/* 手机号 */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                手机号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                required
                pattern="^1[3-9]\d{9}$"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="请输入您的手机号"
              />
            </div>

            {/* 邮箱 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="请输入您的邮箱"
              />
            </div>

            {/* 企业/学校 */}
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                企业/学校 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="organization"
                required
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="请输入您的企业或学校名称"
              />
            </div>

            {/* 身份证号 */}
            <div>
              <label htmlFor="idCard" className="block text-sm font-medium text-gray-700 mb-2">
                身份证号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="idCard"
                required
                value={formData.idCard}
                onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                pattern="^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="请输入您的身份证号"
              />
            </div>

            {/* 随行人员 */}
            <div>
              <label htmlFor="companions" className="block text-sm font-medium text-gray-700 mb-2">
                随行人员
              </label>
              <textarea
                id="companions"
                value={formData.companions}
                onChange={(e) => setFormData({ ...formData, companions: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                placeholder="请输入随行人员姓名，多人用逗号分隔"
              />
              <p className="text-xs text-gray-500 mt-1">例如：张三，李四，王五</p>
            </div>

            {/* 提示消息 */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              {loading ? '提交中...' : '提交申请'}
            </button>
          </form>

          {/* 查询申请状态链接 */}
          <div className="mt-6 text-center">
            <a
              href="/status"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              查询申请状态 →
            </a>
          </div>
        </div>

        {/* 管理入口 */}
        <div className="mt-6 flex justify-center gap-6">
          <a
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition text-gray-700 hover:text-indigo-600 text-sm"
          >
            <span>⚙️</span>
            <span>管理后台</span>
          </a>
          <a
            href="/redeem"
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition text-gray-700 hover:text-indigo-600 text-sm"
          >
            <span>🎫</span>
            <span>核销页面</span>
          </a>
        </div>
      </div>
    </div>
  )
}
