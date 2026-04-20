'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function SignIn() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Email/Password form state
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (err) {
      setError('Failed to sign in with Google')
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!form.email.trim()) errors.email = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email address'
    if (!form.password) errors.password = 'Password is required'

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (!validateForm()) return

    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md rounded-2xl p-8 animate-fade-up" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(124, 109, 250, 0.1)' }}>

        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--brand-bright), var(--brand-dim))' }}>
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="font-bold text-xl" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>VocabRise</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Welcome back</h1>
        <p className="text-center mb-8" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>Sign in to continue learning</p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(255, 77, 109, 0.1)', borderLeft: '4px solid var(--semantic-danger)', color: 'var(--semantic-danger)', fontFamily: 'var(--font-body)' }}>
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-white hover:shadow-lg active:scale-95"
          style={{ background: 'linear-gradient(135deg, var(--brand-bright), var(--brand-dim))', boxShadow: '0 4px 12px rgba(124, 109, 250, 0.3)' }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white"/>
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }}></div>
          <span className="text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }}></div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full rounded-lg px-4 py-3 transition-all focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--text-primary)',
                borderColor: fieldErrors.email ? 'var(--semantic-danger)' : 'var(--border)',
                border: '1px solid',
                fontFamily: 'var(--font-body)',
                '--tw-ring-color': fieldErrors.email ? 'rgba(255, 77, 109, 0.2)' : 'rgba(124, 109, 250, 0.2)'
              } as any}
            />
            {fieldErrors.email && <p className="text-xs mt-1" style={{ color: 'var(--semantic-danger)', fontFamily: 'var(--font-body)' }}>{fieldErrors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>Password</label>
              <Link href="#" className="text-xs hover:opacity-80 transition-opacity" style={{ color: 'var(--brand-bright)', fontFamily: 'var(--font-body)' }}>
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full rounded-lg px-4 py-3 pr-10 transition-all focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text-primary)',
                  borderColor: fieldErrors.password ? 'var(--semantic-danger)' : 'var(--border)',
                  border: '1px solid',
                  fontFamily: 'var(--font-body)',
                  '--tw-ring-color': fieldErrors.password ? 'rgba(255, 77, 109, 0.2)' : 'rgba(124, 109, 250, 0.2)'
                } as any}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 transition-colors hover:opacity-80"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-xs mt-1" style={{ color: 'var(--semantic-danger)', fontFamily: 'var(--font-body)' }}>{fieldErrors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6 hover:shadow-lg active:scale-95"
            style={{ background: 'linear-gradient(135deg, var(--brand-bright), var(--brand-dim))', fontFamily: 'var(--font-body)', boxShadow: '0 4px 12px rgba(124, 109, 250, 0.3)' }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center mt-6" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
          Don't have an account?{' '}
          <Link href="/auth/signup" className="font-medium transition-all hover:opacity-80" style={{ color: 'var(--brand-bright)' }}>
            Sign up
          </Link>
        </p>

      </div>
    </div>
  )
}