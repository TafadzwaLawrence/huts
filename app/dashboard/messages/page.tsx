'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Search,
  Send,
  Building2,
  Loader2,
  Inbox,
  ArrowLeft,
  Check,
  CheckCheck,
  ImageIcon,
} from 'lucide-react'

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
  renter: { id: string; name: string; avatar_url: string | null }
  landlord: { id: string; name: string; avatar_url: string | null }
  unread_count?: number
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const { data } = await supabase
      .from('conversations')
      .select(`
        id, property_id, last_message_at, last_message_preview,
        property:properties!conversations_property_id_fkey(title, slug, property_images(url, is_primary)),
        renter:profiles!conversations_renter_id_fkey(id, name, avatar_url),
        landlord:profiles!conversations_landlord_id_fkey(id, name, avatar_url)
      `)
      .or(`renter_id.eq.${user.id},landlord_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })

    if (data) {
      const convs = await Promise.all(
        (data as unknown as Conversation[]).map(async (conv) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .is('read_at', null)
          return { ...conv, unread_count: count || 0 }
        })
      )
      setConversations(convs)
    }
    setLoading(false)
  }, [supabase])

  const fetchMessages = useCallback(async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (data) setMessages(data)

    if (userId) {
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .is('read_at', null)
    }
  }, [supabase, userId])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  useEffect(() => {
    if (selected) fetchMessages(selected.id)
  }, [selected, fetchMessages])

  useEffect(() => { scrollToBottom() }, [messages])

  // Real-time subscription
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('messages-page')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const msg = payload.new as Message
        if (selected && msg.conversation_id === selected.id) {
          setMessages(prev => [...prev, msg])
          if (msg.sender_id !== userId) {
            supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', msg.id).then()
          }
        }
        fetchConversations()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, selected, supabase, fetchConversations])

  const handleSend = async () => {
    if (!newMessage.trim() || !selected || !userId || sending) return
    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    const { error } = await supabase.from('messages').insert({
      conversation_id: selected.id,
      sender_id: userId,
      content,
      message_type: 'text',
    })

    if (error) {
      toast.error('Failed to send message')
      setNewMessage(content)
    } else {
      await supabase.from('conversations').update({
        last_message_at: new Date().toISOString(),
        last_message_preview: content.slice(0, 100),
      }).eq('id', selected.id)
    }
    setSending(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getOtherUser = (conv: Conversation) => {
    if (!userId) return conv.renter
    return conv.renter.id === userId ? conv.landlord : conv.renter
  }

  const getPrimaryImage = (conv: Conversation) => {
    const imgs = conv.property?.property_images || []
    return (imgs.find(i => i.is_primary) || imgs[0])?.url
  }

  const filtered = conversations.filter(conv => {
    if (!search) return true
    const q = search.toLowerCase()
    const other = getOtherUser(conv)
    return (
      conv.property?.title?.toLowerCase().includes(q) ||
      other.name?.toLowerCase().includes(q) ||
      conv.last_message_preview?.toLowerCase().includes(q)
    )
  })

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="animate-spin text-[#ADB5BD]" size={32} />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9ECEF]">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#212529]">Messages</h1>
          {totalUnread > 0 && (
            <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>
      </div>

      {/* Main split view */}
      <div className="flex-1 flex min-h-0">
        {/* Left panel: Conversation list */}
        <div className={`w-full md:w-[380px] md:min-w-[380px] border-r border-[#E9ECEF] flex flex-col ${selected ? 'hidden md:flex' : 'flex'}`}>
          {/* Search */}
          <div className="p-3 border-b border-[#E9ECEF]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD]" size={16} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#212529]"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                <Inbox size={48} className="text-[#E9ECEF] mb-4" />
                <p className="text-sm font-medium text-[#495057] mb-1">No conversations yet</p>
                <p className="text-xs text-[#ADB5BD]">Messages from inquiries will appear here</p>
              </div>
            ) : (
              filtered.map((conv) => {
                const other = getOtherUser(conv)
                const img = getPrimaryImage(conv)
                const isActive = selected?.id === conv.id
                const hasUnread = (conv.unread_count || 0) > 0

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelected(conv)}
                    className={`w-full text-left p-4 border-b border-[#F8F9FA] hover:bg-[#F8F9FA] transition-colors ${
                      isActive ? 'bg-[#F8F9FA] border-l-2 border-l-black' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#E9ECEF] flex-shrink-0">
                        {img ? (
                          <Image src={img} alt="" width={48} height={48} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 size={18} className="text-[#ADB5BD]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-sm truncate ${hasUnread ? 'font-bold text-[#212529]' : 'font-medium text-[#495057]'}`}>
                            {other.name || 'Unknown'}
                          </span>
                          <span className="text-[10px] text-[#ADB5BD] whitespace-nowrap ml-2">
                            {timeAgo(conv.last_message_at)}
                          </span>
                        </div>
                        <p className="text-xs text-[#ADB5BD] truncate mb-1">{conv.property?.title || 'Property'}</p>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs truncate ${hasUnread ? 'text-[#212529] font-medium' : 'text-[#ADB5BD]'}`}>
                            {conv.last_message_preview || 'No messages yet'}
                          </p>
                          {hasUnread && (
                            <span className="bg-black text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right panel: Message thread */}
        <div className={`flex-1 flex flex-col ${!selected ? 'hidden md:flex' : 'flex'}`}>
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 rounded-full bg-[#F8F9FA] flex items-center justify-center mb-4">
                <ImageIcon size={28} className="text-[#ADB5BD]" />
              </div>
              <h2 className="text-lg font-semibold text-[#212529] mb-2">Your Messages</h2>
              <p className="text-sm text-[#ADB5BD] max-w-sm">
                Select a conversation to start messaging. All property inquiries and replies show here.
              </p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E9ECEF] bg-white">
                <button onClick={() => setSelected(null)} className="md:hidden p-1.5 hover:bg-[#F8F9FA] rounded-lg">
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#E9ECEF] flex-shrink-0">
                  {getPrimaryImage(selected) ? (
                    <Image src={getPrimaryImage(selected)!} alt="" width={40} height={40} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={16} className="text-[#ADB5BD]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-[#212529] truncate block">{getOtherUser(selected).name}</span>
                  <Link
                    href={`/property/${selected.property?.slug || selected.property?.id || ''}`}
                    className="text-xs text-[#ADB5BD] hover:text-[#495057] truncate block transition-colors"
                  >
                    {selected.property?.title}
                  </Link>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FAFAFA]">
                {messages.map((msg, i) => {
                  const isMine = msg.sender_id === userId
                  const showDate = i === 0 || (
                    new Date(msg.created_at).toDateString() !== new Date(messages[i - 1].created_at).toDateString()
                  )
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="text-[10px] text-[#ADB5BD] bg-white px-3 py-1 rounded-full border border-[#E9ECEF]">
                            {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isMine
                            ? 'bg-[#212529] text-white rounded-br-sm'
                            : 'bg-white text-[#212529] border border-[#E9ECEF] rounded-bl-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                            <span className={`text-[10px] ${isMine ? 'text-white/50' : 'text-[#ADB5BD]'}`}>
                              {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                            {isMine && (
                              msg.read_at
                                ? <CheckCheck size={12} className="text-white/50" />
                                : <Check size={12} className="text-white/30" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-[#E9ECEF] bg-white">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 resize-none text-sm px-4 py-2.5 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-[#212529] max-h-32"
                    style={{ minHeight: '42px' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className="p-2.5 bg-[#212529] text-white rounded-xl hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}