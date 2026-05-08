'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const PASSWORD = 'zh12345678'
const SESSION_KEY = 'auth_verified'

interface PasswordGuardProps {
  children: React.ReactNode
  pageName: string
}

export function usePasswordVerification() {
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 检查是否已验证
    const verified = sessionStorage.getItem(SESSION_KEY)
    if (verified === 'true') {
      setIsVerified(true)
    }
    setIsLoading(false)
  }, [])

  const verify = (password: string): boolean => {
    if (password === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setIsVerified(true)
      return true
    }
    return false
  }

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setIsVerified(false)
  }

  return { isVerified, isLoading, verify, logout }
}

export function PasswordGuard({ children, pageName }: PasswordGuardProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { isVerified, isLoading, verify } = usePasswordVerification()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      setError('请输入密码')
      return
    }

    if (verify(password)) {
      setError('')
    } else {
      setError('密码错误')
      setPassword('')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    )
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">需要验证</h2>
              <p className="text-gray-600">请输入密码访问{pageName}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  访问密码
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                  placeholder="请输入密码"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-800 px-4 py-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                验证
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-indigo-600 hover:text-indigo-700 text-sm"
              >
                ← 返回首页
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
