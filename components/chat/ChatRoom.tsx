'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2, ArrowLeft, Phone, MoreVertical, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

interface Message {
  id: string
  content: string
  sender_id: string
  message_type: string
  read_at: string | null
  created_at: string
}

interface Conversation {
  id: string
  property_id: string
  renter_id: string
  landlord_id: string
  last_message_at: string
  property?: {
    id: string
    title: string
    property_images?: { url: string }[]
  }
  renter?: {
    id: string
    name: string
    avatar_url: string | null
  }
  landlord?: {
    id: string
    name: string
    avatar_url: string | null
  }
}

interface ChatRoomProps {
  conversationId: string
  currentUserId: string
  onBack?: () => void
}

export default function ChatRoom({ conversationId, currentUserId, onBack }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  // Get the other participant's info
  const otherUser = conversation
    ? currentUserId === conversation.renter_id
      ? conversation.landlord
      : conversation.renter
    : null

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Fetch conversation and messages
  useEffect(() => {
    fetchConversation()
    fetchMessages()
    
    // Set up real-time subscriptions
    const messagesChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => [...prev, newMsg])
          scrollToBottom()
          
          // Mark as read if from other user
          if (newMsg.sender_id !== currentUserId) {
            markMessageAsRead(newMsg.id)
          }
        }
      )
      .subscribe()

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel(`typing:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const indicator = payload.new as { user_id: string; is_typing: boolean }
          if (indicator.user_id !== currentUserId) {
            setOtherUserTyping(indicator.is_typing)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(typingChannel)
      // Clear typing status on unmount
      updateTypingStatus(false)
    }
  }, [conversationId, currentUserId])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const fetchConversation = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        property_id,
        renter_id,
        landlord_id,
        last_message_at,
        property:properties (
          id,
          title,
          property_images (url)
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

    if (!error && data) {
      setConversation(data as unknown as Conversation)
    }
  }

  const fetchMessages = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setMessages(data)
      // Mark unread messages as read
      const unreadMessages = data.filter(
        (m) => m.sender_id !== currentUserId && !m.read_at
      )
      unreadMessages.forEach((m) => markMessageAsRead(m.id))
    }
    setLoading(false)
  }

  const markMessageAsRead = async (messageId: string) => {
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId)
  }

  const updateTypingStatus = async (isTyping: boolean) => {
    await supabase
      .from('typing_indicators')
      .upsert({
        conversation_id: conversationId,
        user_id: currentUserId,
        is_typing: isTyping,
        updated_at: new Date().toISOString(),
      })
  }

  const handleTyping = () => {
    // Set typing to true
    updateTypingStatus(true)

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      updateTypingStatus(false)
    }, 2000)
    setTypingTimeout(timeout)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    const messageContent = newMessage.trim()
    setNewMessage('')
    updateTypingStatus(false)

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: messageContent,
      message_type: 'text',
    })

    if (error) {
      console.error('Error sending message:', error)
      setNewMessage(messageContent) // Restore message on error
    }

    setSending(false)
    inputRef.current?.focus()
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    })
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const date = new Date(message.created_at).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="h-8 w-8 animate-spin text-[#ADB5BD]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-[#E9ECEF] px-4 py-3 flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors md:hidden"
          >
            <ArrowLeft size={20} className="text-[#495057]" />
          </button>
        )}

        {/* Other user info */}
        <div className="flex items-center gap-3 flex-1">
          <div className="h-10 w-10 rounded-full bg-[#E9ECEF] overflow-hidden">
            {otherUser?.avatar_url ? (
              <img
                src={otherUser.avatar_url}
                alt={otherUser.name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#495057] font-semibold">
                {otherUser?.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-[#212529] truncate">
              {otherUser?.name || 'Unknown User'}
            </h2>
            {conversation?.property && (
              <Link
                href={`/property/${conversation.property.id}`}
                className="text-xs text-[#495057] hover:text-[#212529] truncate block"
              >
                Re: {conversation.property.title}
              </Link>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors">
            <Phone size={20} className="text-[#495057]" />
          </button>
          <button className="p-2 hover:bg-[#F8F9FA] rounded-full transition-colors">
            <MoreVertical size={20} className="text-[#495057]" />
          </button>
        </div>
      </div>

      {/* Property Banner - Sticky at top */}
      {conversation?.property && (
        <div className="bg-[#212529] border-b border-[#495057] px-4 py-3">
          <Link
            href={`/property/${conversation.property.id}`}
            className="flex items-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#495057] flex-shrink-0 border-2 border-white/10">
              {conversation.property.property_images?.[0]?.url ? (
                <img
                  src={conversation.property.property_images[0].url}
                  alt={conversation.property.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={20} className="text-white/30" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider mb-0.5">Property Inquiry</p>
              <p className="font-semibold text-white group-hover:underline underline-offset-2 line-clamp-1">
                {conversation.property.title}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/70 font-medium group-hover:text-white transition-colors">
              View property →
            </div>
          </Link>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8F9FA]">
        {/* Empty state */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-white rounded-2xl border-2 border-[#E9ECEF] flex items-center justify-center mb-4 shadow-sm">
              <Send size={28} className="text-[#ADB5BD]" />
            </div>
            <h3 className="text-base font-semibold text-[#212529] mb-1">Start the conversation</h3>
            <p className="text-sm text-[#495057] max-w-xs">
              Send a message to begin chatting about {conversation?.property?.title || 'this property'}
            </p>
          </div>
        ) : (
          /* Messages grouped by date */
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
            {/* Date divider */}
            <div className="flex items-center gap-4 my-6 first:mt-2">
              <div className="flex-1 h-px bg-[#E9ECEF]" />
              <span className="text-xs text-[#495057] font-semibold px-3 py-1 bg-white rounded-full border border-[#E9ECEF] shadow-sm">
                {formatDate(dateMessages[0].created_at)}
              </span>
              <div className="flex-1 h-px bg-[#E9ECEF]" />
            </div>

            {/* Messages */}
            {dateMessages.map((message, index) => (
              <MessageBubble
                key={message.id}
                content={message.content}
                isOwn={message.sender_id === currentUserId}
                time={formatTime(message.created_at)}
                isRead={!!message.read_at}
                showAvatar={
                  index === 0 ||
                  dateMessages[index - 1]?.sender_id !== message.sender_id
                }
                avatarUrl={
                  message.sender_id === currentUserId
                    ? undefined
                    : otherUser?.avatar_url || undefined
                }
                senderName={
                  message.sender_id === currentUserId
                    ? undefined
                    : otherUser?.name || undefined
                }
              />
            ))}
          </div>
        ))
        )}

        {/* Typing indicator */}
        {otherUserTyping && (
          <TypingIndicator 
            name={otherUser?.name || 'User'} 
            avatarUrl={otherUser?.avatar_url || undefined}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={sendMessage} className="border-t-2 border-[#E9ECEF] p-4 bg-white">
        <div className="flex items-end gap-3">
          <button
            type="button"
            className="p-2.5 hover:bg-[#F8F9FA] rounded-xl transition-colors group mb-1"
            title="Attach image"
          >
            <ImageIcon size={20} className="text-[#ADB5BD] group-hover:text-[#495057] transition-colors" />
          </button>

          <div className="flex-1">
            <textarea
              ref={inputRef as any}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                handleTyping()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (newMessage.trim() && !sending) {
                    sendMessage(e as any)
                  }
                }
              }}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-5 py-3.5 bg-[#F8F9FA] rounded-2xl text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none focus:ring-2 focus:ring-[#212529] focus:bg-white transition-all resize-none max-h-32 border-2 border-transparent"
              style={{ minHeight: '52px' }}
            />
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3.5 bg-[#212529] text-white rounded-xl hover:bg-black hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 mb-1 shadow-lg shadow-black/10"
          >
            {sending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        <p className="text-[10px] text-[#ADB5BD] mt-2 px-1">Press Enter to send, Shift+Enter for new line</p>
      </form>
    </div>
  )
}
