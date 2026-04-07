'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Search, Building2, Check, Home, Lock, Mail, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

function SignUpPageInner() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'renter' | 'landlord'>('renter')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
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
        router.push(next)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Welcome back!')
        router.push(next)
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
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
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
    <div className="min-h-screen flex">
      {/* Left Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12 bg-white">
        <div className="w-full max-w-[440px] mx-auto">
          {/* Logo */}
          <Link href="/" className="inline-block mb-10">
            <img src="/logo.svg" alt="Huts" width={48} height={48} className="h-12 w-12 object-contain" />
          </Link>

          {/* Title */}
          <h1 className="text-2xl font-bold text-[#212529] mb-1">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-[#495057] mb-8">
            {mode === 'signin'
              ? 'Sign in to continue to your dashboard.'
              : 'Join to start your property journey.'}
          </p>

          {/* Tabs */}
          <div className="flex border-b border-[#E9ECEF] mb-6">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError('') }}
              className={`flex-1 pb-3 text-sm font-semibold text-center transition-colors relative ${
                mode === 'signin'
                  ? 'text-[#212529] after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-[#212529]'
                  : 'text-[#495057] hover:text-[#212529]'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError('') }}
              className={`flex-1 pb-3 text-sm font-semibold text-center transition-colors relative ${
                mode === 'signup'
                  ? 'text-[#212529] after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-[#212529]'
                  : 'text-[#495057] hover:text-[#212529]'
              }`}
            >
              New account
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-[#FF6B6B] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Google Auth */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-[#E9ECEF] text-[#212529] py-2.5 rounded-lg text-sm font-semibold hover:bg-[#F8F9FA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="w-full border-t border-[#E9ECEF]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-[#ADB5BD]">or</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-[#212529] mb-1">
                  Full name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD]" />
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#E9ECEF] rounded-lg text-sm text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#212529] focus:ring-1 focus:ring-[#212529] outline-none transition-colors"
                    placeholder="First Last"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#212529] mb-1">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD]" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#E9ECEF] rounded-lg text-sm text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#212529] focus:ring-1 focus:ring-[#212529] outline-none transition-colors"
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-[#212529] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD]" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#E9ECEF] rounded-lg text-sm text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#212529] focus:ring-1 focus:ring-[#212529] outline-none transition-colors"
                  placeholder={mode === 'signup' ? 'Create password (min 6 chars)' : 'Enter password'}
                  minLength={6}
                />
              </div>
            </div>

            {/* Role Selection (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[#212529] mb-2">
                  I want to
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('renter')}
                    className={`relative flex items-center gap-3 p-3 border rounded-lg transition-all text-left ${
                      role === 'renter'
                        ? 'border-[#212529] bg-[#F8F9FA] ring-1 ring-[#212529]'
                        : 'border-[#E9ECEF] hover:border-[#ADB5BD]'
                    }`}
                  >
                    {role === 'renter' && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-[#212529] rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                    <Search size={18} className="text-[#212529] shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[#212529]">Find a home</p>
                      <p className="text-xs text-[#495057] mt-0.5">Search rentals & sales</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('landlord')}
                    className={`relative flex items-center gap-3 p-3 border rounded-lg transition-all text-left ${
                      role === 'landlord'
                        ? 'border-[#212529] bg-[#F8F9FA] ring-1 ring-[#212529]'
                        : 'border-[#E9ECEF] hover:border-[#ADB5BD]'
                    }`}
                  >
                    {role === 'landlord' && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-[#212529] rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                    <Building2 size={18} className="text-[#212529] shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[#212529]">List property</p>
                      <p className="text-xs text-[#495057] mt-0.5">Rent or sell your space</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#212529] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                : (mode === 'signin' ? 'Sign in' : 'Create account')}
            </button>
          </form>

          {/* Terms */}
          <p className="text-[10px] text-[#ADB5BD] text-center mt-5 leading-relaxed">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-[#212529] underline hover:text-black">Terms of Use</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[#212529] underline hover:text-black">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* Right Image Panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-[#212529]">
        <Image
          src="/pexels-curtis-adams-1694007-4832510.jpg"
          alt="Property exterior"
          fill
          className="object-cover w-full h-full contrast-105 opacity-70 select-none pointer-events-none"
          priority
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-black/15 mix-blend-multiply pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/5" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full border border-white/5" />
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SignUpPageInner />
    </Suspense>
  )
}