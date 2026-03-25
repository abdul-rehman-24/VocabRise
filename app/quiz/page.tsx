'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-zinc-400">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">No quiz available. Please try again later.</p>
          <Link href="/dashboard" className="text-indigo-500 hover:text-indigo-400">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Quiz Complete Screen
  if (quizComplete) {
    return (
      <main className="min-h-screen bg-[#0F0F0F] text-zinc-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Quiz Complete! 🎉</h1>
          <p className="text-zinc-400 mb-8">Great job! Here's your performance:</p>

          <div className="space-y-6 mb-8">
            <div className="bg-zinc-800 rounded-xl p-6">
              <p className="text-zinc-400 text-sm mb-2">Your Score</p>
              <p className="text-5xl font-bold text-indigo-400">
                {score}/{questions.length}
              </p>
            </div>

            <div className="bg-zinc-800 rounded-xl p-6">
              <p className="text-zinc-400 text-sm mb-2">Experience Earned</p>
              <p className="text-4xl font-bold text-green-400">
                +{totalXPEarned} XP
              </p>
            </div>
          </div>

          <div className="space-y-3">
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
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-95"
            >
              Play Again
            </button>
            <Link
              href="/dashboard"
              className="block w-full border border-zinc-700 text-zinc-200 hover:border-zinc-600 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 text-center"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const currentQuestion = questions[currentIndex]
  const isCorrect =
    answered && selectedAnswer === currentQuestion.correctAnswer

  return (
    <main className="min-h-screen bg-[#0F0F0F] text-zinc-100">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors">
            ← Back
          </Link>
          <span className="text-sm font-medium text-zinc-300">
            Question {currentIndex + 1}/{questions.length}
          </span>
          <span className="text-sm font-medium text-indigo-400">
            Score: {score}
          </span>
        </div>
      </nav>

      {/* PROGRESS BAR */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* QUIZ CONTENT */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Word */}
          <h1 className="text-5xl sm:text-6xl font-bold text-indigo-400 text-center mb-8">
            {currentQuestion.word}
          </h1>

          {/* Question */}
          <p className="text-xl text-zinc-300 text-center mb-12">
            What is the definition of <span className="font-semibold">{currentQuestion.word}</span>?
          </p>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option
              const isCorrectOption = option === currentQuestion.correctAnswer

              let buttonClass =
                'p-6 rounded-xl border-2 transition-all duration-200 text-left font-medium hover:border-indigo-500'

              if (!answered) {
                buttonClass += ' bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800'
              } else if (isCorrectOption) {
                buttonClass += ' bg-green-900/30 border-green-500 text-green-300'
              } else if (isSelected && !isCorrect) {
                buttonClass += ' bg-red-900/30 border-red-500 text-red-300'
              } else {
                buttonClass += ' bg-zinc-900 border-zinc-800 text-zinc-400'
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={answered}
                  className={buttonClass}
                >
                  {option}
                  {answered && isCorrectOption && ' ✓'}
                  {answered && isSelected && !isCorrect && ' ✗'}
                </button>
              )
            })}
          </div>

          {/* Feedback */}
          {answered && (
            <div className={`text-center text-lg font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? '✓ Correct! +10 XP' : '✗ Incorrect'}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
