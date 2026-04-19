'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import WordOfTheWeek from '@/app/components/WordOfTheWeek'
import Navbar from '@/app/components/shared/Navbar'

export default function WordOfTheWeekPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading voting dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <main className="py-8">
        <WordOfTheWeek />
      </main>
    </div>
  )
}
