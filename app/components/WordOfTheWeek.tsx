'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { X, Send, Share2, Trophy } from 'lucide-react'

// Types
interface Nomination {
  id: string
  word: string
  definition: string
  example: string | null
  weekNumber: number
  weekYear: number
  submittedBy: {
    id: string
    name: string
    image: string | null
  }
  _count: {
    votes: number
  }
}

const getBorderColor = (id: string) => {
  const colors = [
    'var(--brand-bright)',
    'var(--semantic-info)',
    'var(--semantic-warning)',
    'var(--brand-dim)',
    'var(--semantic-success)'
  ]
  const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[sum % colors.length]
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'info' | 'warning'
  timestamp: number
}

interface LeaderboardUser {
  username: string
  count: number
  initial: string
}

// Confetti particle component
const ConfettiParticle = ({ delay, duration }: { delay: number; duration: number }) => {
  const colors = ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#32CD32', '#FF1493']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const randomLeft = Math.random() * 100
  const randomRotation = Math.random() * 360

  return (
    <div
      style={{
        position: 'fixed',
        left: `${randomLeft}%`,
        top: '-10px',
        width: '10px',
        height: '10px',
        backgroundColor: randomColor,
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: `confettiFall ${duration}s linear ${delay}s both`,
        zIndex: 9999,
        transform: `rotate(${randomRotation}deg)`,
      }}
    />
  )
}

