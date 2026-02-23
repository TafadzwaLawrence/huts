'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Phone, Mail, Calendar, Send, Home, DollarSign, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ContactSidebarProps {
  propertyId: string
  propertyTitle: string
  landlord?: {
    id: string
    name?: string | null
    avatar_url?: string | null
    phone?: string | null
    email?: string | null
  } | null
}

const QUICK_MESSAGES = [
  { icon: Calendar, label: 'Schedule a tour', text: "Hi, I'd like to schedule a viewing of this property. When would be a convenient time?" },
  { icon: Home, label: 'Is this available?', text: "Hi, is this property still available? I'm very interested." },
  { icon: DollarSign, label: 'Price negotiable?', text: "Hi, I'm interested in this property. Is the price negotiable?" },
]

export default function ContactSidebar({ propertyId, propertyTitle, landlord }: ContactSidebarProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please sign in to contact the landlord')
      return
    }

    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/inquiries/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, message: message.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send')
      }

      setSent(true)
      setMessage('')
      toast.success('Message sent!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="sticky top-24 border border-[#E9ECEF] rounded-xl shadow-sm">
      {/* Landlord info header */}
      <div className="p-5 border-b border-[#E9ECEF]">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#F8F9FA] border border-[#E9ECEF] flex-shrink-0">
            {landlord?.avatar_url ? (
              <Image
                src={landlord.avatar_url}
                alt={landlord.name || 'Landlord'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-[#495057]">
                  {landlord?.name?.[0]?.toUpperCase() || 'L'}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#212529] truncate text-sm">
              {landlord?.name || 'Property Owner'}
            </p>
            <p className="text-xs text-[#ADB5BD]">Typically responds within 24 hours</p>
          </div>
        </div>

        {/* Contact buttons */}
        <div className="space-y-2">
          {landlord?.phone && (
            <a
              href={`tel:${landlord.phone}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#212529] text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors"
            >
              <Phone size={15} />
              {landlord.phone}
            </a>
          )}
          <a
            href={`mailto:${landlord?.email}?subject=Inquiry about ${propertyTitle}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-[#212529] text-[#212529] rounded-lg text-sm font-semibold hover:bg-[#F8F9FA] transition-colors"
          >
            <Mail size={15} />
            Send email
          </a>
        </div>
      </div>

      {/* Message form */}
      <div className="p-5">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-10 h-10 bg-[#51CF66]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={18} className="text-[#51CF66]" />
            </div>
            <p className="text-sm font-semibold text-[#212529]">Message sent!</p>
            <p className="text-xs text-[#ADB5BD] mt-1">The landlord will get back to you soon</p>
            <button
              onClick={() => setSent(false)}
              className="text-xs text-[#212529] underline mt-3 hover:no-underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <>
            {/* Quick messages */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {QUICK_MESSAGES.map((qm) => (
                <button
                  key={qm.label}
                  onClick={() => setMessage(qm.text)}
                  className="text-xs px-2.5 py-1.5 border border-[#E9ECEF] rounded-full hover:border-[#212529] transition-colors text-[#495057] hover:text-[#212529]"
                >
                  {qm.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isLoggedIn ? "I'm interested in this property..." : 'Sign in to send a message'}
                disabled={!isLoggedIn}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-[#E9ECEF] rounded-lg resize-none focus:outline-none focus:border-[#212529] focus:ring-1 focus:ring-[#212529] disabled:bg-[#F8F9FA] disabled:text-[#ADB5BD]"
              />
              {isLoggedIn ? (
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="w-full mt-2 py-2.5 bg-[#212529] text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  {sending ? 'Sending...' : 'Send message'}
                </button>
              ) : (
                <Link
                  href="/auth/signup"
                  className="block w-full mt-2 py-2.5 bg-[#212529] text-white rounded-lg text-sm font-semibold text-center hover:bg-black transition-colors"
                >
                  Sign in to contact
                </Link>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  )
}
