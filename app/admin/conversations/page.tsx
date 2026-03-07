'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageSquare, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { AdminPageHeader, AdminEmptyState, AdminPagination } from '@/components/admin'

interface Conversation {
  id: string
  created_at: string
  last_message_at: string | null
  unread_count: number | null
  renter_id: string
  landlord_id: string
  property_id: string
  properties: { title: string; slug: string; city: string } | null
  renter: { name: string | null; email: string } | null
  landlord: { name: string | null; email: string } | null
}

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  sender: { name: string | null; email: string; avatar_url: string | null } | null
}

export default function AdminConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [loadingMessages, setLoadingMessages] = useState<string | null>(null)

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/conversations?page=${page}&limit=20`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setConversations(data.conversations)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchConversations() }, [page])

  const toggleExpand = async (convId: string) => {
    if (expandedId === convId) {
      setExpandedId(null)
      return
    }
    setExpandedId(convId)
    if (messages[convId]) return

    setLoadingMessages(convId)
    try {
      const res = await fetch(`/api/admin/conversations/${convId}`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setMessages((prev) => ({ ...prev, [convId]: data.messages }))
    } catch {
      toast.error('Failed to load messages')
    } finally {
      setLoadingMessages(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminPageHeader
        title="Conversations"
        description={`${total} total conversations — read-only view`}
      />

      {loading ? (
        <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-5 py-4 border-b border-[#E9ECEF] space-y-2">
              <div className="h-4 bg-[#E9ECEF] rounded animate-pulse w-1/3" />
              <div className="h-3 bg-[#E9ECEF] rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <AdminEmptyState icon={MessageSquare} title="No conversations" description="No conversations in the system" />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden divide-y divide-[#E9ECEF]">
            {conversations.map((conv) => (
              <div key={conv.id}>
                <button
                  onClick={() => toggleExpand(conv.id)}
                  className="w-full px-5 py-4 hover:bg-[#F8F9FA] transition-colors text-left"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[#212529]">
                          {conv.renter?.name || conv.renter?.email || 'Unknown Renter'}
                        </span>
                        <span className="text-xs text-[#ADB5BD]">→</span>
                        <span className="text-sm text-[#495057]">
                          {conv.landlord?.name || conv.landlord?.email || 'Unknown Landlord'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#ADB5BD] flex-wrap">
                        {conv.properties ? (
                          <Link
                            href={`/property/${conv.properties.slug}`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#495057] hover:text-[#212529] flex items-center gap-1 transition-colors"
                          >
                            {conv.properties.title} <ExternalLink size={10} />
                          </Link>
                        ) : (
                          <span>Property deleted</span>
                        )}
                        <span>·</span>
                        <span>
                          {conv.last_message_at
                            ? new Date(conv.last_message_at).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                              })
                            : 'No messages'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {(conv.unread_count ?? 0) > 0 && (
                        <span className="px-2 py-0.5 bg-[#212529] text-white rounded-full text-[10px] font-bold">
                          {conv.unread_count}
                        </span>
                      )}
                      {expandedId === conv.id ? (
                        <ChevronUp size={14} className="text-[#ADB5BD]" />
                      ) : (
                        <ChevronDown size={14} className="text-[#ADB5BD]" />
                      )}
                    </div>
                  </div>
                </button>

                {expandedId === conv.id && (
                  <div className="px-5 pb-4 bg-[#F8F9FA] border-t border-[#E9ECEF]">
                    {loadingMessages === conv.id ? (
                      <div className="py-4 text-center text-sm text-[#ADB5BD]">Loading messages…</div>
                    ) : (messages[conv.id] || []).length === 0 ? (
                      <p className="py-4 text-center text-sm text-[#ADB5BD]">No messages</p>
                    ) : (
                      <div className="space-y-3 pt-4 max-h-80 overflow-y-auto">
                        {(messages[conv.id] || []).map((msg) => (
                          <div key={msg.id} className="flex gap-3">
                            <div className="w-7 h-7 rounded-full bg-[#E9ECEF] flex items-center justify-center text-xs font-bold text-[#495057] flex-shrink-0">
                              {(msg.sender?.name || msg.sender?.email || '?')[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2">
                                <span className="text-xs font-medium text-[#212529]">
                                  {msg.sender?.name || msg.sender?.email || 'Unknown'}
                                </span>
                                <span className="text-[10px] text-[#ADB5BD]">
                                  {new Date(msg.created_at).toLocaleString('en-US', {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-[#495057] mt-0.5 break-words">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <AdminPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
