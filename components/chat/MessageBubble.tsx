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
  return (
    <div className={`flex gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar (for other user's messages) */}
      {!isOwn && (
        <div className="w-8 h-8 shrink-0">
          {showAvatar && (
            <div className="w-8 h-8 rounded-full bg-[#E9ECEF] overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={senderName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#495057] text-sm font-semibold">
                  {senderName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
          isOwn
            ? 'bg-[#212529] text-white rounded-br-sm'
            : 'bg-white text-[#212529] rounded-bl-sm shadow-sm'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        
        {/* Time and read status */}
        <div
          className={`flex items-center gap-1 mt-1 ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}
        >
          <span
            className={`text-xs ${
              isOwn ? 'text-white/60' : 'text-[#ADB5BD]'
            }`}
          >
            {time}
          </span>
          
          {/* Read indicator for own messages */}
          {isOwn && (
            <span className={isRead ? 'text-blue-400' : 'text-white/60'}>
              {isRead ? (
                <CheckCheck size={14} />
              ) : (
                <Check size={14} />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
