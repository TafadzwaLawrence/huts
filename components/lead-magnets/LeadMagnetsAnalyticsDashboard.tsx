'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Download, TrendingUp, Users } from 'lucide-react'
import type { LeadMagnet } from '@/types/lead-magnets'

interface MagnetStats {
  lead_magnet_id: string
  total_downloads: number
  conversions: number
  conversion_rate: number
  last_download: string
}

export function LeadMagnetsAnalyticsDashboard() {
  const [magnets, setMagnets] = useState<LeadMagnet[]>([])
  const [stats, setStats] = useState<Record<string, MagnetStats>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()

        // Fetch all active lead magnets
        const { data: magnetData } = await supabase
          .from('lead_magnets')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: true })

        if (magnetData) {
          setMagnets(magnetData)

          // Calculate stats for each magnet
          const statsMap: Record<string, MagnetStats> = {}

          for (const magnet of magnetData) {
            // Count downloads
            const { count: totalDownloads } = await supabase
              .from('lead_magnet_downloads')
              .select('*', { count: 'exact', head: true })
              .eq('lead_magnet_id', magnet.id)

            // Count conversions
            const { count: conversions } = await supabase
              .from('lead_magnet_downloads')
              .select('*', { count: 'exact', head: true })
              .eq('lead_magnet_id', magnet.id)
              .eq('converted', true)

            // Get last download
            const { data: lastDownload } = await supabase
              .from('lead_magnet_downloads')
              .select('downloaded_at')
              .eq('lead_magnet_id', magnet.id)
              .order('downloaded_at', { ascending: false })
              .limit(1)
              .single()

            const rate = totalDownloads && conversions
              ? parseFloat(((conversions / totalDownloads) * 100).toFixed(1))
              : 0

            statsMap[magnet.id] = {
              lead_magnet_id: magnet.id,
              total_downloads: totalDownloads || 0,
              conversions: conversions || 0,
              conversion_rate: rate,
              last_download: lastDownload?.downloaded_at || 'Never',
            }
          }

          setStats(statsMap)
        }
      } catch (error) {
        console.error('[Analytics] Fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalDownloads = Object.values(stats).reduce(
    (sum, s) => sum + s.total_downloads,
    0
  )
  const totalConversions = Object.values(stats).reduce(
    (sum, s) => sum + s.conversions,
    0
  )
  const overallConversionRate =
    totalDownloads > 0
      ? parseFloat(((totalConversions / totalDownloads) * 100).toFixed(1))
      : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Downloads Card */}
        <div className="bg-white border border-light-gray rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-dark-gray">Total Downloads</h3>
            <Download className="h-4 w-4 text-dark-gray" />
          </div>
          <div className="text-2xl font-bold text-charcoal">{totalDownloads}</div>
          <p className="text-xs text-dark-gray mt-1">Across all guides</p>
        </div>

        {/* Conversions Card */}
        <div className="bg-white border border-light-gray rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-dark-gray">Conversions</h3>
            <Users className="h-4 w-4 text-dark-gray" />
          </div>
          <div className="text-2xl font-bold text-charcoal">{totalConversions}</div>
          <p className="text-xs text-dark-gray mt-1">Downloads → Listings/Inquiries</p>
        </div>

        {/* Conversion Rate Card */}
        <div className="bg-white border border-light-gray rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-dark-gray">Conversion Rate</h3>
            <TrendingUp className="h-4 w-4 text-dark-gray" />
          </div>
          <div className="text-2xl font-bold text-charcoal">{overallConversionRate.toFixed(1)}%</div>
          <p className="text-xs text-dark-gray mt-1">Overall effectiveness</p>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white border border-light-gray rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-light-gray">
          <h3 className="font-semibold text-charcoal">Lead Magnet Performance</h3>
          <p className="text-sm text-dark-gray">Track downloads, conversions, and engagement by guide</p>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-dark-gray">
              Loading analytics...
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-off-white border-b border-light-gray">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-dark-gray">Guide</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-dark-gray">Downloads</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-dark-gray">Conversions</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-dark-gray">Conv. Rate</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-dark-gray">Last Download</th>
                </tr>
              </thead>
              <tbody>
                {magnets.map((magnet) => {
                  const magnetStats = stats[magnet.id]
                  return (
                    <tr key={magnet.id} className="border-b border-light-gray hover:bg-off-white">
                      <td className="px-6 py-4 font-medium text-charcoal">
                        {magnet.title}
                      </td>
                      <td className="px-6 py-4 text-right text-charcoal">
                        {magnetStats?.total_downloads || 0}
                      </td>
                      <td className="px-6 py-4 text-right text-charcoal">
                        {magnetStats?.conversions || 0}
                      </td>
                      <td className="px-6 py-4 text-right text-charcoal">
                        {magnetStats?.conversion_rate.toFixed(1) || '0'}%
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-dark-gray">
                        {magnetStats?.last_download === 'Never'
                          ? 'Never'
                          : new Date(
                              magnetStats?.last_download || ''
                            ).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
