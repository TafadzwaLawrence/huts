'use client'

import { Check, CheckCheck } from 'lucide-react'

interface MessageBubbleProps {
  content: string
  isOwn: boolean
  time: string
  isRead: boolean
  showAvatar?: boolean
  avatarUrl?: string
  senderName?: string
}

export default function MessageBubble({
  content,
  isOwn,
  time,
  isRead,
  showAvatar = false,
  avatarUrl,
  senderName,
}: MessageBubbleProps) {
  // Detect and linkify URLs
  const linkifyText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline underline-offset-2 font-medium ${isOwn ? 'text-white hover:text-white/80' : 'text-foreground hover:text-black'}`}
          >
            {part}
          </a>
        )
      }
      return part
    })
  }

  return (
    <div className={`flex gap-2.5 mb-2 items-end animate-fadeIn ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar (for other user's messages) */}
      {!isOwn && (
        <div className="w-8 h-8 shrink-0">
          {showAvatar ? (
            <div className="w-8 h-8 rounded-full bg-muted overflow-hidden border-2 border-white shadow-sm">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={senderName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-foreground text-xs font-bold">
                  {senderName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      )}

      {/* Message content wrapper */}
      <div className={`flex flex-col gap-0.5 max-w-[75%] sm:max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender name (only for received messages with avatar) */}
        {!isOwn && showAvatar && senderName && (
          <span className="text-xs text-foreground font-medium px-3">{senderName}</span>
        )}

        {/* Message bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl transition-all ${
            isOwn
              ? 'bg-muted text-white rounded-br-md shadow-md'
              : 'bg-white text-foreground rounded-bl-md shadow-sm border border-border'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {linkifyText(content)}
          </p>
        </div>

        {/* Time and read status */}
        <div className={`flex items-center gap-1.5 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] text-foreground font-medium tabular-nums">
            {time}
          </span>
          
          {/* Read indicator for own messages */}
          {isOwn && (
            <div className={`transition-colors ${isRead ? 'text-foreground' : 'text-foreground'}`}>
              {isRead ? (
                <CheckCheck size={12} strokeWidth={2.5} />
              ) : (
                <Check size={12} strokeWidth={2.5} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
