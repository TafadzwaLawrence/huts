'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { LeadMagnetButton } from '@/components/lead-magnets/LeadMagnetButton'
import { 
  CheckCircle, 
  Users, 
  Award, 
  TrendingUp, 
  Download, 
  FileText, 
  Star,
  ArrowRight,
  Shield,
  Clock,
  BarChart3,
  Home,
  DollarSign,
  MapPin
} from 'lucide-react'
import type { LeadMagnet } from '@/types/lead-magnets'

interface LeadMagnetLandingPageProps {
  slug: string
  heroImage?: string
  testimonials?: Array<{
    author: string
    role: string
    text: string
    rating?: number
    location?: string
  }>
  features?: string[]
  cta?: string
}

export function LeadMagnetLandingPage({
  slug,
  heroImage,
  testimonials,
  features,
  cta = 'Download Free Guide →',
}: LeadMagnetLandingPageProps) {
  const [leadMagnet, setLeadMagnet] = useState<LeadMagnet | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch lead magnet details
  useEffect(() => {
    const fetchLeadMagnet = async () => {
      try {
        const response = await fetch(`/api/lead-magnets/capture?slug=${slug}`)
        if (response.ok) {
          const data = await response.json()
          setLeadMagnet(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch lead magnet:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeadMagnet()
  }, [slug])

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-b from-white to-gray-50">
        {/* Hero Skeleton */}
        <section className="py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
              {/* Left: Content skeleton */}
              <div>
                <div className="mb-4 h-8 w-40 bg-gray-200 rounded-full animate-pulse" />
                <div className="mb-6 space-y-4">
                  <div className="h-14 w-full bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-14 w-5/6 bg-gray-200 rounded-lg animate-pulse" />
                </div>
                <div className="mb-8 space-y-3">
                  <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-5/6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-4/6 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="mb-8 space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse" />
                      <div className="h-5 flex-1 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
                <div className="h-14 w-48 bg-gray-200 rounded-lg animate-pulse" />
              </div>

              {/* Right: Image skeleton */}
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-200 animate-pulse shadow-xl" />
            </div>
          </div>
        </section>

        {/* Stats Skeleton */}
        <section className="border-t border-gray-100 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto mb-2 h-10 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="mx-auto h-5 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (!leadMagnet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="text-center px-4">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <FileText className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Guide Not Found
          </h1>
          <p className="text-gray-600">
            The guide you're looking for doesn't exist or has been moved.
          </p>
        </div>
      </div>
    )
  }

  // Default features if not provided
  const defaultFeatures = [
    "Step-by-step property buying guide for Zimbabwe",
    "Latest market trends and pricing insights",
    "Legal checklist and document templates",
    "Negotiation strategies that work",
    "Avoid common pitfalls and scams",
    "Exclusive access to off-market deals"
  ]

  const displayFeatures = features && features.length > 0 ? features : defaultFeatures

  // Default stats
  const stats = [
    { value: "15,000+", label: "Happy Homeowners", icon: Users },
    { value: "4.9/5", label: "User Rating", icon: Star },
    { value: "50+", label: "Pages of Expertise", icon: FileText }
  ]

  // Benefits data
  const benefits = [
    {
      icon: Award,
      title: "Expert Insights",
      description: "Curated from top real estate professionals with 20+ years of experience",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Legal Protection",
      description: "Ready-to-use legal templates and checklists for safe transactions",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: BarChart3,
      title: "Market Data",
      description: "Real statistics and pricing from Zimbabwe's top real estate markets",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Clock,
      title: "Time Saving",
      description: "Avoid months of research with our curated, actionable insights",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: DollarSign,
      title: "Money Saving",
      description: "Negotiation tactics that can save you thousands on your purchase",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: MapPin,
      title: "Local Expertise",
      description: "Zimbabwe-specific advice you won't find in generic guides",
      color: "from-indigo-500 to-blue-500"
    }
  ]

  return (
    <div className="w-full bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section - Modern Gradient Design */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-r from-blue-200 to-cyan-200 blur-3xl opacity-30" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 blur-3xl opacity-30" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: Content */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                <Download className="h-4 w-4" />
                Free Downloadable Guide
              </div>

              <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                {leadMagnet.title}
              </h1>

              <p className="mb-8 text-lg leading-relaxed text-gray-600 sm:text-xl">
                {leadMagnet.description}
              </p>

              {/* Features List - Enhanced */}
              <div className="mb-8 space-y-4">
                {displayFeatures.slice(0, 4).map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 transition-all group-hover:scale-110">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <p className="text-gray-700 group-hover:text-gray-900 transition-colors">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <LeadMagnetButton 
                  leadMagnet={leadMagnet} 
                  text={cta}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                />
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="h-4 w-4" />
                  Instant access • No spam • Unsubscribe anytime
                </p>
              </div>

              {/* Trust indicators */}
              <div className="mt-6 flex flex-wrap gap-4">
                {stats.slice(0, 2).map((stat, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
                    <stat.icon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-900">{stat.value}</span>
                    <span className="text-sm text-gray-600">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Hero Image */}
            {heroImage && (
              <div className="relative lg:ml-8">
                <div className="relative rounded-2xl shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-cyan-600/20 z-10 rounded-2xl" />
                  <Image
                    src={heroImage}
                    alt={leadMagnet.title}
                    width={600}
                    height={600}
                    className="h-auto w-full object-cover"
                    priority
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 rounded-xl bg-white p-3 shadow-lg md:-left-6 md:p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Trusted by 15,000+</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section - Modern Cards */}
      <section className="border-t border-gray-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={i} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white p-8 text-center shadow-sm transition-all hover:shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-cyan-600/0 opacity-0 transition-opacity group-hover:opacity-5" />
                  <div className="relative">
                    <div className="mb-4 inline-flex rounded-full bg-blue-100 p-3">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="mb-2 text-4xl font-extrabold text-gray-900">
                      {stat.value}
                    </div>
                    <p className="text-gray-600">{stat.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* What's Included - Enhanced Grid */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="mb-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive resources to guide you through every step of your property journey
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon
              return (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 transition-opacity group-hover:opacity-5`} />
                  <div className="relative">
                    <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${benefit.color} p-3 text-white shadow-lg`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-gray-900">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials - Modern Carousel Style */}
      {testimonials && testimonials.length > 0 && (
        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="mb-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                What Our Community Says
              </h2>
              <p className="text-lg text-gray-600">
                Join thousands of satisfied homeowners who transformed their property journey
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, i) => (
                <div
                  key={i}
                  className="group rounded-2xl bg-gradient-to-br from-gray-50 to-white p-6 shadow-sm transition-all hover:shadow-lg"
                >
                  {/* Rating */}
                  <div className="mb-4 flex gap-1">
                    {[...Array(testimonial.rating || 5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <p className="mb-4 text-gray-700 leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  
                  {/* Author */}
                  <div className="border-t border-gray-100 pt-4">
                    <p className="font-semibold text-gray-900">
                      {testimonial.author}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{testimonial.role}</span>
                      {testimonial.location && (
                        <>
                          <span>•</span>
                          <span>{testimonial.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA - Bold Gradient */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-10" />
        
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            Ready to Make Smart Real Estate Decisions?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-50 sm:text-xl">
            Get your free guide and join thousands of Zimbabweans who have already transformed their property journey.
          </p>
          
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <LeadMagnetButton
              leadMagnet={leadMagnet}
              text={cta}
              variant="secondary"
              className="group !bg-white text-blue-600 shadow-lg transition-all hover:shadow-xl hover:scale-105 !border-0"
            />
            <p className="flex items-center gap-2 text-sm text-blue-100">
              <CheckCircle className="h-4 w-4" />
              Free instant download
            </p>
          </div>
          
          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
              <Shield className="h-4 w-4 text-white" />
              <span className="text-sm text-white">Secure & Private</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
              <Download className="h-4 w-4 text-white" />
              <span className="text-sm text-white">Instant Access</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
              <Users className="h-4 w-4 text-white" />
              <span className="text-sm text-white">15,000+ Users</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
