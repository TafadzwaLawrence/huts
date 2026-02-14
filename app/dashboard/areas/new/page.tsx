'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  MapPin,
  FileText,
  Search as SearchIcon,
  ArrowRight,
  Home,
} from 'lucide-react'

export default function NewAreaGuidePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    neighborhood: '',
    description: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create area guides')
        router.push('/dashboard')
        return
      }

      // Validate required fields
      if (!formData.name || !formData.city) {
        toast.error('Please fill in required fields')
        setLoading(false)
        return
      }

      const slug = generateSlug(formData.name)

      // Create area guide
      const { data, error } = await supabase
        .from('area_guides')
        .insert({
          slug,
          name: formData.name,
          city: formData.city,
          neighborhood: formData.neighborhood || null,
          description: formData.description || null,
          content: formData.content || null,
          meta_title: formData.metaTitle || formData.name,
          meta_description: formData.metaDescription || formData.description,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          toast.error('An area guide with this name already exists')
        } else {
          throw error
        }
        setLoading(false)
        return
      }

      toast.success('Area guide created successfully!')
      router.push('/dashboard/areas')
    } catch (error: any) {
      console.error('Error creating area guide:', error)
      toast.error(error.message || 'Failed to create area guide')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12">
      <div className="container-main max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#212529] mb-2">Create Area Guide</h1>
          <p className="text-[#495057]">Create a new neighborhood or city page for local SEO</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border-2 border-[#E9ECEF] rounded-xl p-8 md:p-10 shadow-lg">
          {/* Basic Information */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
              <MapPin size={24} />
              Basic Information
            </h2>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#212529] mb-2">
                  Area Name <span className="text-[#FF6B6B]">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
                  placeholder="e.g., Downtown Apartments, Avondale Rentals"
                />
                {formData.name && (
                  <p className="mt-2 text-xs text-[#ADB5BD] font-mono">
                    URL: /areas/{generateSlug(formData.name)}
                  </p>
                )}
              </div>

              {/* City and Neighborhood */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-[#212529] mb-2">
                    City <span className="text-[#FF6B6B]">*</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
                    placeholder="Harare"
                  />
                </div>

                <div>
                  <label htmlFor="neighborhood" className="block text-sm font-medium text-[#212529] mb-2">
                    Neighborhood <span className="text-xs text-[#ADB5BD]">(Optional)</span>
                  </label>
                  <input
                    id="neighborhood"
                    name="neighborhood"
                    type="text"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
                    placeholder="Avondale"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[#212529] mb-2">
                  Short Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors resize-none"
                  placeholder="A brief description of this area (1-2 sentences)"
                />
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="mb-10 pb-10 border-b border-[#E9ECEF]">
            <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
              <FileText size={24} />
              Page Content
            </h2>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-[#212529] mb-2">
                Detailed Content <span className="text-xs text-[#ADB5BD]">(Markdown supported)</span>
              </label>
              <textarea
                id="content"
                name="content"
                rows={12}
                value={formData.content}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors resize-none font-mono text-sm"
                placeholder="Write about the area, what makes it special, amenities, transportation, schools, etc.

## About [Area Name]
[Area Name] is a vibrant neighborhood known for...

## What You'll Find
- Restaurants and cafes
- Parks and recreation
- Shopping centers
- Public transportation

## Living in [Area Name]
The area is perfect for..."
              />
            </div>
          </section>

          {/* SEO Settings */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#212529] mb-6 flex items-center gap-2">
              <SearchIcon size={24} />
              SEO Settings
            </h2>

            <div className="space-y-6">
              {/* Meta Title */}
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-[#212529] mb-2">
                  Meta Title <span className="text-xs text-[#ADB5BD]">(Defaults to Area Name)</span>
                </label>
                <input
                  id="metaTitle"
                  name="metaTitle"
                  type="text"
                  maxLength={60}
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors"
                  placeholder="Best Apartments in Downtown | Huts"
                />
                <p className="mt-1 text-xs text-[#ADB5BD]">
                  {formData.metaTitle.length}/60 characters
                </p>
              </div>

              {/* Meta Description */}
              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-[#212529] mb-2">
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  rows={3}
                  maxLength={160}
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-md text-[#212529] focus:outline-none focus:border-[#212529] transition-colors resize-none"
                  placeholder="Find the perfect rental in Downtown. Browse apartments, condos, and houses. Get local insights and property listings."
                />
                <p className="mt-1 text-xs text-[#ADB5BD]">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>
            </div>
          </section>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-4 border-2 border-[#E9ECEF] text-[#212529] rounded-lg font-medium hover:border-[#212529] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#212529] text-white px-6 py-4 rounded-lg font-medium hover:bg-black hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  Create Area Guide
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
