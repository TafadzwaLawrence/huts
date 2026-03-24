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
        <div className="flex items-center justify-between p-6 border-b border-light-gray">
          <h2 className="text-xl font-semibold text-charcoal">Create New Transaction</h2>
          <button
            onClick={onClose}
            className="text-dark-gray hover:text-charcoal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
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
                  <label className="block text-sm font-medium text-charcoal mb-2">
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
                  <label className="block text-sm font-medium text-charcoal mb-2">
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
                className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-charcoal disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Next: Add Participants
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Add Participants
                </label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-3 text-dark-gray" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    onChange={(e) => searchProfiles(e.target.value)}
                    className="text-[#212529] bg-white w-full pl-10 pr-3 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-2 border border-light-gray rounded-md max-h-40 overflow-y-auto">
                    {searchResults.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => addParticipant(profile)}
                        className="w-full px-3 py-2 text-left hover:bg-light-gray flex items-center gap-3"
                      >
                        <User size={16} />
                        <div>
                          <div className="font-medium">{profile.full_name}</div>
                          <div className="text-sm text-dark-gray">{profile.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {participants.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-charcoal">Participants</h4>
                  {participants.map((participant) => (
                    <div key={participant.profile.id} className="flex items-center gap-3 p-3 border border-light-gray rounded-md">
                      <User size={16} />
                      <div className="flex-1">
                        <div className="font-medium">{participant.profile.full_name}</div>
                        <div className="text-sm text-dark-gray">{participant.profile.email}</div>
                      </div>
                      <select
                        value={participant.role}
                        onChange={(e) => updateParticipant(participant.profile.id, {
                          role: e.target.value as 'listing_agent' | 'selling_agent' | 'buyer_agent' | 'buyer' | 'seller' | 'landlord' | 'tenant' | 'coordinator'
                        })}
                        className="px-2 py-1 border border-light-gray rounded text-sm"
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
                          placeholder="Commission %"
                          value={participant.commission_split_pct || ''}
                          onChange={(e) => updateParticipant(participant.profile.id, {
                            commission_split_pct: parseFloat(e.target.value) || 0
                          })}
                          className="w-20 px-2 py-1 border border-light-gray rounded text-sm"
                        />
                      )}
                      <button
                        onClick={() => removeParticipant(participant.profile.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={3}
                  className="text-[#212529] bg-white w-full px-3 py-2 border border-light-gray rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-dark-gray text-charcoal py-2 px-4 rounded-md hover:bg-light-gray"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || participants.length === 0}
                  className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-charcoal disabled:bg-gray-400 disabled:cursor-not-allowed"
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