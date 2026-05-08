import { Suspense } from 'react'
import { StatusPageContent } from './StatusPageContent'

export default function StatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    }>
      <StatusPageContent />
    </Suspense>
  )
}