// Toast notification component
const ToastContainer = ({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) => {
  useEffect(() => {
    toasts.forEach(toast => {
      const timer = setTimeout(() => onRemove(toast.id), 3000)
      return () => clearTimeout(timer)
    })
  }, [toasts, onRemove])

  return (
    <div className="fixed top-4 right-4 z-[10000] space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg text-white shadow-lg flex items-center gap-2 animate-slide-in ${
            toast.type === 'success'
              ? 'bg-green-500'
              : toast.type === 'info'
              ? 'bg-blue-500'
              : 'bg-amber-500'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}

export default function WordOfTheWeek() {
  // State management
  const [nominations, setNominations] = useState<Nomination[]>([])
  const [hasVoted, setHasVoted] = useState(false)
  const [hasNominated, setHasNominated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [userVotedFor, setUserVotedFor] = useState<string | null>(null)
  const [userSubmittedWord, setUserSubmittedWord] = useState<string | null>(null)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [showWinnerScreen, setShowWinnerScreen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [formData, setFormData] = useState({ word: '', definition: '', why: '' })
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 33, seconds: 15 })
  const [animate, setAnimate] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const confettiRef = useRef<number>(0)

  // Fetch data
  const fetchNominations = async () => {
    try {
      const res = await fetch('/api/nominations')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setNominations(data.nominations)
      setHasVoted(data.hasVoted)
      setHasNominated(data.hasNominated)
      setUserVotedFor(data.userVotedNominationId)
    } catch (error) {
      addToast('Failed to load nominations', 'warning')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNominations()
  }, [])

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev
        seconds--

        if (seconds < 0) {
          seconds = 59
          minutes--
        }
        if (minutes < 0) {
          minutes = 59
          hours--
        }
        if (hours < 0) {
          hours = 23
          days--
        }

        return { days: Math.max(0, days), hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Sort nominations by votes
  const sortedNominations = useMemo(() => {
    return [...nominations].sort((a, b) => b._count.votes - a._count.votes)
  }, [nominations])

  // Calculate leaderboard
  const topVoters = useMemo<LeaderboardUser[]>(() => {
    return []
  }, [])

  const topSubmitters = useMemo<LeaderboardUser[]>(() => {
    const submitters: { [key: string]: number } = {}
    nominations.forEach(nom => {
      const username = nom.submittedBy.name
      submitters[username] = (submitters[username] || 0) + 1
    })
    return Object.entries(submitters)
      .map(([username, count]) => ({
        username,
        count,
        initial: username.charAt(0).toUpperCase(),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [nominations])

  // Add toast notification
  const addToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type, timestamp: Date.now() }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  // Handle vote
  const handleVote = async (id: string, word: string) => {
    if (userVotedFor !== null || hasVoted) {
      addToast('You have already voted this week!', 'warning')
      return
    }

    // Trigger animation
    setAnimate(id)
    setTimeout(() => setAnimate(null), 600)

    const previousNominations = [...nominations]
    // Optimistic Update
    setNominations(prev =>
      prev.map(nom =>
        nom.id === id ? { ...nom, _count: { votes: nom._count.votes + 1 } } : nom
      )
    )

    setUserVotedFor(id)
    setHasVoted(true)
    
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nominationId: id })
      })

      if (res.status === 401) {
        window.location.href = '/login'
        return
      }

      const data = await res.json()

      if (res.status === 409) {
        setNominations(previousNominations)
        setUserVotedFor(null)
        setHasVoted(false)
        addToast('Already voted this week', 'warning')
        return
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to vote')
      }

      setNominations(prev =>
        prev.map(nom =>
          nom.id === id ? { ...nom, _count: { votes: data.voteCount } } : nom
        )
      )

      addToast('Vote cast! +5 XP for participating 🎉', 'success')

      // Winner announcement after short delay
      setTimeout(() => {
        if (word === 'Serendipity') {
          setShowWinnerScreen(true)
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
        }
      }, 500)
    } catch (err: any) {
      setNominations(previousNominations)
      setUserVotedFor(null)
      setHasVoted(false)
      addToast(err.message || 'Failed to cast vote', 'warning')
    }
  }

  // Handle submit nomination
  const handleSubmitNomination = async () => {
    if (!formData.word.trim() || !formData.definition.trim()) {
      addToast('Please fill in all required fields', 'warning')
      return
    }

    if (hasNominated) {
      addToast('You already nominated this week', 'warning')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/nominations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          word: formData.word, 
          definition: formData.definition,
          example: formData.why || null
        })
      })

      const data = await res.json()

      if (res.status === 409) {
        addToast('You already nominated this week', 'warning')
        setIsSubmitting(false)
        return
      }

      if (!res.ok) {
        addToast(data.error || 'Failed to submit nomination', 'warning')
        setIsSubmitting(false)
        return
      }

      setFormData({ word: '', definition: '', why: '' })
      setShowSubmitForm(false)
      addToast(`Your word "${formData.word}" is in the race! 🚀`, 'success')
      await fetchNominations()
    } catch (err: any) {
      addToast(err.message || 'Failed to submit nomination', 'warning')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format remaining time
  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 1
  const timerColor = isUrgent ? 'text-red-600' : 'text-blue-600'

  // Winner word (simulation)
  const winnerWord = 'Serendipity'
  const winnerSubmitter = '@ahmed_lahore'
  const winnerXP = 500

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, var(--bg-primary), var(--bg-secondary))' }}>
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-10 w-1/3 bg-gray-200 rounded dark:bg-gray-700"></div>
          <div className="h-32 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom right, var(--bg-primary), var(--bg-secondary))' }}>
      <style>{`
        @keyframes confettiFall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes popVote {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .animate-pop {
          animation: popVote 0.6s ease-out;
        }
      `}</style>

      {/* Confetti animation */}
      {showConfetti && (
        <>
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiParticle key={i} delay={Math.random() * 0.5} duration={3} />
          ))}
        </>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header with countdown */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              <span>🗳️</span>
              Vote: Word of the Week
            </h1>
            <button
              onClick={() => setShowSubmitForm(true)}
              className="px-6 py-2 text-white font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg, var(--brand-bright) 0%, var(--brand-dim) 100%)' }}
            >
              Nominate a Word
            </button>
          </div>

          {/* Countdown Timer */}
          <div className="text-lg font-semibold" style={{ color: timeLeft.days === 0 && timeLeft.hours < 1 ? 'var(--semantic-danger)' : 'var(--brand-bright)', fontFamily: 'var(--font-body)' }}>
            Voting ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </div>
        </div>

        {/* Last Week's Winner Banner */}
        <div className="mb-8 p-6 rounded-xl shadow-lg border-2" style={{ background: 'linear-gradient(135deg, rgba(124, 109, 250, 0.1) 0%, rgba(157, 81, 245, 0.05) 100%)', borderColor: 'var(--brand-border)' }}>
          <div className="flex items-center gap-4">
            <div className="text-5xl">🏆</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                Last Week's Winner: <span style={{ color: 'var(--brand-bright)' }}>{nominations.find(n => n.word === 'Ephemeral')?.word || 'Ephemeral'}</span>
              </h2>
              <p className="font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Submitted by {nominations.find(n => n.word === 'Ephemeral')?.submittedBy.name || '@sara_pk'}
              </p>
              <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Sara earned 500 XP bonus! 🎊
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main voting section */}
          <div className="lg:col-span-3">
            {/* Preview Winner button */}
            <div className="mb-6">
              <button
                onClick={() => setShowWinnerScreen(!showWinnerScreen)}
                className="px-4 py-2 text-white rounded-lg hover:shadow-md transition-all font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, var(--brand-bright) 0%, var(--brand-dim) 100%)' }}
              >
                {showWinnerScreen ? '← Back to Voting' : 'Preview Winner Announcement 👑'}
              </button>
            </div>

            {/* Winner announcement screen overlay */}
              {showWinnerScreen && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[5000] backdrop-blur-sm">
                <div className="relative rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-2xl" style={{ backgroundColor: 'var(--bg-surface)', border: '2px solid var(--brand-border)' }}>
                  {/* Confetti for this screen too */}
                  {Array.from({ length: 30 }).map((_, i) => (
                    <ConfettiParticle key={`winner-${i}`} delay={Math.random() * 0.3} duration={2.5} />
                  ))}

                  {/* Close Button - Top Right */}
                  <button
                    onClick={() => setShowWinnerScreen(false)}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-lg transition-all hover:opacity-70"
                    style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                    title="Close announcement"
                  >
                    <X size={24} />
                  </button>

                  <div className="text-7xl mb-6">🏆</div>
                  <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }} className="text-5xl font-bold mb-4">
                    WORD OF THE WEEK
                  </h1>
                  <div style={{ fontFamily: 'var(--font-heading)', background: 'linear-gradient(135deg, var(--brand-bright) 0%, var(--brand-dim) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} className="text-6xl font-black mb-4">
                    {winnerWord}
                  </div>

                  <p className="text-xl mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Submitted by <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{winnerSubmitter}</span>
                  </p>
                  <p style={{ fontFamily: 'var(--font-heading)', color: 'var(--semantic-success)' }} className="text-2xl font-bold mb-8">
                    {winnerSubmitter.replace('@', '')} earns {winnerXP} XP! 🎉
                  </p>

                  {/* Shareable text */}
                  <div className="rounded-lg p-4 mb-8 border-l-4" style={{ background: 'rgba(124, 109, 250, 0.1)', borderColor: 'var(--brand-bright)' }}>
                    <p className="italic" style={{ color: 'var(--text-secondary)' }}>
                      "This week's Word of the Week on VocabRise is <strong>{winnerWord}</strong>! Can you use it in a sentence? 📚"
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const text = `This week's Word of the Week on VocabRise is ${winnerWord}! Can you use it in a sentence? 📚`
                      if (navigator.share) {
                        navigator.share({ title: 'Word of the Week', text })
                      } else {
                        navigator.clipboard.writeText(text)
                        addToast('Copied to clipboard!', 'success')
                      }
                    }}
                    className="px-8 py-3 text-white rounded-lg hover:shadow-md transition-all font-semibold flex items-center gap-2 mx-auto mb-6"
                    style={{ background: 'linear-gradient(135deg, var(--semantic-success) 0%, rgba(0, 214, 143, 0.7) 100%)' }}
                  >
                    <Share2 size={20} />
                    Share on WhatsApp
                  </button>

                  <button
                    onClick={() => setShowWinnerScreen(false)}
                    className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, var(--brand-bright) 0%, var(--brand-dim) 100%)' }}
                  >
                    ← Back to Voting
                  </button>
                </div>
              </div>
            )}

            {/* Voting cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedNominations.map((nomination, idx) => (
                <div
                  key={nomination.id}
                  className={`rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:scale-105 border-l-4 ${
                    animate === nomination.id ? 'animate-pop' : ''
                  }`}
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: getBorderColor(nomination.id) }}
                >
                  <div className="p-6">
                    {/* Word title */}
                    <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }} className="text-3xl font-black mb-2">
                      {nomination.word}
                    </h3>

                    {/* Definition */}
                    <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {nomination.definition}
                    </p>

                    {/* Submitted by */}
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: getBorderColor(nomination.id) }}
                      >
                        {nomination.submittedBy.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Submitted by <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{nomination.submittedBy.name}</span>
                      </span>
                    </div>

                    {/* Show if user submitted */}
                    {userSubmittedWord === nomination.word && (
                      <div className="mb-4 px-3 py-1 rounded text-xs font-semibold w-fit" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                        You submitted
                      </div>
                    )}

                    {/* Vote progress */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Votes</span>
                        <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{nomination._count.votes}</span>
                      </div>
                      <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((nomination._count.votes / 150) * 100, 100)}%`,
                            backgroundColor: getBorderColor(nomination.id),
                          }}
                        />
                      </div>
                    </div>

                    {/* Vote button */}
                    <button
                      onClick={() => handleVote(nomination.id, nomination.word)}
                      disabled={userVotedFor !== null || hasVoted}
                      className={`w-full py-3 rounded-lg font-bold text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                        userVotedFor === nomination.id
                          ? 'hover:shadow-md active:scale-95'
                          : (userVotedFor !== null || hasVoted)
                          ? 'cursor-not-allowed'
                          : 'active:scale-95 hover:shadow-md'
                      }`}
                      style={{
                        background: userVotedFor === nomination.id
                          ? 'linear-gradient(135deg, var(--semantic-success) 0%, rgba(0, 214, 143, 0.7) 100%)'
                          : (userVotedFor !== null || hasVoted)
                          ? 'var(--text-muted)'
                          : 'linear-gradient(135deg, var(--brand-bright) 0%, var(--brand-dim) 100%)',
                      }}
                    >
                      {userVotedFor === nomination.id
                        ? 'Voted ✓'
                        : (userVotedFor !== null || hasVoted)
                        ? 'Vote'
                        : 'VOTE'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Top Voters */}
              <div className="rounded-xl shadow-md p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--brand-border)' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }} className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>🗳️</span>
                  Top Voters
                </h3>
                <div className="space-y-3">
                  {topVoters.map((voter, idx) => (
                    <div key={voter.username} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, var(--brand-bright) 0%, var(--brand-dim) 100%)' }}>
                          {idx + 1}
                        </div>
                        <span className="text-sm font-medium flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>
                          {voter.username}
                        </span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: 'var(--brand-bright)' }}>{voter.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Submitters */}
              <div className="rounded-xl shadow-md p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--brand-border)' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }} className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>⭐</span>
                  Top Submitters
                </h3>
                <div className="space-y-3">
                  {topSubmitters.map((submitter, idx) => (
                    <div key={submitter.username} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, var(--semantic-warning) 0%, rgba(245, 166, 35, 0.7) 100%)' }}>
                          {idx + 1}
                        </div>
                        <span className="text-sm font-medium flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>
                          {submitter.username}
                        </span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: 'var(--semantic-warning)' }}>{submitter.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info card */}
              <div className="rounded-xl p-4 border-l-4" style={{ backgroundColor: 'rgba(124, 109, 250, 0.08)', borderColor: 'var(--brand-bright)' }}>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <strong>💡 Winning word submitter gets 500 XP bonus!</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit nomination modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[4000] p-4 backdrop-blur-sm">
          <div className="rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slide-in" style={{ backgroundColor: 'var(--bg-card)', border: '2px solid var(--brand-border)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }} className="text-2xl font-bold">Nominate a Word</h2>
              <button
                onClick={() => setShowSubmitForm(false)}
                className="p-1 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <X size={24} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Word input */}
              <div>
                <label style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }} className="block text-sm font-semibold mb-2">
                  Word *
                </label>
                <input
                  type="text"
                  value={formData.word}
                  onChange={e => setFormData({ ...formData, word: e.target.value })}
                  placeholder="Enter a word..."
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--brand-border)',
                    color: 'var(--text-primary)',
                    border: '1px solid',
                    '--tw-ring-color': 'var(--brand-bright)'
                  } as any}
                />
              </div>

              {/* Definition input */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Definition *
                </label>
                <textarea
                  value={formData.definition}
                  onChange={e => setFormData({ ...formData, definition: e.target.value })}
                  placeholder="What does this word mean?"
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 resize-none h-24 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    border: '1px solid',
                    '--tw-ring-color': 'var(--accent)'
                  } as any}
                />
              </div>

              {/* Why this word input */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Why this word? (Optional)
                </label>
                <textarea
                  value={formData.why}
                  onChange={e => setFormData({ ...formData, why: e.target.value })}
                  placeholder="Tell us why you love this word..."
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 resize-none h-20 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    border: '1px solid',
                    '--tw-ring-color': 'var(--accent)'
                  } as any}
                />
              </div>

              {/* Notification */}
              <div className="border-l-4 p-3 rounded" style={{ backgroundColor: 'rgba(245, 166, 35, 0.1)', borderColor: 'var(--semantic-warning)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <strong>🎯 If your word wins, you get 500 XP!</strong>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSubmitForm(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 rounded-lg hover:opacity-80 transition-opacity font-semibold disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--brand-border)'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitNomination}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold flex items-center justify-center gap-2 disabled:opacity-75"
                  style={{ background: 'linear-gradient(135deg, var(--brand-bright) 0%, var(--brand-dim) 100%)' }}
                >
                  {isSubmitting ? (
                    <div className="animate-spin w-5 h-5 border-2 border-t-transparent rounded-full" style={{ borderColor: 'white', borderTopColor: 'transparent' }}></div>
                  ) : (
                    <Send size={18} />
                  )}
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
