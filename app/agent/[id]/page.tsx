import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin, Phone, Mail, MessageSquare, Bed, Bath, Maximize, Clock } from 'lucide-react'
import { formatPrice, formatSalePrice } from '@/lib/utils'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', params.id)
    .single()

  return {
    title: profile?.name ? `${profile.name} - Agent Profile` : 'Agent Profile',
    description: profile?.name ? `View listings and reviews for ${profile.name} on Huts.` : 'Agent profile on Huts.',
  }
}

export default async function AgentProfilePage({ params }: Props) {
  const supabase = await createClient()

  // Fetch profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, role, phone, email, created_at')
    .eq('id', params.id)
    .single()

  if (error || !profile) notFound()

  // Fetch their listings
  const { data: properties } = await supabase
    .from('properties')
    .select(`
      id, title, slug, price, sale_price, listing_type, beds, baths, sqft,
      city, neighborhood, status, created_at,
      property_images(url, is_primary)
    `)
    .eq('user_id', params.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(12)

  // Fetch reviews they received
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id, rating, comment_text, created_at,
      author:profiles!reviews_author_id_fkey(name, avatar_url)
    `)
    .in('property_id', (properties || []).map(p => p.id))
    .order('created_at', { ascending: false })
    .limit(10)

  // Calculate average rating
  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  })

  const activeListings = properties?.length || 0

  return (
    <div className="min-h-screen bg-white">
      {/* Profile header */}
      <section className="bg-[#F8F9FA] border-b border-[#E9ECEF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-[#E9ECEF] flex-shrink-0">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.name || 'Agent'}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#ADB5BD]">
                  {(profile.name || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-[#212529] mb-2">
                {profile.name || 'Agent'}
              </h1>
              <div className="flex items-center gap-4 text-sm text-[#495057] mb-4 flex-wrap">
                <span className="capitalize bg-[#E9ECEF] px-3 py-1 rounded-full text-xs font-medium">
                  {profile.role}
                </span>
                {avgRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star size={14} className="fill-[#212529] text-[#212529]" />
                    {avgRating.toFixed(1)} ({reviews?.length} reviews)
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={14} /> Member since {memberSince}
                </span>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm font-medium text-[#212529]">
                  {activeListings} active listing{activeListings !== 1 ? 's' : ''}
                </span>
                {profile.phone && (
                  <a href={`tel:${profile.phone}`} className="inline-flex items-center gap-1.5 text-sm text-[#495057] hover:text-[#212529] transition-colors">
                    <Phone size={14} /> {profile.phone}
                  </a>
                )}
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5 text-sm text-[#495057] hover:text-[#212529] transition-colors">
                    <Mail size={14} /> Contact
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Active Listings */}
        {properties && properties.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-[#212529] mb-6">Active Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {properties.map((prop) => {
                const imgs = (prop.property_images as Array<{ url: string; is_primary: boolean }>) || []
                const primary = imgs.find(i => i.is_primary) || imgs[0]
                const isSale = prop.listing_type === 'sale'

                return (
                  <Link
                    key={prop.id}
                    href={`/property/${prop.slug}`}
                    className="border border-[#E9ECEF] rounded-xl overflow-hidden hover:border-[#212529] transition-colors group"
                  >
                    <div className="h-44 bg-[#E9ECEF] relative overflow-hidden">
                      {primary?.url && (
                        <Image
                          src={primary.url}
                          alt={prop.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-0.5 rounded text-xs font-bold">
                        {isSale ? formatSalePrice(prop.sale_price ?? 0) : formatPrice(prop.price ?? 0)}
                        {!isSale && <span className="font-normal">/mo</span>}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-[#212529] truncate mb-1">{prop.title}</h3>
                      <p className="text-xs text-[#ADB5BD] flex items-center gap-1 mb-2">
                        <MapPin size={10} /> {prop.neighborhood || prop.city}
                      </p>
                      <div className="flex gap-3 text-xs text-[#495057]">
                        <span className="flex items-center gap-1"><Bed size={12} /> {prop.beds}</span>
                        <span className="flex items-center gap-1"><Bath size={12} /> {prop.baths}</span>
                        {prop.sqft && <span className="flex items-center gap-1"><Maximize size={12} /> {prop.sqft.toLocaleString()}</span>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#212529] mb-6">
              Reviews ({reviews.length})
            </h2>
            <div className="space-y-4">
              {reviews.map((review) => {
                const author = review.author as unknown as { name: string; avatar_url: string | null }
                return (
                  <div key={review.id} className="border border-[#E9ECEF] rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-[#E9ECEF] overflow-hidden flex-shrink-0">
                        {author?.avatar_url ? (
                          <Image src={author.avatar_url} alt="" width={36} height={36} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#ADB5BD]">
                            {(author?.name || 'U')[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#212529]">{author?.name || 'User'}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < review.rating ? 'fill-[#212529] text-[#212529]' : 'text-[#E9ECEF]'}
                            />
                          ))}
                          <span className="text-[10px] text-[#ADB5BD] ml-1">
                            {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-[#495057] leading-relaxed">{review.comment_text}</p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {(!properties || properties.length === 0) && (!reviews || reviews.length === 0) && (
          <div className="text-center py-16">
            <p className="text-[#ADB5BD]">No listings or reviews yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
