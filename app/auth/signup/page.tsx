'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AlertCircle, Search, Building2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function SignUpPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'renter' | 'landlord'>('renter')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, role } },
        })
        if (error) throw error

        try {
          await fetch('/api/emails/welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, role }),
          })
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError)
        }

        toast.success('Account created! Check your email to verify.')
        router.push('/dashboard')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Welcome back!')
        router.push('/dashboard')
      }
    } catch (error: any) {
      setError(error.message || 'Something went wrong')
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })
      if (error) throw error
    } catch (error: any) {
      setError(error.message || 'Failed to continue with Google')
      toast.error(error.message || 'Failed to continue with Google')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7] px-4 py-12">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/">
            <Image src="/logo.png" alt="Huts" width={48} height={48} priority />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.12)] p-8">
          {/* Title */}
          <h1 className="text-2xl font-bold text-[#212529] text-center mb-1">
            {mode === 'signin' ? 'Welcome to Huts' : 'Create your account'}
          </h1>
          <p className="text-sm text-[#767676] text-center mb-6">
            {mode === 'signin'
              ? 'Sign in to save homes, track your search, and more.'
              : 'Join to start your property journey.'}
          </p>

          {/* Tabs */}
          <div className="flex border-b border-[#e5e5e5] mb-6">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError('') }}
              className={`flex-1 pb-3 text-sm font-bold text-center transition-colors relative ${
                mode === 'signin'
                  ? 'text-[#212529] after:absolute after:bottom-0 after:inset-x-0 after:h-[3px] after:bg-[#212529] after:rounded-t'
                  : 'text-[#767676] hover:text-[#212529]'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError('') }}
              className={`flex-1 pb-3 text-sm font-bold text-center transition-colors relative ${
                mode === 'signup'
                  ? 'text-[#212529] after:absolute after:bottom-0 after:inset-x-0 after:h-[3px] after:bg-[#212529] after:rounded-t'
                  : 'text-[#767676] hover:text-[#212529]'
              }`}
            >
              New account
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-[#fef2f2] border border-[#fecaca] rounded-md flex items-start gap-2">
              <AlertCircle size={16} className="text-[#dc2626] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#991b1b]">{error}</p>
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-[#d1d1d1] text-[#212529] py-3 px-4 rounded-md text-sm font-semibold hover:bg-[#f7f7f7] hover:border-[#999] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e5e5]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-[#767676] text-xs">or</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-[#212529] mb-1">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-[#d1d1d1] rounded-md text-sm text-[#212529] placeholder-[#999] focus:outline-none focus:border-[#212529] focus:ring-1 focus:ring-[#212529] transition-colors"
                  placeholder="First Last"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#212529] mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2.5 border border-[#d1d1d1] rounded-md text-sm text-[#212529] placeholder-[#999] focus:outline-none focus:border-[#212529] focus:ring-1 focus:ring-[#212529] transition-colors"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#212529] mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2.5 border border-[#d1d1d1] rounded-md text-sm text-[#212529] placeholder-[#999] focus:outline-none focus:border-[#212529] focus:ring-1 focus:ring-[#212529] transition-colors"
                placeholder={mode === 'signup' ? 'Create password' : 'Enter password'}
                minLength={6}
              />
            </div>

            {/* Role — sign up only */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-[#212529] mb-2">
                  I want to
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('renter')}
                    className={`relative flex items-center gap-2.5 p-3 border rounded-md transition-all text-left ${
                      role === 'renter'
                        ? 'border-[#212529] bg-[#f7f7f7] ring-1 ring-[#212529]'
                        : 'border-[#d1d1d1] hover:border-[#999]'
                    }`}
                  >
                    {role === 'renter' && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-[#212529] rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                    <Search size={16} className="text-[#212529] shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-[#212529]">Find a home</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('landlord')}
                    className={`relative flex items-center gap-2.5 p-3 border rounded-md transition-all text-left ${
                      role === 'landlord'
                        ? 'border-[#212529] bg-[#f7f7f7] ring-1 ring-[#212529]'
                        : 'border-[#d1d1d1] hover:border-[#999]'
                    }`}
                  >
                    {role === 'landlord' && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-[#212529] rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                    <Building2 size={16} className="text-[#212529] shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-[#212529]">List property</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#006AFF] text-white py-3 px-4 rounded-md text-sm font-bold hover:bg-[#0059d6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                : (mode === 'signin' ? 'Sign in' : 'Create account')}
            </button>
          </form>

          {/* Terms */}
          <p className="text-[11px] text-[#767676] text-center mt-4 leading-relaxed">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-[#006AFF] hover:underline">Terms of Use</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[#006AFF] hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
