'use client'

interface TypingIndicatorProps {
  name?: string
  avatarUrl?: string
}

export default function TypingIndicator({ name, avatarUrl }: TypingIndicatorProps) {
  return (
    <div className="flex gap-2.5 mb-2 items-end animate-fadeIn">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-muted overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name || 'User'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground text-xs font-bold">
            {name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        {/* Name label */}
        {name && (
          <span className="text-xs text-foreground font-medium px-3">{name}</span>
        )}

        {/* Typing bubble */}
        <div className="bg-white px-5 py-3.5 rounded-2xl rounded-bl-md shadow-sm border border-border">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 bg-muted rounded-full animate-bounce"
              style={{ animationDelay: '0ms', animationDuration: '1s' }}
            />
            <span
              className="w-2 h-2 bg-muted rounded-full animate-bounce"
              style={{ animationDelay: '200ms', animationDuration: '1s' }}
            />
            <span
              className="w-2 h-2 bg-muted rounded-full animate-bounce"
              style={{ animationDelay: '400ms', animationDuration: '1s' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
