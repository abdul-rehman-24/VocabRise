'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function SignUp() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Email/Password form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleGoogleSignUp = async () => {
    setLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (err) {
      setError('Failed to sign up with Google')
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!form.name.trim()) errors.name = 'Full name is required'
    if (!form.email.trim()) errors.email = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email address'
    if (form.password.length < 8) errors.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match'

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (!validateForm()) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          setError('An account with this email already exists')
        } else {
          setError(data.error || 'Failed to create account')
        }
        setLoading(false)
        return
      }

      // Sign in with credentials
      const signInResult = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (signInResult?.ok) {
        router.push('/dashboard')
      } else {
        setError('Account created, but failed to sign in')
        setLoading(false)
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
        <Link href="/" className="flex items-center justify-center mb-8 group hover:opacity-90 transition-opacity cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <div className="absolute inset-0 bg-[var(--gradient-primary)] rounded-xl blur-[10px] opacity-50 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              <div className="relative w-full h-full rounded-xl bg-[rgba(18,18,31,0.7)] border border-[rgba(124,109,250,0.4)] backdrop-blur-md flex items-center justify-center overflow-hidden shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]">
                <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[var(--brand-bright)] to-transparent opacity-80"></div>
                <div className="absolute bottom-0 right-0 w-[1.5px] h-full bg-gradient-to-b from-transparent via-[#e040fb] to-transparent opacity-60"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--brand)] via-transparent to-transparent opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                <span className="relative z-10 font-heading font-black text-[22px] tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-[var(--brand-bright)] drop-shadow-[0_2px_10px_rgba(124,109,250,0.8)]">VR</span>
              </div>
            </div>
            <span style={{ 
              fontFamily: 'var(--font-heading)', 
              fontWeight: 800, 
              fontSize: '28px',
              background: `linear-gradient(135deg, var(--text-primary), var(--brand-bright))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.5px'
            }}>
              VocabRise
            </span>
          </div>
        </Link>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Create your account</h1>
        <p className="text-center mb-8" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>Start your vocabulary journey</p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(255, 77, 109, 0.1)', borderLeft: '4px solid var(--semantic-danger)', color: 'var(--semantic-danger)', fontFamily: 'var(--font-body)' }}>
            {error}
          </div>
        )}

        {/* Google Sign Up Button */}
        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-white hover:shadow-lg active:scale-95"
          style={{ background: 'var(--gradient-primary)', boxShadow: '0 4px 12px rgba(124, 109, 250, 0.3)' }}
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
          <span>Sign up with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }}></div>
          <span className="text-sm font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }}></div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSignUp} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
              className="w-full rounded-lg px-4 py-3 transition-all focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--text-primary)',
                borderColor: fieldErrors.name ? 'var(--semantic-danger)' : 'var(--border)',
                border: '1px solid',
                fontFamily: 'var(--font-body)',
                '--tw-ring-color': fieldErrors.name ? 'rgba(255, 77, 109, 0.2)' : 'rgba(124, 109, 250, 0.2)'
              } as any}
            />
            {fieldErrors.name && <p className="text-xs mt-1" style={{ color: 'var(--semantic-danger)', fontFamily: 'var(--font-body)' }}>{fieldErrors.name}</p>}
          </div>

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
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 8 characters"
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

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                className="w-full rounded-lg px-4 py-3 pr-10 transition-all focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text-primary)',
                  borderColor: fieldErrors.confirmPassword ? 'var(--semantic-danger)' : 'var(--border)',
                  border: '1px solid',
                  fontFamily: 'var(--font-body)',
                  '--tw-ring-color': fieldErrors.confirmPassword ? 'rgba(255, 77, 109, 0.2)' : 'rgba(124, 109, 250, 0.2)'
                } as any}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 transition-colors hover:opacity-80"
                style={{ color: 'var(--text-muted)' }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs mt-1" style={{ color: 'var(--semantic-danger)', fontFamily: 'var(--font-body)' }}>{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6 hover:shadow-lg active:scale-95"
            style={{ background: 'var(--gradient-primary)', fontFamily: 'var(--font-body)', boxShadow: '0 4px 12px rgba(124, 109, 250, 0.3)' }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <p className="text-center mt-6" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
          Already have an account?{' '}
          <Link
            href="/auth/signin"
            className="font-medium transition-all hover:opacity-80"
            style={{ color: 'var(--brand-bright)' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
