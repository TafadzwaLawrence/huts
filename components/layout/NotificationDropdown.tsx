'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell, MessageSquare, FileQuestion, Star, Home,
  Settings, Check, Loader2, X, Inbox, Calendar, DollarSign, Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { handleApiAuthError } from '@/lib/utils'

interface Notification {
  id: string
  type: 'message' | 'inquiry' | 'review' | 'property_update' | 'system' | 'lead' | 'appointment' | 'commission' | 'client_update'
  title: string
  description: string | null
  link: string | null
  read_at: string | null
  created_at: string
  metadata?: {
    conversation_id?: string
    inquiry_id?: string
    property_id?: string
    sender_id?: string
    review_id?: string
    rating?: number
    lead_id?: string
    lead_type?: string
    lead_score?: number
    claim_deadline_at?: string
    appointment_id?: string
    appointment_type?: string
    scheduled_at?: string
    client_id?: string
    new_status?: string
  }
}

interface NotificationDropdownProps {
  onUnreadCountChange?: (count: number) => void
}

function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

const TYPE_CONFIG = {
  message:        { Icon: MessageSquare, label: 'Message',       bg: 'bg-[#212529]', text: 'text-white' },
  inquiry:        { Icon: FileQuestion,  label: 'Inquiry',        bg: 'bg-[#495057]', text: 'text-white' },
  review:         { Icon: Star,          label: 'Review',         bg: 'bg-[#212529]', text: 'text-white' },
  property_update:{ Icon: Home,          label: 'Update',         bg: 'bg-[#495057]', text: 'text-white' },
  system:         { Icon: Bell,          label: 'System',         bg: 'bg-[#ADB5BD]', text: 'text-white' },
  lead:           { Icon: Inbox,         label: 'New Lead',       bg: 'bg-[#111827]', text: 'text-white' },
  appointment:    { Icon: Calendar,      label: 'Appointment',    bg: 'bg-[#212529]', text: 'text-white' },
  commission:     { Icon: DollarSign,    label: 'Commission',     bg: 'bg-[#212529]', text: 'text-white' },
  client_update:  { Icon: Users,         label: 'Client',         bg: 'bg-[#495057]', text: 'text-white' },
} as const

export function NotificationDropdown({ onUnreadCountChange }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const router = useRouter()

  const updateUnread = useCallback((count: number) => {
    setUnreadCount(count)
    onUnreadCountChange?.(count)
  }, [onUnreadCountChange])

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications')
      if (await handleApiAuthError(response, router)) return
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        updateUnread(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [updateUnread, router])

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !isMounted) return
      await fetchNotifications()
      if (!channelRef.current && isMounted) {
        channelRef.current = supabase
          .channel('notifications-realtime')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
            if (isMounted) fetchNotifications()
          })
          .subscribe((status) => {
            if (status === 'CHANNEL_ERROR') {
              console.warn('Notification channel error')
            }
          })
      }
    }

    init()

    return () => {
      isMounted = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [fetchNotifications])

  // Lock body scroll when panel is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      })
      if (await handleApiAuthError(response, router)) return
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      updateUnread(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })
      if (await handleApiAuthError(response, router)) return
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
      updateUnread(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) markAsRead(notification.id)
    setIsOpen(false)

    if (notification.type === 'message' || notification.type === 'inquiry') {
      const detail: Record<string, string | undefined> = {}
      if (notification.metadata?.conversation_id) detail.conversationId = notification.metadata.conversation_id
      if (notification.metadata?.inquiry_id) detail.inquiryId = notification.metadata.inquiry_id
      if (notification.metadata?.property_id) detail.propertyId = notification.metadata.property_id
      window.dispatchEvent(new CustomEvent('open-chat', { detail }))
    } else if (notification.link) {
      router.push(notification.link)
    }
  }

  return (
    <>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2.5 rounded-xl text-[#495057] hover:text-[#212529] hover:bg-[#F8F9FA] transition-all group"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell size={20} className="group-hover:scale-110 transition-transform duration-200" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-[#FF6B6B] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-in Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 h-screen w-full max-w-[460px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E9ECEF] shrink-0">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-[#212529]" />
            <h2 className="text-lg font-semibold text-[#212529]">Notifications</h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-[#212529] text-white text-[11px] font-bold rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#495057] border border-[#E9ECEF] rounded-lg hover:bg-[#F8F9FA] hover:text-[#212529] hover:border-[#ADB5BD] transition-all"
              >
                <Check size={12} />
                Mark all read
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-[#495057] hover:text-[#212529] hover:bg-[#F8F9FA] transition-all"
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Loader2 size={28} className="animate-spin text-[#ADB5BD]" />
              <p className="text-sm text-[#ADB5BD]">Loading notifications…</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 px-8 text-center">
              <div className="w-16 h-16 mb-4 rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-center">
                <Bell size={28} className="text-[#ADB5BD]" />
              </div>
              <p className="font-semibold text-[#212529] mb-1">All caught up</p>
              <p className="text-sm text-[#ADB5BD] leading-relaxed">
                Messages, reviews, and property updates will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E9ECEF]">
              {notifications.slice(0, 25).map((notification, index) => {
                const config = TYPE_CONFIG[notification.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.system
                const Icon = config.Icon
                const isUnread = !notification.read_at
                const isChat = notification.type === 'message' || notification.type === 'inquiry'

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full flex items-start gap-4 px-6 py-5 text-left group transition-colors duration-150 hover:bg-[#F8F9FA] ${
                      isUnread ? 'bg-[#FAFAFA]' : 'bg-white'
                    }`}
                    style={{
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? 'translateY(0)' : 'translateY(8px)',
                      transition: isOpen
                        ? `opacity 0.25s ease-out ${index * 35}ms, transform 0.25s ease-out ${index * 35}ms, background-color 0.15s`
                        : 'none',
                    }}
                  >
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                      <Icon size={19} className={config.text} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-snug ${isUnread ? 'font-semibold text-[#212529]' : 'font-medium text-[#495057]'}`}>
                          {notification.title}
                        </p>
                        {isUnread && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B] flex-shrink-0 mt-1" />
                        )}
                      </div>
                      {notification.description && (
                        <p className="text-sm text-[#ADB5BD] mt-1 line-clamp-2 leading-relaxed">
                          {notification.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-[#ADB5BD]">{timeAgo(notification.created_at)}</span>
                        <span className="w-1 h-1 rounded-full bg-[#DEE2E6]" />
                        <span className="text-xs text-[#ADB5BD] font-medium">{config.label}</span>
                        {isChat && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-[#DEE2E6]" />
                            <span className="text-xs text-[#495057] font-medium">Open chat →</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#E9ECEF] px-6 py-4 shrink-0">
          <Link
            href="/settings/notifications"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium text-[#495057] rounded-xl border border-[#E9ECEF] hover:bg-[#F8F9FA] hover:text-[#212529] hover:border-[#ADB5BD] transition-all"
          >
            <Settings size={15} />
            Notification Settings
          </Link>
        </div>
      </div>
    </>
  )
}
