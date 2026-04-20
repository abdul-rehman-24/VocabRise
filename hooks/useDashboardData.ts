'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'

interface DashboardData {
  displayName: string | null
  currentStreak: number
  todayDate: string
  dailyGoalCount: number
  dailyGoalTarget: number
  streakValue: number
  xpValue: number
  wordsLearnedValue: number
  levelValue: number
  wordTitle: string | null
  wordDefinition: string | null
  wordUrdu: string | null
  wordExample: string | null
  wordDifficulty: string | null
  isWordSaved: boolean
  onlineCount: number
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboardData(): DashboardData {
  const { data: session, status } = useSession()
  const [data, setData] = useState<Omit<DashboardData, 'refetch'>>({
    displayName: 'Loading...',
    currentStreak: 0,
    todayDate: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    dailyGoalCount: 0,
    dailyGoalTarget: 5,
    streakValue: 0,
    xpValue: 0,
    wordsLearnedValue: 0,
    levelValue: 1,
    wordTitle: 'Loading word of the day...',
    wordDefinition: '',
    wordUrdu: null,
    wordExample: null,
    wordDifficulty: null,
    isWordSaved: false,
    onlineCount: 0,
    isLoading: true,
    error: null
  })

  const isMounted = useRef(true)
  const hasInitialized = useRef(false)
  const isFetching = useRef(false)

  // Fetch function - NOT in useCallback to avoid dependency issues
  const fetchData = async () => {
    // Prevent concurrent fetches
    if (isFetching.current) {
      return
    }

    if (status !== 'authenticated' || !session?.user?.id) {
      if (isMounted.current) {
        setData(prev => ({ ...prev, isLoading: false }))
      }
      return
    }

    isFetching.current = true

    try {
      if (isMounted.current) {
        setData(prev => ({ ...prev, isLoading: true, error: null }))
      }

      // Fetch each API separately to identify which one fails
      let statsRes, wordRes, onlineRes

      try {
        statsRes = await fetch('/api/dashboard/stats')
      } catch (e) {
        console.error('Stats fetch error:', e)
        throw new Error('Stats API fetch failed')
      }

      try {
        wordRes = await fetch('/api/dashboard/word-of-day')
      } catch (e) {
        console.error('Word fetch error:', e)
        throw new Error('Word API fetch failed')
      }

      try {
        onlineRes = await fetch('/api/dashboard/online-count')
      } catch (e) {
        console.error('Online fetch error:', e)
        // Don't throw - online count is optional
        onlineRes = { ok: false }
      }

      if (!isMounted.current) {
        isFetching.current = false
        return
      }

      // Check stats response
      if (!statsRes.ok) {
        const statusText = await statsRes.text()
        console.error('Stats API error:', statsRes.status, statusText)
        throw new Error(`Stats API error: ${statsRes.status}`)
      }

      // Check word response
      if (!wordRes.ok) {
        const statusText = await wordRes.text()
        console.error('Word API error:', wordRes.status, statusText)
        throw new Error(`Word API error: ${wordRes.status}`)
      }

      // Parse responses
      let stats, word, online

      try {
        stats = await statsRes.json()
      } catch (e) {
        console.error('Stats parse error:', e)
        throw new Error('Failed to parse stats response')
      }

      try {
        word = await wordRes.json()
      } catch (e) {
        console.error('Word parse error:', e)
        throw new Error('Failed to parse word response')
      }

      try {
        online = onlineRes.ok ? await onlineRes.json() : { count: 0 }
      } catch (e) {
        console.error('Online parse error:', e)
        online = { count: 0 }
      }

      if (!isMounted.current) {
        isFetching.current = false
        return
      }

      setData({
        displayName: stats.displayName || 'User',
        currentStreak: stats.streak || 0,
        todayDate: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
        dailyGoalCount: stats.dailyGoalCount || 0,
        dailyGoalTarget: stats.dailyGoalTarget || 5,
        streakValue: stats.streak || 0,
        xpValue: stats.xp || 0,
        wordsLearnedValue: stats.wordsLearned || 0,
        levelValue: stats.level || 1,
        wordTitle: word.word || 'No word available',
        wordDefinition: word.definition || '',
        wordUrdu: word.urduMeaning || '',
        wordExample: word.example || '',
        wordDifficulty: word.difficulty || 'INTERMEDIATE',
        isWordSaved: word.isSaved || false,
        onlineCount: online.count || 0,
        isLoading: false,
        error: null
      })
    } catch (error) {
      if (!isMounted.current) {
        isFetching.current = false
        return
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to load data'
      console.error('Dashboard error:', errorMessage)

      setData(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
    } finally {
      isFetching.current = false
    }
  }

  // Single effect - only runs once on mount when status changes
  useEffect(() => {
    isMounted.current = true

    if (status === 'authenticated' && !hasInitialized.current) {
      hasInitialized.current = true
      fetchData()
    }

    return () => {
      isMounted.current = false
    }
  }, [status]) // ONLY depends on status

  return {
    ...data,
    refetch: fetchData
  }
}
