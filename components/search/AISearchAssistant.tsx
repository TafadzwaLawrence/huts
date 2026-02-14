'use client'

import { useState } from 'react'
import { useChat } from '@hashbrownai/react'
import { Sparkles, Send, X, Loader2 } from 'lucide-react'

interface SearchFilters {
  minPrice?: number
  maxPrice?: number
  beds?: number
  baths?: number
  city?: string
  neighborhood?: string
  propertyType?: string
}

interface AISearchProps {
  onFiltersApply: (filters: SearchFilters) => void
  onSearchQuery: (query: string) => void
}

export function AISearchAssistant({ onFiltersApply, onSearchQuery }: AISearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [userInput, setUserInput] = useState('')

  const { messages, sendMessage, isReceiving } = useChat({
    model: 'gpt-4',
    system: `You are a helpful rental property search assistant for Huts, a rental property platform.
    
Your job is to understand natural language queries and convert them into structured search filters.

When a user asks about properties, extract:
- price range (monthly rent)
- number of bedrooms
- number of bathrooms
- location (city, neighborhood)
- property type (apartment, house, studio, room, townhouse, condo)

Respond conversationally and confirm what filters you're applying.

Examples:
User: "Show me 2 bedroom apartments in Avondale under $500"
You: "I'll search for 2-bedroom apartments in Avondale with rent under $500/month."

User: "I need a place with parking and 3 beds"
You: "Looking for 3-bedroom properties. Note: I'll show you results and you can filter by parking amenity."

User: "What's available in Borrowdale?"
You: "Searching all available properties in Borrowdale."

Keep responses brief and friendly.`,
    debounceTime: 300,
  })

  const handleSend = () => {
    if (!userInput.trim() || isReceiving) return

    sendMessage({ role: 'user', content: userInput })
    
    // Parse the query for filters
    const filters = parseNaturalLanguageQuery(userInput)
    if (Object.keys(filters).length > 0) {
      onFiltersApply(filters)
    }
    
    // Also send as search query for text matching
    onSearchQuery(userInput)
    
    setUserInput('')
  }

  const parseNaturalLanguageQuery = (query: string): SearchFilters => {
    const filters: SearchFilters = {}
    const lowerQuery = query.toLowerCase()

    // Extract bedrooms
    const bedMatch = lowerQuery.match(/(\d+)\s*(bed|bedroom|br)/i)
    if (bedMatch) {
      filters.beds = parseInt(bedMatch[1])
    }

    // Extract bathrooms
    const bathMatch = lowerQuery.match(/(\d+(?:\.\d+)?)\s*(bath|bathroom)/i)
    if (bathMatch) {
      filters.baths = parseFloat(bathMatch[1])
    }

    // Extract price
    const priceMatch = lowerQuery.match(/(?:under|below|less than|<)\s*\$?(\d+)/i)
    if (priceMatch) {
      filters.maxPrice = parseInt(priceMatch[1]) * 100 // Convert to cents
    }
    const minPriceMatch = lowerQuery.match(/(?:over|above|more than|>)\s*\$?(\d+)/i)
    if (minPriceMatch) {
      filters.minPrice = parseInt(minPriceMatch[1]) * 100
    }

    // Extract property type
    const types = ['apartment', 'house', 'studio', 'room', 'townhouse', 'condo']
    for (const type of types) {
      if (lowerQuery.includes(type)) {
        filters.propertyType = type
        break
      }
    }

    // Extract locations (common Harare neighborhoods)
    const neighborhoods = [
      'avondale', 'borrowdale', 'mount pleasant', 'newlands', 
      'eastlea', 'city centre', 'downtown', 'highlands', 'greystone'
    ]
    for (const neighborhood of neighborhoods) {
      if (lowerQuery.includes(neighborhood)) {
        filters.neighborhood = neighborhood
        filters.city = 'Harare'
        break
      }
    }

    // Check for Harare
    if (lowerQuery.includes('harare')) {
      filters.city = 'Harare'
    }

    return filters
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 bg-[#212529] text-white px-6 py-4 rounded-full font-medium hover:bg-black hover:shadow-2xl transition-all shadow-lg"
      >
        <Sparkles size={20} />
        <span className="hidden sm:inline">AI Search Assistant</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md">
      <div className="bg-white border-2 border-[#212529] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#212529] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} />
            <span className="font-semibold">AI Search Assistant</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 bg-[#F8F9FA]">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles size={48} className="mx-auto text-[#ADB5BD] mb-4" />
              <p className="text-[#495057] mb-2">Try asking:</p>
              <div className="space-y-2 text-sm">
                <button
                  onClick={() => setUserInput('Show me 2 bedroom apartments in Avondale under $500')}
                  className="block w-full text-left px-3 py-2 bg-white border border-[#E9ECEF] rounded-md hover:border-[#212529] transition-colors"
                >
                  "2 bedroom apartments in Avondale under $500"
                </button>
                <button
                  onClick={() => setUserInput('Houses with 3 bedrooms')}
                  className="block w-full text-left px-3 py-2 bg-white border border-[#E9ECEF] rounded-md hover:border-[#212529] transition-colors"
                >
                  "Houses with 3 bedrooms"
                </button>
                <button
                  onClick={() => setUserInput('What is available in Borrowdale?')}
                  className="block w-full text-left px-3 py-2 bg-white border border-[#E9ECEF] rounded-md hover:border-[#212529] transition-colors"
                >
                  "What's available in Borrowdale?"
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-[#212529] text-white'
                        : 'bg-white border border-[#E9ECEF] text-[#212529]'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {typeof message.content === 'string' 
                        ? message.content 
                        : JSON.stringify(message.content)}
                    </p>
                  </div>
                </div>
              ))}
              {isReceiving && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#E9ECEF] rounded-lg px-4 py-2">
                    <Loader2 size={16} className="animate-spin text-[#212529]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-[#E9ECEF]">
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe what you're looking for..."
              className="flex-1 px-4 py-2 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
              disabled={isReceiving}
            />
            <button
              onClick={handleSend}
              disabled={!userInput.trim() || isReceiving}
              className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isReceiving ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
