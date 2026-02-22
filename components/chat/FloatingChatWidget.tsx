'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  MessageSquare,
  X,
  Send,
  Minimize2,
  Search,
  Building2,
  ChevronLeft,
  Loader2,
  Inbox,
  Mail
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type Conversation = {
  id: string
  property_id: string
  last_message_at: string
  last_message_preview: string | null
  property: {
    title: string
    slug: string
    property_images: Array<{ url: string; is_primary: boolean }>
  }
  renter: {
    id: string
    name: string
    avatar_url: string | null
  }
  landlord: {
    id: string
    name: string
    avatar_url: string | null
  }
  unread_count?: number
}

type PendingInquiry = {
  id: string
  property_id: string
  sender_id: string
  recipient_id: string
  message: string
  status: string
  created_at: string
  property: {
    id: string
    title: string
    slug: string
    user_id: string
    property_images: Array<{ url: string; is_primary: boolean }>
  }
  sender: {
    id: string
    name: string
    avatar_url: string | null
  }
}

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: string
  created_at: string
  read_at: string | null
}

// Combined list item type
type ChatListItem =
  | { type: 'conversation'; data: Conversation }
  | { type: 'inquiry'; data: PendingInquiry }

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [pendingInquiries, setPendingInquiries] = useState<PendingInquiry[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [startingConversation, setStartingConversation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch user and data on mount
  useEffect(() => {
    fetchUser()
    fetchConversations()
  }, [])

  // Real-time subscriptions
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('chat-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const msg = payload.new as Message
        if (selectedConversation && msg.conversation_id === selectedConversation.id) {
          setMessages(prev => [...prev, msg])
          scrollToBottom()
        } else if (msg.sender_id !== userId && !isOpen) {
          // Show actionable toast for messages not currently being viewed
          toast('New message received', {
            description: msg.content.length > 60 ? msg.content.slice(0, 60) + '...' : msg.content,
            action: {
              label: 'Open',
              onClick: () => {
                window.dispatchEvent(
                  new CustomEvent('open-chat', {
                    detail: { conversationId: msg.conversation_id },
                  })
                )
              },
            },
          })
        }
        fetchConversations()
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations',
      }, (payload) => {
        const newConv = payload.new as any
        if (newConv.renter_id === userId || newConv.landlord_id === userId) {
          fetchConversations()
          if (newConv.landlord_id === userId && !isOpen) {
            toast('New inquiry received!', {
              description: 'Someone is interested in your property.',
              action: {
                label: 'Open Chat',
                onClick: () => {
                  window.dispatchEvent(
                    new CustomEvent('open-chat', {
                      detail: { conversationId: newConv.id },
                    })
                  )
                },
              },
            })
          }
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inquiries',
      }, () => {
        fetchConversations()
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
      }, () => {
        fetchConversations()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, selectedConversation, isOpen])

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Listen for new conversation events from inquiry form
  useEffect(() => {
    const handleNewConversation = () => {
      setIsOpen(true)
      setIsMinimized(false)
      fetchConversations()
    }
    window.addEventListener('new-conversation', handleNewConversation as EventListener)
    return () => window.removeEventListener('new-conversation', handleNewConversation as EventListener)
  }, [])

  // Listen for open-chat events from notifications
  useEffect(() => {
    const handleOpenChat = async (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      setIsOpen(true)
      setIsMinimized(false)

      // Refresh conversations first
      await fetchConversations()

      // If a specific conversation ID is provided, open it directly
      if (detail.conversationId) {
        const targetConv = conversations.find(c => c.id === detail.conversationId)
        if (targetConv) {
          openConversation(targetConv)
        } else {
          // Conversation might not be in state yet, fetch it directly
          const { data: conv } = await supabase
            .from('conversations')
            .select(`
              id,
              property_id,
              last_message_at,
              last_message_preview,
              properties!inner (
                title,
                slug,
                property_images (url, is_primary)
              ),
              renter:profiles!conversations_renter_id_fkey (
                id,
                name,
                avatar_url
              ),
              landlord:profiles!conversations_landlord_id_fkey (
                id,
                name,
                avatar_url
              )
            `)
            .eq('id', detail.conversationId)
            .single()

          if (conv) {
            openConversation(conv as any)
          }
        }
      }
      // If inquiry ID is provided, find the matching pending inquiry
      else if (detail.inquiryId) {
        const targetInquiry = pendingInquiries.find(inq => inq.id === detail.inquiryId)
        if (targetInquiry) {
          startConversationFromInquiry(targetInquiry)
        }
      }
    }

    window.addEventListener('open-chat', handleOpenChat as EventListener)
    return () => window.removeEventListener('open-chat', handleOpenChat as EventListener)
  }, [conversations, pendingInquiries])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUserId(user?.id || null)
  }

  const fetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch conversations
    const { data: convData } = await supabase
      .from('conversations')
      .select(`
        id,
        property_id,
        renter_id,
        landlord_id,
        last_message_at,
        last_message_preview,
        properties!inner (
          title,
          slug,
          property_images (url, is_primary)
        ),
        renter:profiles!conversations_renter_id_fkey (
          id,
          name,
          avatar_url
        ),
        landlord:profiles!conversations_landlord_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .or(`renter_id.eq.${user.id},landlord_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })

    let convUnread = 0
    if (convData) {
      const conversationsWithUnread = await Promise.all(
        convData.map(async (conv) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .is('read_at', null)
          return { ...conv, unread_count: count || 0 }
        })
      )
      setConversations(conversationsWithUnread as any)
      convUnread = conversationsWithUnread.reduce((sum, c) => sum + (c.unread_count || 0), 0)
    }

    // Fetch pending inquiries (not yet converted to conversations)
    const { data: inquiryData } = await supabase
      .from('inquiries')
      .select(`
        id,
        property_id,
        sender_id,
        recipient_id,
        message,
        status,
        created_at,
        property:properties (
          id,
          title,
          slug,
          user_id,
          property_images (url, is_primary)
        ),
        sender:profiles!inquiries_sender_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .or(`recipient_id.eq.${user.id},sender_id.eq.${user.id}`)
      .in('status', ['unread', 'read'])
      .order('created_at', { ascending: false })

    if (inquiryData && convData) {
      // Build lookup of existing conversations: property_id + renter_id
      const convLookup = new Set(
        convData.map((c: any) => `${c.property_id}_${c.renter?.id || (c as any).renter_id}`)
      )

      const orphanedInquiries = inquiryData.filter((inq: any) => {
        const key = `${inq.property_id}_${inq.sender_id}`
        return !convLookup.has(key)
      })

      setPendingInquiries(orphanedInquiries as any)

      const inquiryUnread = orphanedInquiries.filter(
        (inq: any) => inq.recipient_id === user.id
      ).length
      setUnreadCount(convUnread + inquiryUnread)
    } else {
      setUnreadCount(convUnread)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id)
          .is('read_at', null)
        fetchConversations()
      }
    }
    setLoading(false)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || !userId) return

    setSending(true)
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedConversation.id,
        sender_id: userId,
        content: newMessage.trim(),
        message_type: 'text',
      })

    if (!error) {
      setNewMessage('')
      fetchMessages(selectedConversation.id)
      fetchConversations()
    }
    setSending(false)
  }

  const openConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation.id)
    setIsMinimized(false)
  }

  const startConversationFromInquiry = async (inquiry: PendingInquiry) => {
    if (!userId) return
    setStartingConversation(true)

    try {
      const landlordId = inquiry.property?.user_id || inquiry.recipient_id
      const renterId = inquiry.sender_id

      // Create conversation via RPC
      const { data: conversationId, error: convError } = await supabase.rpc(
        'get_or_create_conversation',
        {
          p_property_id: inquiry.property_id,
          p_renter_id: renterId,
          p_landlord_id: landlordId,
        }
      )

      if (convError || !conversationId) {
        toast.error('Failed to start conversation')
        setStartingConversation(false)
        return
      }

      // Insert the inquiry message as the first message
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: renterId,
        content: inquiry.message,
        message_type: 'text',
      })

      // Mark inquiry as replied
      await supabase
        .from('inquiries')
        .update({ status: 'replied', replied_at: new Date().toISOString() })
        .eq('id', inquiry.id)

      // Refresh conversations
      await fetchConversations()

      // Open the new conversation
      const { data: newConv } = await supabase
        .from('conversations')
        .select(`
          id,
          property_id,
          last_message_at,
          last_message_preview,
          properties!inner (
            title,
            slug,
            property_images (url, is_primary)
          ),
          renter:profiles!conversations_renter_id_fkey (
            id,
            name,
            avatar_url
          ),
          landlord:profiles!conversations_landlord_id_fkey (
            id,
            name,
            avatar_url
          )
        `)
        .eq('id', conversationId)
        .single()

      if (newConv) {
        openConversation(newConv as any)
      }

      toast.success('Conversation started!')
    } catch {
      toast.error('Something went wrong')
    }

    setStartingConversation(false)
  }

  // Build combined list: pending inquiries first, then conversations
  const buildChatList = (): ChatListItem[] => {
    const items: ChatListItem[] = []
    const q = searchQuery.toLowerCase()

    pendingInquiries
      .filter(inq => {
        if (!searchQuery) return true
        return (inq.sender?.name || '').toLowerCase().includes(q) ||
          (inq.property?.title || '').toLowerCase().includes(q) ||
          inq.message.toLowerCase().includes(q)
      })
      .forEach(inq => items.push({ type: 'inquiry', data: inq }))

    conversations
      .filter(conv => {
        if (!searchQuery) return true
        const other = userId === conv.renter?.id ? conv.landlord : conv.renter
        return (other?.name || '').toLowerCase().includes(q) ||
          (conv.property?.title || '').toLowerCase().includes(q)
      })
      .forEach(conv => items.push({ type: 'conversation', data: conv }))

    return items
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' })
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  if (!userId) return null

  const chatList = buildChatList()

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-muted text-white rounded-full shadow-2xl hover:bg-black hover:scale-110 transition-all flex items-center justify-center group"
        >
          <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-7 h-7 bg-muted text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border-2 border-border transition-all ${
            isMinimized ? 'h-16 w-80' : 'h-[600px] w-96'
          }`}
        >
          {/* Header */}
          <div className="bg-muted text-white p-4 rounded-t-2xl flex items-center justify-between">
            {selectedConversation ? (
              <>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex-1 flex items-center gap-3 ml-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden">
                    {(() => {
                      const other = userId === selectedConversation.renter?.id
                        ? selectedConversation.landlord
                        : selectedConversation.renter
                      if (other?.avatar_url) {
                        return <img src={other.avatar_url} alt="" className="w-full h-full object-cover" />
                      }
                      return other?.name?.[0]?.toUpperCase() || 'U'
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {userId === selectedConversation.renter?.id
                        ? selectedConversation.landlord?.name
                        : selectedConversation.renter?.name}
                    </p>
                    <p className="text-xs text-white/70 truncate">{selectedConversation.property?.title}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <MessageSquare size={20} />
                <span className="font-bold">Messages</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-muted text-xs font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Minimize2 size={18} />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setSelectedConversation(null)
                  setIsMinimized(false)
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {selectedConversation ? (
                /* ===== Chat View ===== */
                <div className="flex flex-col h-[calc(600px-64px)]">
                  {/* Property Info Banner */}
                  <Link
                    href={`/property/${selectedConversation.property?.slug}`}
                    className="p-3 bg-muted hover:bg-black transition-colors flex items-center gap-3 group"
                  >
                    <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0 border-2 border-white/10">
                      {selectedConversation.property?.property_images?.[0]?.url ? (
                        <Image
                          src={selectedConversation.property.property_images[0].url}
                          alt={selectedConversation.property.title}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 size={20} className="text-white/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-white/50 font-semibold uppercase tracking-wider mb-0.5">Property Inquiry</p>
                      <p className="text-sm font-semibold text-white group-hover:underline underline-offset-2 truncate">
                        {selectedConversation.property?.title}
                      </p>
                    </div>
                    <div className="text-xs text-white/70 font-medium group-hover:text-white transition-colors flex-shrink-0">
                      View →
                    </div>
                  </Link>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="animate-spin text-foreground" size={32} />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-center">
                        <div>
                          <MessageSquare size={48} className="text-foreground mx-auto mb-4" />
                          <p className="text-foreground">No messages yet</p>
                          <p className="text-xs text-foreground mt-1">Start the conversation!</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message, index) => {
                        const isMine = message.sender_id === userId
                        const isFirstMessage = index === 0

                        // First message = the original inquiry - render with special card
                        if (isFirstMessage) {
                          return (
                            <div key={message.id} className="space-y-2">
                              {/* Inquiry divider */}
                              <div className="flex items-center justify-center gap-2 text-xs text-foreground">
                                <div className="h-px flex-1 bg-muted" />
                                <span className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-full border border-border font-medium">
                                  <Mail size={10} />
                                  Inquiry
                                </span>
                                <div className="h-px flex-1 bg-muted" />
                              </div>

                              {/* Inquiry message card */}
                              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div
                                  className={`max-w-[85%] rounded-2xl overflow-hidden border-2 ${
                                    isMine
                                      ? 'bg-muted text-white border-border'
                                      : 'bg-white text-foreground border-border'
                                  }`}
                                >
                                  <div className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 ${
                                    isMine ? 'bg-white/10 text-white/80' : 'bg-muted text-foreground'
                                  }`}>
                                    <Mail size={12} />
                                    Property Inquiry
                                  </div>
                                  <div className="px-4 py-3">
                                    <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                                    <p className={`text-xs mt-2 ${isMine ? 'text-white/50' : 'text-foreground'}`}>
                                      {new Date(message.created_at).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        }

                        // Regular message bubble
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                isMine
                                  ? 'bg-muted text-white rounded-br-sm'
                                  : 'bg-white text-foreground rounded-bl-sm'
                              }`}
                            >
                              <p className="text-sm break-words">{message.content}</p>
                              <p className={`text-xs mt-1 ${isMine ? 'text-white/60' : 'text-foreground'}`}>
                                {new Date(message.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                                {isMine && message.read_at && <span className="ml-1">✓✓</span>}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={sendMessage} className="p-3 border-t border-border bg-white">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 bg-muted rounded-xl text-sm text-foreground placeholder:text-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-2.5 bg-muted text-white rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {sending ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <Send size={20} />
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* ===== Chat List View ===== */
                <div className="flex flex-col h-[calc(600px-64px)]">
                  {/* Search */}
                  <div className="p-3 border-b border-border">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search messages & inquiries..."
                        className="w-full pl-10 pr-3 py-2 bg-muted rounded-lg text-sm text-foreground placeholder:text-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
                      />
                    </div>
                  </div>

                  {/* Combined List */}
                  <div className="flex-1 overflow-y-auto">
                    {chatList.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-center p-6">
                        <div>
                          <Inbox size={48} className="text-foreground mx-auto mb-4" />
                          <p className="font-semibold text-foreground mb-1">No messages yet</p>
                          <p className="text-sm text-foreground">
                            {searchQuery ? 'No results found' : 'Inquiries and conversations will appear here'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      chatList.map((item) => {
                        // ===== Pending Inquiry Item =====
                        if (item.type === 'inquiry') {
                          const inq = item.data
                          const isRecipient = inq.recipient_id === userId
                          const otherPerson = isRecipient ? inq.sender : null
                          const displayName = otherPerson?.name || 'Unknown'

                          return (
                            <button
                              key={`inq-${inq.id}`}
                              onClick={() => startConversationFromInquiry(inq)}
                              disabled={startingConversation}
                              className="w-full p-4 hover:bg-muted transition-colors border-b border-border text-left group bg-muted"
                            >
                              <div className="flex items-start gap-3">
                                {/* Avatar with inquiry ring */}
                                <div className="relative flex-shrink-0">
                                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-foreground to-foreground flex items-center justify-center text-white text-lg font-bold ring-2 ring-foreground ring-offset-2">
                                    {otherPerson?.avatar_url ? (
                                      <img src={otherPerson.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      displayName[0]?.toUpperCase() || 'U'
                                    )}
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <p className="font-bold text-foreground truncate text-sm">
                                      {displayName}
                                    </p>
                                    <span className="ml-2 px-2 py-0.5 bg-muted text-white text-[10px] font-bold rounded-full flex-shrink-0 flex items-center gap-1">
                                      <Mail size={9} />
                                      New Inquiry
                                    </span>
                                  </div>
                                  <p className="text-xs text-foreground truncate mb-1 flex items-center gap-1">
                                    <Building2 size={11} />
                                    {inq.property?.title}
                                  </p>
                                  <p className="text-xs text-foreground line-clamp-2">
                                    &ldquo;{inq.message}&rdquo;
                                  </p>
                                  <div className="flex items-center justify-between mt-1.5">
                                    <p className="text-[10px] text-foreground">
                                      {formatTime(inq.created_at)}
                                    </p>
                                    {isRecipient && (
                                      <span className="text-[10px] text-foreground font-semibold group-hover:underline">
                                        {startingConversation ? 'Starting...' : 'Click to reply →'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          )
                        }

                        // ===== Conversation Item =====
                        const conv = item.data
                        const otherUser = userId === conv.renter?.id ? conv.landlord : conv.renter
                        const hasUnread = (conv.unread_count || 0) > 0

                        return (
                          <button
                            key={`conv-${conv.id}`}
                            onClick={() => openConversation(conv)}
                            className="w-full p-4 hover:bg-muted transition-colors border-b border-border text-left"
                          >
                            <div className="flex items-start gap-3">
                              <div className="relative flex-shrink-0">
                                <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-lg font-bold ${
                                  hasUnread
                                    ? 'ring-2 ring-foreground ring-offset-2 bg-gradient-to-br from-foreground to-foreground text-white'
                                    : 'bg-muted text-foreground'
                                }`}>
                                  {otherUser?.avatar_url ? (
                                    <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    otherUser?.name?.[0]?.toUpperCase() || 'U'
                                  )}
                                </div>
                                {hasUnread && (
                                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-muted text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {conv.unread_count}
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <p className={`truncate text-sm ${hasUnread ? 'font-bold text-foreground' : 'font-semibold text-foreground'}`}>
                                    {otherUser?.name || 'Unknown'}
                                  </p>
                                  <span className={`text-[10px] flex-shrink-0 ml-2 ${hasUnread ? 'text-foreground font-semibold' : 'text-foreground'}`}>
                                    {formatTime(conv.last_message_at)}
                                  </span>
                                </div>
                                <p className="text-xs text-foreground truncate mb-1 flex items-center gap-1">
                                  <Building2 size={11} />
                                  {conv.property?.title}
                                </p>
                                <p className={`text-xs line-clamp-1 ${hasUnread ? 'text-foreground font-medium' : 'text-foreground'}`}>
                                  {conv.last_message_preview || 'No messages yet'}
                                </p>
                              </div>
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}