'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Home,
  DollarSign,
  Eye,
} from 'lucide-react'
import { ICON_SIZES } from '@/lib/constants'

interface AreaGuide {
  id: string
  slug: string
  name: string
  city: string
  neighborhood: string | null
  description: string | null
  property_count: number
  avg_rent: number | null
  created_at: string
}

export default function AreaGuidesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [areas, setAreas] = useState<AreaGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchAreas()
  }, [])

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('area_guides')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAreas(data || [])
    } catch (error: any) {
      console.error('Error fetching areas:', error)
      toast.error('Failed to load area guides')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    setDeleting(id)
    try {
      const { error } = await supabase
        .from('area_guides')
        .delete()
        .eq('id', id)

      if (error) throw error

      setAreas(prev => prev.filter(a => a.id !== id))
      toast.success('Area guide deleted')
    } catch (error: any) {
      console.error('Error deleting area:', error)
      toast.error('Failed to delete area guide')
    } finally {
      setDeleting(null)
    }
  }

  const updateStats = async () => {
    try {
      // Call the update_area_stats function
      const { error } = await supabase.rpc('update_area_stats')
      
      if (error) throw error

      toast.success('Stats updated successfully')
      fetchAreas()
    } catch (error: any) {
      console.error('Error updating stats:', error)
      toast.error('Failed to update stats')
    }
  }

  return (
    <div className="min-h-screen bg-muted py-12">
      <div className="container-main max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Area Guides</h1>
            <p className="text-foreground">Manage local area pages for SEO</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={updateStats}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border text-foreground rounded-md font-medium hover:border-border transition-all"
            >
              <TrendingUp size={ICON_SIZES.lg} />
              Update Stats
            </button>
            <Link
              href="/dashboard/areas/new"
              className="inline-flex items-center gap-2 bg-muted text-white px-6 py-2 rounded-md font-medium hover:bg-black hover:shadow-lg transition-all"
            >
              <Plus size={ICON_SIZES.lg} />
              New Area Guide
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border-2 border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <MapPin size={ICON_SIZES.xl} className="text-foreground" />
              <span className="text-2xl font-bold text-foreground">{areas.length}</span>
            </div>
            <p className="text-sm text-foreground">Total Area Guides</p>
          </div>

          <div className="bg-white border-2 border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Home size={ICON_SIZES.xl} className="text-foreground" />
              <span className="text-2xl font-bold text-foreground">
                {areas.reduce((sum, a) => sum + a.property_count, 0)}
              </span>
            </div>
            <p className="text-sm text-foreground">Properties Covered</p>
          </div>

          <div className="bg-white border-2 border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={ICON_SIZES.xl} className="text-foreground" />
              <span className="text-2xl font-bold text-foreground">
                ${Math.round(
                  areas.reduce((sum, a) => sum + (a.avg_rent || 0), 0) / 
                  areas.filter(a => a.avg_rent).length / 100
                ).toLocaleString() || 0}
              </span>
            </div>
            <p className="text-sm text-foreground">Avg Rent/Month</p>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-white border-2 border-border rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-border mx-auto mb-4"></div>
            <p className="text-foreground">Loading area guides...</p>
          </div>
        ) : areas.length === 0 ? (
          /* Empty State */
          <div className="bg-white border-2 border-border rounded-lg p-12 text-center">
            <MapPin size={ICON_SIZES['3xl']} className="mx-auto text-foreground mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No area guides yet</h3>
            <p className="text-foreground mb-6">Create your first area guide to improve local SEO</p>
            <Link
              href="/dashboard/areas/new"
              className="inline-flex items-center gap-2 bg-muted text-white px-6 py-3 rounded-lg font-medium hover:bg-black transition-all"
            >
              <Plus size={ICON_SIZES.lg} />
              Create Area Guide
            </Link>
          </div>
        ) : (
          /* Area Guides List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {areas.map((area) => (
              <div
                key={area.id}
                className="bg-white border-2 border-border rounded-lg overflow-hidden hover:border-border hover:shadow-lg transition-all duration-300"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1">
                        {area.name}
                      </h3>
                      <div className="flex items-center text-sm text-foreground">
                        <MapPin size={ICON_SIZES.sm} className="mr-1" />
                        {area.neighborhood ? `${area.neighborhood}, ` : ''}{area.city}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {area.description && (
                    <p className="text-sm text-foreground mb-4 line-clamp-2">
                      {area.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-border">
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {area.property_count}
                      </div>
                      <div className="text-xs text-foreground">Properties</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {area.avg_rent ? `$${Math.round(area.avg_rent / 100).toLocaleString()}` : '—'}
                      </div>
                      <div className="text-xs text-foreground">Avg Rent</div>
                    </div>
                  </div>

                  {/* Slug */}
                  <div className="mb-4 p-2 bg-muted rounded text-xs font-mono text-foreground truncate">
                    /areas/{area.slug}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/areas/${area.slug}`}
                      target="_blank"
                      className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2 border border-border text-foreground rounded-md text-sm font-medium hover:border-border transition-all"
                    >
                      <Eye size={ICON_SIZES.sm} />
                      View
                    </Link>
                    <Link
                      href={`/dashboard/areas/edit/${area.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2 border border-border text-foreground rounded-md text-sm font-medium hover:border-border transition-all"
                    >
                      <Edit size={ICON_SIZES.sm} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(area.id, area.name)}
                      disabled={deleting === area.id}
                      className="px-4 py-2 border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted hover:text-white transition-all disabled:opacity-50"
                    >
                      {deleting === area.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : (
                        <Trash2 size={ICON_SIZES.sm} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
