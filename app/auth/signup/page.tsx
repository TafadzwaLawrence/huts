'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, ArrowRight, AlertCircle, Home, Key, Search, Building2, Shield, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'renter' | 'landlord'>('renter')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      })

      if (error) throw error

      // Send welcome email
      try {
        await fetch('/api/emails/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, role }),
        })
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
      }

      toast.success('Account created! Please check your email to verify.')
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Failed to create account')
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
    } catch (error: any) {
      setError(error.message || 'Failed to sign up with Google')
      toast.error(error.message || 'Failed to sign up with Google')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-white">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-muted relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        {/* Gradient orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="relative flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Huts" width={36} height={36} className="invert" />
          </Link>

          {/* Main content */}
          <div>
            <h2 className="text-4xl font-bold text-white tracking-tight mb-4 leading-tight">
              Find your place,<br />
              your way.
            </h2>
            <p className="text-white/50 text-lg mb-12 max-w-sm">
              Whether you&apos;re looking for a home or listing one, Huts makes it simple.
            </p>

            {/* Feature list */}
            <div className="space-y-5">
              {[
                { icon: Search, text: 'Search properties across Zimbabwe' },
                { icon: Shield, text: '100% verified listings' },
                { icon: Key, text: 'Direct messaging with landlords' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-white" />
                  </div>
                  <span className="text-white/70 text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <p className="text-white/30 text-xs">
            &copy; {new Date().getFullYear()} Huts. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/">
              <Image src="/logo.png" alt="Huts" width={40} height={40} />
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Create your account</h1>
            <p className="text-sm text-foreground mt-1">Start your property journey today</p>
          </div>

          {/* Google Sign Up - First */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-border text-foreground py-3 px-4 rounded-xl text-sm font-semibold hover:border-border hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-foreground text-xs">or</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 bg-muted/5 border border-border/20 rounded-xl flex items-start gap-2.5">
              <AlertCircle size={16} className="text-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
                Full name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-3 border-2 border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-border transition-colors"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 border-2 border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-border transition-colors"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 border-2 border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-border transition-colors"
                placeholder="Min. 6 characters"
                minLength={6}
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('renter')}
                  className={`relative p-4 border-2 rounded-xl transition-all text-left ${
                    role === 'renter'
                      ? 'border-border bg-muted'
                      : 'border-border hover:border-border'
                  }`}
                >
                  {role === 'renter' && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <Check size={12} className="text-foreground" />
                    </div>
                  )}
                  <Search size={20} className={`mb-2 ${role === 'renter' ? 'text-white' : 'text-foreground'}`} />
                  <p className={`text-sm font-semibold ${role === 'renter' ? 'text-white' : 'text-foreground'}`}>Renter</p>
                  <p className={`text-xs mt-0.5 ${role === 'renter' ? 'text-white/60' : 'text-foreground'}`}>
                    Looking for a home
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('landlord')}
                  className={`relative p-4 border-2 rounded-xl transition-all text-left ${
                    role === 'landlord'
                      ? 'border-border bg-muted'
                      : 'border-border hover:border-border'
                  }`}
                >
                  {role === 'landlord' && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <Check size={12} className="text-foreground" />
                    </div>
                  )}
                  <Building2 size={20} className={`mb-2 ${role === 'landlord' ? 'text-white' : 'text-foreground'}`} />
                  <p className={`text-sm font-semibold ${role === 'landlord' ? 'text-white' : 'text-foreground'}`}>Landlord</p>
                  <p className={`text-xs mt-0.5 ${role === 'landlord' ? 'text-white/60' : 'text-foreground'}`}>
                    Listing properties
                  </p>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-muted text-white py-3 px-4 rounded-xl text-sm font-semibold hover:bg-black hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
            >
              {loading ? 'Creating account...' : 'Create account'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Terms */}
          <p className="text-[10px] text-foreground text-center mt-4 leading-relaxed">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-foreground hover:underline">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-foreground hover:underline">Privacy Policy</Link>
          </p>

          {/* Sign In Link */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-foreground">
              Already have an account?{' '}
              <Link href="/dashboard" className="font-semibold text-foreground hover:underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
