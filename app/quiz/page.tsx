'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Navbar from '@/app/components/shared/Navbar'

interface Question {
  id: string
  word: string
  correctAnswer: string
  options: string[]
}

export default function QuizPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [quizComplete, setQuizComplete] = useState(false)
  const [totalXPEarned, setTotalXPEarned] = useState(0)
  const [submittingXP, setSubmittingXP] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/quiz')
      const data = await res.json()
      setQuestions(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching quiz:', error)
      setLoading(false)
    }
  }

  const handleAnswer = (option: string) => {
    if (answered) return

    setSelectedAnswer(option)
    setAnswered(true)

    const isCorrect = option === questions[currentIndex].correctAnswer
    const xpGained = isCorrect ? 10 : 0
    const newXP = totalXPEarned + xpGained

    if (isCorrect) {
      setScore(prev => prev + 1)
      setTotalXPEarned(newXP)
    }

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1)
        setSelectedAnswer(null)
        setAnswered(false)
      } else {
        completeQuiz(newXP)
      }
    }, 1500)
  }

  const completeQuiz = async (finalXP: number) => {
    setQuizComplete(true)
    setSubmittingXP(true)

    try {
      await fetch('/api/user/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp: finalXP }),
      })
    } catch (error) {
      console.error('Error submitting XP:', error)
    } finally {
      setSubmittingXP(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 mx-auto mb-4 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          <p style={{ color: 'var(--text-secondary)', fontFamily: "'DM Sans'" }}>Preparing your challenge...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (questions.length === 0) {
    return (
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }} className="flex items-center justify-center px-6">
        <div className="card p-10 text-center max-w-md w-full" style={{ borderRadius: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '16px', fontFamily: 'var(--font-body)' }}>
            No quiz available right now.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-press"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '50px',
              background: 'linear-gradient(135deg, var(--brand-bright), var(--brand-dim))',
              color: 'white',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Quiz Complete Screen
  if (quizComplete) {
    return (
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }} className="page-wrapper">
        <Navbar />
        <div className="flex items-center justify-center px-6 py-12 min-h-[calc(100vh-64px)]">
          <div 
          className="card p-12 max-w-[500px] w-full text-center" 
          style={{ 
            animation: 'fadeUp 0.6s ease',
            background: 'linear-gradient(135deg, rgba(124, 109, 250, 0.08) 0%, rgba(157, 81, 245, 0.04) 100%)',
            border: '2px solid var(--brand-border)',
            borderRadius: '32px'
          }}
        >
          <div style={{ marginBottom: '32px' }}>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3].map((star) => (
                <svg key={star} width="40" height="40" viewBox="0 0 24 24" fill={score / questions.length >= star / 3 ? 'var(--semantic-gold)' : 'rgba(124,109,250,0.1)'} stroke={score / questions.length >= star / 3 ? 'var(--semantic-gold)' : 'rgba(124,109,250,0.2)'} strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            
            <h1 style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: '80px', 
              fontWeight: 800, 
              marginBottom: '16px',
              background: 'linear-gradient(135deg, var(--brand-bright), var(--semantic-gold))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1
            }}>
              {score}/{questions.length}
            </h1>

            <div style={{
              display: 'inline-block',
              background: 'rgba(245, 166, 35, 0.12)',
              color: 'var(--semantic-gold)',
              border: '1px solid rgba(245, 166, 35, 0.3)',
              borderRadius: '20px',
              padding: '6px 16px',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.05em',
              marginBottom: '32px'
            }}>
              +{totalXPEarned} XP EARNED
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              onClick={() => {
                setCurrentIndex(0)
                setScore(0)
                setAnswered(false)
                setSelectedAnswer(null)
                setQuizComplete(false)
                setTotalXPEarned(0)
                fetchQuestions()
              }}
              className="btn-press"
              style={{ 
                padding: '18px',
                background: 'linear-gradient(135deg, var(--brand-bright), var(--brand-dim))',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontFamily: 'var(--font-heading)',
                fontSize: '18px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(124,109,250,0.35)'
              }}
            >
              Play Again
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-press"
              style={{ 
                padding: '18px',
                background: 'transparent',
                color: 'white',
                border: '2px solid var(--brand-border)',
                borderRadius: '16px',
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Back to Dashboard
            </button>
          </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }} className="page-wrapper relative">
      <Navbar />

      {/* Progress Bar */}
      <div
        style={{
          position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: 'var(--border)',
            zIndex: 40,
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--brand-bright), var(--brand-dim))',
              width: `${progress}%`,
              transition: 'width 0.5s ease',
            }}
          />
        </div>

      <main className="max-w-[800px] mx-auto px-[24px] py-12 pt-24">
        
        {/* Header Stats */}
        <div className="flex justify-between items-center mb-12 animate-fade-up">
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            PROGRESS {currentIndex + 1}/{questions.length}
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: 'var(--brand-bright)' }}>
            SCORE {score}
          </div>
        </div>

        {/* Badge and Word */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }} key={`word-${currentIndex}`}>
          <div 
            style={{
              display: 'inline-block',
              background: 'rgba(124,109,250,0.12)',
              color: 'var(--brand-bright)',
              border: '1px solid var(--brand-border)',
              borderRadius: '6px',
              fontSize: '11px',
              letterSpacing: '0.12em',
              padding: '4px 12px',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: '24px'
            }}
          >
            DEFINE THIS WORD
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(48px, 8vw, 80px)',
              fontWeight: 800,
              color: 'white',
              animation: 'wordReveal 0.4s ease forwards',
            }}
          >
            {currentQuestion.word}
          </h1>
        </div>

        {/* Options Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }} key={`options-${currentIndex}`}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option
            const isCorrectOption = option === currentQuestion.correctAnswer

            let bgColor = 'var(--bg-card)'
            let borderColor = 'var(--brand-border)'
            let textColor = 'var(--text-primary)'
            let icon = null

            if (answered) {
              if (isCorrectOption) {
                bgColor = 'rgba(0, 214, 143, 0.08)'
                borderColor = 'var(--semantic-success)'
                textColor = 'var(--semantic-success)'
                icon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              } else if (isSelected && !isCorrectOption) {
                bgColor = 'rgba(255, 77, 109, 0.08)'
                borderColor = 'var(--semantic-danger)'
                textColor = 'var(--semantic-danger)'
                icon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={answered}
                className={`flex items-center justify-between ${!answered ? 'hover:bg-var(--bg-card-hover) hover:border-var(--brand-bright) hover:translate-x-1' : ''}`}
                style={{
                  padding: '20px 24px',
                  borderRadius: '16px',
                  border: `2px solid ${borderColor}`,
                  backgroundColor: bgColor,
                  color: textColor,
                  fontSize: '15px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 400,
                  textAlign: 'left',
                  cursor: answered ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                  width: '100%'
                }}
              >
                <span>{option}</span>
                {icon && <span>{icon}</span>}
              </button>
            )
          })}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wordReveal {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  )
}
