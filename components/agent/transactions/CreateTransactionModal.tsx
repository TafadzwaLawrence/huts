'use client'

import { useState, useEffect } from 'react'
import { X, Search, User, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TransactionType } from '@/types'

interface CreateTransactionModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Property {
  id: string
  title: string
  address: string
  price?: number
  sale_price?: number
  listing_type: 'rent' | 'sale' | null
}

interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url?: string
}

export function CreateTransactionModal({ isOpen, onClose }: CreateTransactionModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [searchResults, setSearchResults] = useState<Profile[]>([])

  // Form data
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [transactionType, setTransactionType] = useState<'sale' | 'rental' | 'lease'>('sale')
  const [listingPrice, setListingPrice] = useState('')
  const [participants, setParticipants] = useState<Array<{
    profile: Profile
    role: 'listing_agent' | 'selling_agent' | 'buyer_agent' | 'buyer' | 'seller' | 'landlord' | 'tenant' | 'coordinator'
    commission_split_pct?: number
  }>>([])
  const [notes, setNotes] = useState('')

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchProperties()
    } else {
      // Reset form when modal closes
      setStep(1)
      setSelectedProperty(null)
      setTransactionType('sale')
      setListingPrice('')
      setParticipants([])
      setNotes('')
    }
  }, [isOpen])

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties?limit=100')
      const result = await response.json()
      if (response.ok) {
        setProperties(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    }
  }

  const searchProfiles = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10)

      if (error) throw error
      setSearchResults(data || [])
    } catch (error) {
      console.error('Error searching profiles:', error)
    }
  }

  const addParticipant = (profile: Profile) => {
    if (!participants.find(p => p.profile.id === profile.id)) {
      setParticipants([...participants, {
        profile,
        role: 'buyer',
        commission_split_pct: 0
      }])
    }
    setSearchResults([])
  }

  const removeParticipant = (profileId: string) => {
    setParticipants(participants.filter(p => p.profile.id !== profileId))
  }

  const updateParticipant = (profileId: string, updates: Partial<typeof participants[0]>) => {
    setParticipants(participants.map(p =>
      p.profile.id === profileId ? { ...p, ...updates } : p
    ))
  }

  const handleSubmit = async () => {
    if (!selectedProperty) return

    setLoading(true)
    try {
      const requestData = {
        property_id: selectedProperty.id,
        transaction_type: transactionType,
        listing_price: listingPrice ? parseFloat(listingPrice) : undefined,
        notes: notes || undefined,
        participants: participants.map(p => ({
          profile_id: p.profile.id,
          role: p.role,
          commission_split_pct: p.commission_split_pct || undefined,
          preferred_contact_method: 'email'
        }))
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()

      if (response.ok) {
        onClose()
        // Optionally refresh the transaction list
        window.location.reload()
      } else {
        alert(result.error || 'Failed to create transaction')
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
      alert('An error occurred while creating the transaction')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E9ECEF]">
          <h2 className="text-xl font-semibold text-[#212529]">Create New Transaction</h2>
          <button
            onClick={onClose}
            className="text-[#495057] hover:text-[#212529]"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#212529] mb-2">
                  Select Property
                </label>
                <select
                  value={selectedProperty?.id || ''}
                  onChange={(e) => {
                    const property = properties.find(p => p.id === e.target.value)
                    setSelectedProperty(property || null)
                  }}
                  className="text-[#212529] bg-white w-full px-3 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Choose a property...</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.title} - {property.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#212529] mb-2">
                    Transaction Type
                  </label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as TransactionType)}
                    className="text-[#212529] bg-white w-full px-3 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="sale">Sale</option>
                    <option value="rental">Rental</option>
                    <option value="lease">Lease</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#212529] mb-2">
                    Listing Price
                  </label>
                  <input
                    type="number"
                    value={listingPrice}
                    onChange={(e) => setListingPrice(e.target.value)}
                    placeholder="Enter price..."
                    className="text-[#212529] bg-white w-full px-3 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!selectedProperty}
                className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-[#212529] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next: Add Participants
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-2">
                  Search &amp; Add Participants
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB5BD]" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    onChange={(e) => searchProfiles(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529] transition-colors"
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-2 border border-[#E9ECEF] rounded-xl overflow-hidden shadow-sm">
                    {searchResults.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => addParticipant(profile)}
                        className="w-full px-4 py-3 text-left hover:bg-[#F8F9FA] flex items-center gap-3 text-[#212529] border-b border-[#F3F4F6] last:border-0 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#212529] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{profile.full_name}</div>
                          <div className="text-xs text-[#6B7280]">{profile.email}</div>
                        </div>
                        <Plus size={14} className="ml-auto text-[#ADB5BD]" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {participants.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-[#212529]">Added Participants ({participants.length})</h4>
                  {participants.map((participant) => (
                    <div key={participant.profile.id} className="flex items-center gap-3 p-3 border border-[#E9ECEF] rounded-xl bg-[#F8F9FA]">
                      <div className="w-8 h-8 rounded-full bg-[#212529] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {participant.profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#212529] truncate">{participant.profile.full_name}</div>
                        <div className="text-xs text-[#6B7280] truncate">{participant.profile.email}</div>
                      </div>
                      <select
                        value={participant.role}
                        onChange={(e) => updateParticipant(participant.profile.id, {
                          role: e.target.value as typeof participant.role
                        })}
                        className="px-2 py-1.5 border border-[#E9ECEF] rounded-lg text-xs text-[#212529] bg-white focus:outline-none focus:ring-1 focus:ring-[#212529]"
                      >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="listing_agent">Listing Agent</option>
                        <option value="selling_agent">Selling Agent</option>
                        <option value="buyer_agent">Buyer Agent</option>
                        <option value="landlord">Landlord</option>
                        <option value="tenant">Tenant</option>
                        <option value="coordinator">Coordinator</option>
                      </select>
                      {(participant.role.includes('agent')) && (
                        <input
                          type="number"
                          placeholder="%"
                          value={participant.commission_split_pct || ''}
                          onChange={(e) => updateParticipant(participant.profile.id, {
                            commission_split_pct: parseFloat(e.target.value) || 0
                          })}
                          className="w-14 px-2 py-1.5 border border-[#E9ECEF] rounded-lg text-xs text-[#212529] bg-white focus:outline-none"
                        />
                      )}
                      <button
                        onClick={() => removeParticipant(participant.profile.id)}
                        className="text-[#EF4444] hover:text-red-700 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#212529] mb-2">
                  Notes <span className="font-normal text-[#9CA3AF]">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={3}
                  className="w-full px-4 py-3 border border-[#E9ECEF] rounded-lg text-[#212529] bg-white focus:outline-none focus:ring-2 focus:ring-[#212529] transition-colors"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-[#E9ECEF] text-[#212529] py-3 px-4 rounded-lg hover:border-[#212529] font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || participants.length === 0}
                  className="flex-1 bg-[#212529] text-white py-3 px-4 rounded-lg hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Transaction'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}