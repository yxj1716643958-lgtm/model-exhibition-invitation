'use client'

import { useState, FormEvent, useRef, useEffect } from 'react'
import Link from 'next/link'
import { BrowserMultiFormatReader } from '@zxing/library'
import { PasswordGuard } from '@/components/PasswordGuard'

interface RedeemResult {
  success: boolean
  message: string
  ticket?: {
    name: string
    phone: string
    status: string
  }
}

function RedeemPageContent() {
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RedeemResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scannerError, setScannerError] = useState<string | null>(null)

  // 手动核销
  const handleRedeem = async (e?: FormEvent) => {
    if (e) e.preventDefault()

    if (!verificationCode.trim()) {
      setResult({ success: false, message: '请输入核销码' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/tickets/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationCode: verificationCode.trim() })
      })

      const data: RedeemResult = await response.json()
      setResult(data)

      if (data.success) {
        setVerificationCode('')
        // 停止扫码
        if (isScanning) {
          stopScanning()
        }
      }
    } catch (error) {
      setResult({ success: false, message: '网络错误，请稍后重试' })
    } finally {
      setLoading(false)
    }
  }

  // 启动扫码
  const startScanning = async () => {
    setIsScanning(true)
    setScannerError(null)

    try {
      const reader = new BrowserMultiFormatReader()
      const videoInputDevices = await reader.listVideoInputDevices()

      if (videoInputDevices.length === 0) {
        setScannerError('未检测到摄像头设备')
        setIsScanning(false)
        return
      }

      // 使用第一个摄像头
      const selectedDeviceId = videoInputDevices[0].deviceId

      await reader.decodeFromVideoDevice(
        selectedDeviceId,
        'video',
        (result, error) => {
          if (result) {
            const code = result.getText()
            setVerificationCode(code)
            // 自动提交核销
            setTimeout(() => {
              handleRedeem()
            }, 500)
          }
          if (error && error.name !== 'NotFoundException') {
            console.error('扫码错误:', error)
          }
        }
      )
    } catch (error) {
      console.error('启动扫码失败:', error)
      setScannerError('启动摄像头失败，请检查权限设置')
      setIsScanning(false)
    }
  }

  // 停止扫码
  const stopScanning = () => {
    setIsScanning(false)
    // 页面刷新会停止扫码
  }

  // 清除结果
  const clearResult = () => {
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* 导航栏 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/" className="text-gray-600 hover:text-indigo-600">
              首页
            </Link>
            <Link href="/status" className="text-gray-600 hover:text-indigo-600">
              状态查询
            </Link>
            <Link href="/admin" className="text-gray-600 hover:text-indigo-600">
              管理后台
            </Link>
            <span className="text-indigo-600 font-medium">
              核销页面
            </span>
          </div>
        </div>

        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎫</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">门票核销</h1>
          <p className="text-gray-600">扫描二维码或输入核销码验证门票</p>
        </div>

        {/* 扫码按钮 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={isScanning ? stopScanning : startScanning}
            className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition flex items-center justify-center gap-3 ${
              isScanning
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isScanning ? (
              <>
                <span>⏹</span>
                <span>停止扫码</span>
              </>
            ) : (
              <>
                <span>📷</span>
                <span>启动扫码</span>
              </>
            )}
          </button>

          {scannerError && (
            <div className="mt-4 bg-red-50 text-red-800 px-4 py-3 rounded-lg text-sm">
              {scannerError}
            </div>
          )}

          {/* 扫码区域 */}
          {isScanning && (
            <div className="mt-4">
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '1' }}>
                <video
                  ref={videoRef}
                  id="video"
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                />
                {/* 扫码框 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-4 border-green-400 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 -mb-1 -mr-1"></div>
                  </div>
                </div>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
                    将二维码放入框内即可自动扫描
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 手动输入 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">手动输入核销码</h2>
            <span className="text-sm text-gray-500">或</span>
          </div>

          <form onSubmit={handleRedeem}>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
              placeholder="请输入核销码"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg tracking-wider"
              autoFocus
            />

            <button
              type="submit"
              disabled={loading || !verificationCode.trim()}
              className="w-full mt-4 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              {loading ? '核销中...' : '确认核销'}
            </button>
          </form>
        </div>

        {/* 核销结果 */}
        {result && (
          <div
            className={`rounded-lg shadow-md p-6 mb-6 ${
              result.success
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-red-50 border-2 border-red-200'
            }`}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">
                {result.success ? '✅' : '❌'}
              </div>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {result.success ? '核销成功' : '核销失败'}
              </h3>
              <p
                className={`mb-4 ${result.success ? 'text-green-700' : 'text-red-700'}`}
              >
                {result.message}
              </p>

              {result.ticket && (
                <div className="bg-white rounded-lg p-4 mt-4">
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-600">姓名</span>
                      <span className="font-medium text-gray-900">{result.ticket.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">手机号</span>
                      <span className="font-medium text-gray-900">{result.ticket.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">状态</span>
                      <span className="font-medium text-green-600">{result.ticket.status}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={clearResult}
                className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                继续核销 →
              </button>
            </div>
          </div>
        )}

        {/* 快捷链接 */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/" className="text-gray-600 hover:text-indigo-600">
              首页
            </Link>
            <Link href="/status" className="text-gray-600 hover:text-indigo-600">
              状态查询
            </Link>
            <Link href="/admin" className="text-gray-600 hover:text-indigo-600">
              管理后台
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// 导出带密码保护的页面
export default function RedeemPage() {
  return (
    <PasswordGuard pageName="核销页面">
      <RedeemPageContent />
    </PasswordGuard>
  )
}
