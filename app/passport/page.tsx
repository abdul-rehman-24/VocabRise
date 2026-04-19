import { Metadata } from 'next'
import VocabularyPassport from '@/app/components/VocabularyPassport'
import Navbar from '@/app/components/shared/Navbar'

export const metadata: Metadata = {
  title: 'Vocabulary Passport | VocabRise',
  description: 'Build your vocabulary passport by collecting words and unlocking achievements',
}

export default function PassportPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <main>
        <VocabularyPassport />
      </main>
    </div>
  )
}
