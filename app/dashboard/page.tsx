'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Shield, CheckCircle2, Sparkles, Star, Building2, MapPin, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function DashboardPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Signed in successfully!')
      router.push('/dashboard/overview')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Failed to sign in')
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
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
      setError(error.message || 'Failed to sign in with Google')
      toast.error(error.message || 'Failed to sign in with Google')
      setLoading(false)
    }
  }

  const stats = [
    { icon: Building2, value: '500+', label: 'Properties' },
    { icon: Users, value: '2k+', label: 'Users' },
    { icon: MapPin, value: '50+', label: 'Areas' },
  ]

  const testimonials = [
    {
      quote: "Found my apartment in Borrowdale within a week. The process was incredibly smooth!",
      name: "Tendai M.",
      role: "Renter in Harare",
      initials: "TM"
    },
    {
      quote: "As a landlord, Huts made it so easy to find quality tenants. Highly recommend!",
      name: "Sarah K.",
      role: "Property Owner",
      initials: "SK"
    }
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-white">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] bg-[#212529] relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-white/5 via-transparent to-white/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }} />
        
        {/* Floating decorative elements */}
        <div className="absolute top-32 right-32 w-20 h-20 border border-white/10 rounded-2xl rotate-12" />
        <div className="absolute bottom-40 right-48 w-12 h-12 border border-white/10 rounded-xl -rotate-12" />
        <div className="absolute top-1/3 left-16 w-8 h-8 bg-white/5 rounded-lg rotate-45" />
        
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                <Image
                  src="/logo.png"
                  alt="Huts"
                  width={56}
                  height={56}
                  className="relative w-14 h-14 object-contain"
                />
              </div>
              <div>
                <span className="text-2xl font-bold text-white tracking-tight">Huts</span>
                <p className="text-xs text-white/50 font-medium">Find your home</p>
              </div>
            </Link>
            
            {/* Stats */}
            <div className="hidden xl:flex items-center gap-6">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-white font-bold text-lg">
                    <Icon size={16} className="text-white/60" />
                    {value}
                  </div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Main content */}
          <div className="my-auto max-w-lg">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 mb-8">
              <Sparkles size={14} className="text-yellow-400" />
              <span className="text-sm text-white/80 font-medium">Trusted by 2,000+ users in Zimbabwe</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              Find your next home,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/60 to-white/40">
                hassle-free.
              </span>
            </h1>
            <p className="text-lg xl:text-xl text-white/60 leading-relaxed max-w-md">
              Join thousands of renters and landlords using Huts to find and list properties across Zimbabwe.
            </p>
            
            {/* Features */}
            <div className="mt-10 space-y-4">
              {[
                { text: 'Browse verified listings', highlight: true },
                { text: 'Connect directly with landlords', highlight: false },
                { text: 'Save and compare properties', highlight: false },
              ].map(({ text, highlight }) => (
                <div key={text} className={`flex items-center gap-3 ${highlight ? 'text-white' : 'text-white/70'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${highlight ? 'bg-[#212529]' : 'bg-white/10'}`}>
                    <CheckCircle2 size={16} className={highlight ? 'text-white' : 'text-[#212529]'} />
                  </div>
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Testimonial Carousel */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 relative overflow-hidden group hover:border-white/20 transition-colors">
              {/* Quote mark */}
              <div className="absolute top-4 right-4 text-6xl text-white/5 font-serif leading-none">"</div>
              
              <div className="flex items-start gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-white/90 text-lg leading-relaxed mb-5 relative z-10">
                "{testimonials[0].quote}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/20">
                  {testimonials[0].initials}
                </div>
                <div>
                  <p className="text-white font-semibold">{testimonials[0].name}</p>
                  <p className="text-white/50 text-sm">{testimonials[0].role}</p>
                </div>
              </div>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-white/40 text-xs">
                <Shield size={14} className="text-[#212529]" />
                <span>Verified Reviews</span>
              </div>
              <div className="flex -space-x-2">
                {['TM', 'SK', 'JN', 'LM'].map((initials, i) => (
                  <div
                    key={initials}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-[#212529]"
                    style={{ zIndex: 4 - i }}
                  >
                    {initials}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-xs font-semibold ring-2 ring-[#212529]">
                  +99
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Sign in form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-white to-[#F8F9FA]">
        <div className="max-w-[400px] w-full">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Huts"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
              <div>
                <span className="text-2xl font-bold text-[#212529]">Huts</span>
                <p className="text-xs text-[#ADB5BD]">Find your home</p>
              </div>
            </Link>
          </div>
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#212529]/10 text-[#212529] rounded-full px-3 py-1 text-xs font-semibold mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#212529] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#212529]" />
              </span>
              Secure login
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#212529] mb-2 tracking-tight">Welcome back</h1>
            <p className="text-[#495057]">Enter your credentials to access your account</p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E9ECEF] p-8 shadow-2xl shadow-black/5 relative overflow-hidden">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#F8F9FA] to-transparent rounded-bl-[100px]" />
            
            {error && (
              <div className="relative mb-6 p-4 bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-2xl flex items-start gap-3 animate-shake">
                <div className="w-8 h-8 rounded-full bg-[#FF6B6B]/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={16} className="text-[#FF6B6B]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#212529]">Sign in failed</p>
                  <p className="text-xs text-[#495057] mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-5 relative">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#212529] mb-2">
                  Email address
                </label>
                <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedField === 'email' ? 'text-[#212529]' : 'text-[#ADB5BD]'}`}>
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-12 pr-4 py-4 border-2 border-[#E9ECEF] rounded-2xl text-[#212529] placeholder-[#ADB5BD] focus:outline-none focus:border-[#212529] focus:shadow-lg focus:shadow-[#212529]/5 transition-all bg-[#F8F9FA] focus:bg-white"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[#212529] mb-2">
                  Password
                </label>
                <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedField === 'password' ? 'text-[#212529]' : 'text-[#ADB5BD]'}`}>
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-12 pr-14 py-4 border-2 border-[#E9ECEF] rounded-2xl text-[#212529] placeholder-[#ADB5BD] focus:outline-none focus:border-[#212529] focus:shadow-lg focus:shadow-[#212529]/5 transition-all bg-[#F8F9FA] focus:bg-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#ADB5BD] hover:text-[#212529] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-[#E9ECEF] peer-checked:border-[#212529] peer-checked:bg-[#212529] transition-all flex items-center justify-center">
                      <CheckCircle2 size={12} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <span className="text-sm text-[#495057] group-hover:text-[#212529] transition-colors">Remember me</span>
                </label>
                <Link href="/auth/reset-password" className="text-sm font-semibold text-[#212529] hover:underline underline-offset-2 hover:text-black transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full flex items-center justify-center gap-2 bg-[#212529] text-white py-4 px-4 rounded-2xl font-semibold text-base hover:bg-black hover:-translate-y-1 transition-all shadow-xl shadow-[#212529]/30 hover:shadow-2xl hover:shadow-[#212529]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-xl overflow-hidden group"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                {loading ? (
                  <div className="flex items-center gap-2 relative">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <>
                    <span className="relative">Sign in</span>
                    <ArrowRight size={18} className="relative group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-[#E9ECEF]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[#ADB5BD] font-medium">or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="group w-full flex items-center justify-center gap-3 bg-white border-2 border-[#E9ECEF] text-[#212529] py-4 px-4 rounded-2xl font-semibold hover:border-[#212529] hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-6 h-6 relative group-hover:scale-110 transition-transform">
                <svg className="w-full h-full" viewBox="0 0 24 24">
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
              </div>
              Continue with Google
            </button>
          </div>
          
          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-[#495057]">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="font-bold text-[#212529] hover:underline underline-offset-2 inline-flex items-center gap-1 group">
                Create one now
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>
          
          {/* Security note */}
          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-[#ADB5BD]">
            <div className="flex items-center gap-1.5">
              <Shield size={14} className="text-[#212529]" />
              <span>256-bit SSL</span>
            </div>
            <span className="text-[#E9ECEF]">•</span>
            <span>GDPR Compliant</span>
            <span className="text-[#E9ECEF]">•</span>
            <span>Secure by default</span>
          </div>
        </div>
      </div>
    </div>
  )
}
