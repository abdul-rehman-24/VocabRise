'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUp() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignUp = async () => {
    setLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (err) {
      setError('Failed to sign up with Google')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-white font-bold text-xl">VocabRise</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-white text-center mb-2">Create your account</h1>
        <p className="text-zinc-400 text-center mb-8">Start your vocabulary journey</p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Google Sign Up Button */}
        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full bg-white text-gray-900 font-medium py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
          ) : (
            <span className="text-lg font-bold">G</span>
          )}
          Sign up with Google
        </button>

        {/* Sign In Link */}
        <p className="text-center text-zinc-400">
          Already have an account?{' '}
          <Link
            href="/auth/signin"
            className="text-indigo-500 hover:text-indigo-400 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
