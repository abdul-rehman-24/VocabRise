'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from '@/app/components/shared/Navbar'
import WordBattle from '@/app/components/WordBattle'

export default function WordBattlePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 mx-auto mb-4 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          <p style={{ color: 'var(--text-secondary)', fontFamily: "'DM Sans'" }}>Preparing your battle...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />
      <main className="py-8 md:py-12 px-4 max-w-2xl mx-auto">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] overflow-hidden shadow-2xl relative">
          <WordBattle />
        </div>
      </main>
    </div>
  )
}
