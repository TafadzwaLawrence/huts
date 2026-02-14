'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, MessageSquare, FileQuestion, Star, Home, Settings, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  type: 'message' | 'inquiry' | 'review' | 'property_update' | 'system'
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
  }
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

function getNotificationIcon(type: string) {
  switch (type) {
    case 'message':
      return <MessageSquare size={16} className="text-blue-500" />
    case 'inquiry':
      return <FileQuestion size={16} className="text-amber-500" />
    case 'review':
      return <Star size={16} className="text-yellow-500" />
    case 'property_update':
      return <Home size={16} className="text-green-500" />
    default:
      return <Bell size={16} className="text-[#495057]" />
  }
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()
    
    const init = async () => {
      // Check if user is authenticated before setting up realtime
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !isMounted) return
      
      await fetchNotifications()
      
      // Only create subscription if not already subscribed and component is mounted
      if (!channelRef.current && isMounted) {
        channelRef.current = supabase
          .channel('notifications-realtime')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications' },
            () => {
              if (isMounted) fetchNotifications()
            }
          )
          .subscribe((status) => {
            if (status === 'CHANNEL_ERROR') {
              console.warn('Notification channel error - will retry on next interaction')
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

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      })
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const router = useRouter()

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      markAsRead(notification.id)
    }
    setIsOpen(false)

    // For message/inquiry notifications, open the floating chat widget
    if (notification.type === 'message' || notification.type === 'inquiry') {
      const detail: Record<string, string | undefined> = {}
      
      if (notification.metadata?.conversation_id) {
        detail.conversationId = notification.metadata.conversation_id
      }
      if (notification.metadata?.inquiry_id) {
        detail.inquiryId = notification.metadata.inquiry_id
      }
      if (notification.metadata?.property_id) {
        detail.propertyId = notification.metadata.property_id
      }

      window.dispatchEvent(
        new CustomEvent('open-chat', { detail })
      )
    } else if (notification.link) {
      // For other notification types, navigate normally
      router.push(notification.link)
    }
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-[#495057] hover:text-[#212529] hover:bg-[#F8F9FA] transition-all group"
        title="Notifications"
      >
        <Bell size={20} className="group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-[#FF6B6B] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-[#E9ECEF] z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E9ECEF] bg-[#F8F9FA]">
              <h3 className="font-semibold text-[#212529]">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[#495057] hover:text-[#212529] flex items-center gap-1"
                >
                  <Check size={12} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-[#ADB5BD]" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F8F9FA] flex items-center justify-center">
                    <Bell size={24} className="text-[#ADB5BD]" />
                  </div>
                  <p className="text-sm text-[#495057] font-medium">No notifications yet</p>
                  <p className="text-xs text-[#ADB5BD] mt-1">We&apos;ll let you know when something arrives</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-[#F8F9FA] transition-colors border-b border-[#E9ECEF] last:border-b-0 text-left ${
                      !notification.read_at ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#F8F9FA] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.read_at ? 'font-semibold text-[#212529]' : 'text-[#495057]'}`}>
                        {notification.title}
                      </p>
                      {notification.description && (
                        <p className="text-xs text-[#ADB5BD] mt-0.5 line-clamp-2">
                          {notification.description}
                        </p>
                      )}
                      <p className="text-[10px] text-[#ADB5BD] mt-1">
                        {timeAgo(notification.created_at)}
                        {(notification.type === 'message' || notification.type === 'inquiry') && (
                          <span className="ml-2 text-[#495057]">• Open in chat</span>
                        )}
                      </p>
                    </div>
                    {!notification.read_at && (
                      <div className="w-2 h-2 rounded-full bg-[#FF6B6B] flex-shrink-0 mt-2" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[#E9ECEF] bg-[#F8F9FA]">
              <Link
                href="/settings/notifications"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 text-xs text-[#495057] hover:text-[#212529] transition-colors"
              >
                <Settings size={12} />
                Notification Settings
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
