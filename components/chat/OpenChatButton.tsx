'use client'

export function OpenChatButton({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('open-chat'))}
      className={className}
    >
      {children}
    </button>
  )
}

export function OpenChatConversation({
  children,
  conversationId,
  className,
}: {
  children: React.ReactNode
  conversationId: string
  className?: string
}) {
  return (
    <button
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent('open-chat', { detail: { conversationId } })
        )
      }
      className={className}
    >
      {children}
    </button>
  )
}
