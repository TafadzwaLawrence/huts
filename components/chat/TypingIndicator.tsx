'use client'

interface TypingIndicatorProps {
  name?: string
}

export default function TypingIndicator({ name }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 mb-2">
      {/* Avatar placeholder */}
      <div className="w-8 h-8 rounded-full bg-[#E9ECEF] flex items-center justify-center text-[#495057] text-sm font-semibold">
        {name?.[0]?.toUpperCase() || '?'}
      </div>

      {/* Typing bubble */}
      <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 bg-[#ADB5BD] rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-2 h-2 bg-[#ADB5BD] rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-2 h-2 bg-[#ADB5BD] rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>

      {/* Name label */}
      <span className="text-xs text-[#ADB5BD]">{name} is typing...</span>
    </div>
  )
}
