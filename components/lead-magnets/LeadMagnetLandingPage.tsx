'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { LeadMagnetButton } from '@/components/lead-magnets/LeadMagnetButton'
import { CheckCircle, Users, Award, TrendingUp } from 'lucide-react'
import type { LeadMagnet } from '@/types/lead-magnets'

interface LeadMagnetLandingPageProps {
  slug: string
  heroImage?: string
  testimonials?: Array<{
    author: string
    role: string
    text: string
  }>
  features?: string[]
  cta?: string
}

export function LeadMagnetLandingPage({
  slug,
  heroImage,
  testimonials,
  features,
  cta = 'Get Your Guide',
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading guide...</div>
      </div>
    )
  }

  if (!leadMagnet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal">
            Guide not found
          </h1>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
            {/* Left: Content */}
            <div>
              <div className="mb-4 inline-block rounded bg-light-gray px-3 py-1 text-sm font-medium text-charcoal">
                Free Downloadable Guide
              </div>

              <h1 className="mb-6 text-4xl font-bold text-charcoal sm:text-5xl">
                {leadMagnet.title}
              </h1>

              <p className="mb-8 text-lg text-charcoal">
                {leadMagnet.description}
              </p>

              {/* Features List */}
              {features && features.length > 0 && (
                <div className="mb-8 space-y-3">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="mt-1 h-5 w-5 text-charcoal flex-shrink-0" />
                      <p className="text-charcoal">{feature}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="flex gap-4">
                <LeadMagnetButton leadMagnet={leadMagnet} text={cta} />
              </div>

              <p className="mt-4 text-sm text-charcoal">
                📧 Instant download. Join 10,000+ Zimbabweans making smarter
                real estate decisions.
              </p>
            </div>

            {/* Right: Image */}
            {heroImage && (
              <div className="relative aspect-square overflow-hidden rounded-lg bg-light-gray">
                <Image
                  src={heroImage}
                  alt={leadMagnet.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-light-gray bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-charcoal">
                15K+
              </div>
              <p className="text-charcoal">Users who found better deals</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-charcoal">
                4.8/5
              </div>
              <p className="text-charcoal">User satisfaction rating</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-charcoal">
                50+ pages
              </div>
              <p className="text-charcoal">In-depth expertise</p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="border-t border-light-gray bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-charcoal">
            What You&apos;ll Get
          </h2>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="rounded-lg border border-light-gray bg-white p-6">
              <Award className="mb-4 h-8 w-8 text-charcoal" />
              <h3 className="mb-2 font-semibold text-charcoal">
                Expert Insights
              </h3>
              <p className="text-charcoal">
                Curated from top real estate professionals in Zimbabwe
              </p>
            </div>

            <div className="rounded-lg border border-light-gray bg-white p-6">
              <Users className="mb-4 h-8 w-8 text-charcoal" />
              <h3 className="mb-2 font-semibold text-charcoal">
                Practical Checklists
              </h3>
              <p className="text-charcoal">
                Ready-to-use forms and guides you can apply immediately
              </p>
            </div>

            <div className="rounded-lg border border-light-gray bg-white p-6">
              <TrendingUp className="mb-4 h-8 w-8 text-charcoal" />
              <h3 className="mb-2 font-semibold text-charcoal">
                Market Data
              </h3>
              <p className="text-charcoal">
                Real statistics and pricing from Zimbabwe&apos;s top markets
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="border-t border-light-gray bg-white py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-12 text-center text-3xl font-bold text-charcoal">
              What People Say
            </h2>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {testimonials.map((testimonial, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-light-gray bg-white p-6"
                >
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} className="text-sm">
                        ⭐
                      </span>
                    ))}
                  </div>
                  <p className="mb-4 italic text-charcoal">
                    &quot;{testimonial.text}&quot;
                  </p>
                  <div>
                    <p className="font-semibold text-charcoal">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-charcoal">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="border-t border-light-gray bg-white py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold text-charcoal">
            Ready to Make Smart Real Estate Decisions?
          </h2>
          <p className="mb-8 text-charcoal">
            Get your free guide and join thousands of Zimbabweans who have
            already transformed their property journey.
          </p>
          <LeadMagnetButton
            leadMagnet={leadMagnet}
            text={cta}
            variant="secondary"
            className="!text-white !border-white hover:!border-off-white hover:!text-off-white"
          />
        </div>
      </section>
    </div>
  )
}
