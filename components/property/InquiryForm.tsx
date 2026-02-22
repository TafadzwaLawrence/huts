'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Send, MessageSquare, Calendar, Home, DollarSign } from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'
import Link from 'next/link'

interface InquiryFormProps {
  propertyId: string
}

const QUICK_MESSAGES = [
  { icon: Calendar, label: 'Schedule viewing', text: "Hi, I'd like to schedule a viewing of this property. When would be a convenient time?" },
  { icon: Home, label: 'Still available?', text: "Hi, is this property still available? I'm very interested." },
  { icon: DollarSign, label: 'Price negotiable?', text: "Hi, I'm interested in this property. Is the price negotiable?" },
]

export default function InquiryForm({ propertyId }: InquiryFormProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
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
      toast.error('Please sign in to send an inquiry')
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
        body: JSON.stringify({
          propertyId,
          message: message.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send inquiry')
      }

      toast.success('Message sent! Check the chat button in the bottom right to continue the conversation.')
      setMessage('')
      
      // Trigger a chat notification event
      window.dispatchEvent(new CustomEvent('new-conversation', { detail: { conversationId: data.conversationId } }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send inquiry')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      {/* Quick Message Templates */}
      {isLoggedIn && (
        <div className="mb-4">
          <p className="text-xs text-foreground mb-2 font-medium uppercase tracking-wide">Quick messages</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_MESSAGES.map((msg, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setMessage(msg.text)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  message === msg.text
                    ? 'bg-muted text-white'
                    : 'bg-muted text-foreground hover:bg-muted border border-border'
                }`}
              >
                <msg.icon size={ICON_SIZES.xs} />
                {msg.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isLoggedIn ? "Write your message here..." : "Sign in to contact the landlord"}
            disabled={!isLoggedIn}
            className="w-full p-4 pr-12 border border-border rounded-xl resize-none h-28 focus:border-2 focus:border-border focus:outline-none transition-colors disabled:bg-muted disabled:cursor-not-allowed text-sm text-foreground placeholder:text-foreground"
          />
          {isLoggedIn && (
            <div className="absolute bottom-3 right-3 text-xs text-foreground">
              {message.length}/500
            </div>
          )}
        </div>

        {isLoggedIn ? (
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="group w-full py-4 bg-muted text-white rounded-xl font-semibold hover:bg-black hover:-translate-y-0.5 hover:shadow-lg transition-all mt-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            <Send size={ICON_SIZES.md} className={sending ? 'animate-pulse' : 'group-hover:translate-x-1 transition-transform'} />
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        ) : (
          <Link
            href="/auth/signup"
            className="block w-full py-4 bg-muted text-white rounded-xl font-semibold hover:bg-black hover:-translate-y-0.5 hover:shadow-lg transition-all mt-3 text-center"
          >
            Sign in to send inquiry
          </Link>
        )}
      </form>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 mt-5 pt-5 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-foreground">
          <MessageSquare size={ICON_SIZES.xs} />
          <span>Free to message</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-foreground">
          <span className="w-1 h-1 rounded-full bg-muted"></span>
          <span>No spam</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-foreground">
          <span className="w-1 h-1 rounded-full bg-muted"></span>
          <span>Secure</span>
        </div>
      </div>
    </div>
  )
}
