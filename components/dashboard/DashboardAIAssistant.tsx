'use client'

import { useState } from 'react'
import { useChat } from '@hashbrownai/react'
import { Bot, X, Send, Sparkles, MessageCircle } from 'lucide-react'

export default function DashboardAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [userInput, setUserInput] = useState('')

  const { messages, sendMessage, isReceiving } = useChat({
    model: 'gpt-4',
    system: `You are a helpful assistant for Huts, a rental property listing platform. You help users with:

**For Landlords:**
- How to list a new property
- Managing property listings
- Responding to inquiries from renters
- Understanding the pricing plans (Free: 3 listings, Pro: $15/mo unlimited)
- Tips for writing better property descriptions
- How to upload photos and set pricing
- Managing saved properties

**For Renters:**
- How to search for properties
- Saving favorite properties
- Sending inquiries to landlords
- Understanding the search filters
- What information to include in an inquiry
- How to schedule property tours

**General Help:**
- Navigating the dashboard
- Account settings and profile management
- Understanding messages and notifications
- Privacy and terms of service
- Contact support at contact@huts.com

Be friendly, concise, and actionable. Provide step-by-step guidance when needed. If a user asks about something you're not sure about, acknowledge the limitation and suggest contacting support.

Keep responses short (2-4 sentences) unless the user asks for detailed help.`,
    debounceTime: 300,
  })

  const suggestedQuestions = [
    'How do I list a new property?',
    'How do I respond to inquiries?',
    'What are the pricing plans?',
    'How do I save properties?',
  ]

  const handleSend = () => {
    if (!userInput.trim() || isReceiving) return
    sendMessage({ role: 'user', content: userInput })
    setUserInput('')
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-[#212529] text-white p-4 rounded-full shadow-2xl hover:bg-black hover:scale-110 transition-all duration-300 group"
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <Bot size={28} className="group-hover:rotate-12 transition-transform" />
            <Sparkles
              size={14}
              className="absolute -top-1 -right-1 text-[#212529] animate-pulse"
            />
          </div>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white border-2 border-[#212529] rounded-2xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-[#212529] text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Huts AI Assistant</h3>
                <p className="text-xs text-white/70">Here to help you</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 p-2 rounded-lg transition-colors"
              aria-label="Close assistant"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E9ECEF]">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-[#212529] p-2 rounded-lg flex-shrink-0">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-[#212529] font-medium mb-1">
                        Hi! I'm your Huts assistant 👋
                      </p>
                      <p className="text-sm text-[#495057]">
                        I can help you with listing properties, managing inquiries, searching for rentals, and anything else on the platform.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Suggested Questions */}
                <div>
                  <p className="text-xs text-[#ADB5BD] font-medium mb-2 px-1">
                    SUGGESTED QUESTIONS:
                  </p>
                  <div className="space-y-2">
                    {suggestedQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setUserInput(question)
                          setTimeout(() => handleSend(), 100)
                        }}
                        className="w-full text-left text-sm text-[#495057] bg-white border border-[#E9ECEF] rounded-lg p-3 hover:border-[#212529] hover:bg-[#F8F9FA] transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <MessageCircle
                            size={14}
                            className="text-[#ADB5BD] group-hover:text-[#212529] flex-shrink-0"
                          />
                          <span className="line-clamp-1">{question}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="bg-[#212529] p-2 rounded-lg h-fit flex-shrink-0">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl p-3 ${
                      message.role === 'user'
                        ? 'bg-[#212529] text-white'
                        : 'bg-[#F8F9FA] text-[#212529] border border-[#E9ECEF]'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {typeof message.content === 'string' 
                        ? message.content 
                        : JSON.stringify(message.content)}
                    </p>
                  </div>
                </div>
              ))
            )}

            {isReceiving && (
              <div className="flex gap-3">
                <div className="bg-[#212529] p-2 rounded-lg h-fit flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-[#F8F9FA] rounded-xl p-3 border border-[#E9ECEF]">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#ADB5BD] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#ADB5BD] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#ADB5BD] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#E9ECEF]">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2.5 border-2 border-[#E9ECEF] rounded-lg text-sm text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#212529] focus:outline-none transition-colors"
                disabled={isReceiving}
              />
              <button
                onClick={handleSend}
                disabled={isReceiving || !userInput.trim()}
                className="bg-[#212529] text-white px-4 py-2.5 rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
