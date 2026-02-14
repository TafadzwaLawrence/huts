'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react'
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
        // Don't block signup if email fails
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA]">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#212529] mb-2">Create account</h1>
          <p className="text-[#495057]">Join Huts and find your perfect home</p>
        </div>

        <div className="bg-white rounded-lg border-2 border-[#E9ECEF] p-8 shadow-sm">
          {error && (
            <div className="mb-6 p-4 bg-[#FF6B6B]/10 border border-[#FF6B6B] rounded-md flex items-start gap-3">
              <AlertCircle size={20} className="text-[#FF6B6B] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#212529]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#212529] mb-2">
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-[#ADB5BD]" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] placeholder-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#212529] mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-[#ADB5BD]" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] placeholder-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#212529] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[#ADB5BD]" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] placeholder-[#ADB5BD] focus:outline-none focus:border-[#212529] transition-colors"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              <p className="mt-1 text-xs text-[#ADB5BD]">Minimum 6 characters</p>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-[#212529] mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('renter')}
                  className={`p-4 border-2 rounded-md transition-all ${
                    role === 'renter'
                      ? 'border-[#212529] bg-[#212529] text-white'
                      : 'border-[#E9ECEF] hover:border-[#212529]'
                  }`}
                >
                  <p className="font-medium">Renter</p>
                  <p className={`text-xs mt-1 ${role === 'renter' ? 'opacity-75' : 'text-[#ADB5BD]'}`}>
                    Looking for a home
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('landlord')}
                  className={`p-4 border-2 rounded-md transition-all ${
                    role === 'landlord'
                      ? 'border-[#212529] bg-[#212529] text-white'
                      : 'border-[#E9ECEF] hover:border-[#212529]'
                  }`}
                >
                  <p className="font-medium">Landlord</p>
                  <p className={`text-xs mt-1 ${role === 'landlord' ? 'opacity-75' : 'text-[#ADB5BD]'}`}>
                    Listing properties
                  </p>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#212529] text-white py-3 px-4 rounded-md font-medium hover:bg-black hover:-translate-y-0.5 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? 'Creating account...' : 'Create account'}
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E9ECEF]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#ADB5BD]">Or continue with</span>
            </div>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[#E9ECEF] text-[#212529] py-3 px-4 rounded-md font-medium hover:border-[#212529] hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Sign In Link */}
          <div className="mt-6 pt-6 border-t border-[#E9ECEF] text-center">
            <p className="text-sm text-[#495057]">
              Already have an account?{' '}
              <Link href="/dashboard" className="font-medium text-[#212529] hover:underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
