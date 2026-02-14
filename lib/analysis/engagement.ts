import { createClient } from '@/lib/supabase/server'

export interface ViewStats {
  total: number
  last7Days: number
  last30Days: number
  uniqueViewers: number
}

export interface EngagementMetrics {
  propertyId: string
  views: ViewStats & { trend: 'up' | 'down' | 'stable' }
  inquiries: {
    total: number
    unread: number
    replied: number
    conversionRate: number
  }
  saves: number
  averageResponseTime: number | null
}

/**
 * Get comprehensive engagement metrics for a property
 */
export async function getPropertyEngagement(propertyId: string): Promise<EngagementMetrics> {
  const supabase = await createClient()
  
  // Parallel queries for performance
  const [viewsResult, inquiriesResult, savesResult] = await Promise.all([
    // Views with date breakdown
    supabase
      .from('property_views')
      .select('viewed_at, viewer_id, session_id')
      .eq('property_id', propertyId),
    
    // Inquiries with status
    supabase
      .from('inquiries')
      .select('id, status, created_at, replied_at')
      .eq('property_id', propertyId),
    
    // Saves count
    supabase
      .from('saved_properties')
      .select('user_id', { count: 'exact' })
      .eq('property_id', propertyId)
  ])

  const views = viewsResult.data || []
  const inquiries = inquiriesResult.data || []
  const saves = savesResult.count || 0

  // Calculate view stats
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const last7Days = views.filter(v => new Date(v.viewed_at) >= sevenDaysAgo).length
  const last30Days = views.filter(v => new Date(v.viewed_at) >= thirtyDaysAgo).length
  
  // Count unique viewers (by user_id or session_id)
  const uniqueViewers = new Set(
    views.map(v => v.viewer_id || v.session_id).filter(Boolean)
  ).size

  // Calculate trend
  const trend = calculateTrend(last7Days, last30Days)

  // Calculate inquiry stats
  const unreadCount = inquiries.filter(i => i.status === 'unread').length
  const repliedCount = inquiries.filter(i => i.status === 'replied').length
  const conversionRate = views.length > 0 ? (inquiries.length / views.length) * 100 : 0

  // Calculate average response time (in hours)
  const responseTimes = inquiries
    .filter(i => i.replied_at && i.created_at)
    .map(i => {
      const created = new Date(i.created_at).getTime()
      const replied = new Date(i.replied_at).getTime()
      return (replied - created) / (1000 * 60 * 60) // hours
    })
  
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : null

  return {
    propertyId,
    views: {
      total: views.length,
      last7Days,
      last30Days,
      uniqueViewers,
      trend
    },
    inquiries: {
      total: inquiries.length,
      unread: unreadCount,
      replied: repliedCount,
      conversionRate: Math.round(conversionRate * 100) / 100
    },
    saves,
    averageResponseTime: avgResponseTime ? Math.round(avgResponseTime * 10) / 10 : null
  }
}

/**
 * Calculate trend based on weekly view average
 */
function calculateTrend(last7Days: number, last30Days: number): 'up' | 'down' | 'stable' {
  const recentWeeklyAvg = last7Days / 7
  const olderWeeklyAvg = (last30Days - last7Days) / 23 // remaining 23 days

  const percentChange = olderWeeklyAvg > 0 
    ? ((recentWeeklyAvg - olderWeeklyAvg) / olderWeeklyAvg) * 100
    : (recentWeeklyAvg > 0 ? 100 : 0)

  if (percentChange > 10) return 'up'
  if (percentChange < -10) return 'down'
  return 'stable'
}

/**
 * Get engagement comparison with similar properties
 */
export async function getEngagementBenchmark(propertyId: string): Promise<{
  property: EngagementMetrics
  marketAverage: { views: number; inquiries: number; saves: number }
  percentile: { views: number; inquiries: number; saves: number }
}> {
  const supabase = await createClient()
  
  // Get property details
  const { data: property } = await supabase
    .from('properties')
    .select('city, listing_type, beds')
    .eq('id', propertyId)
    .single()

  if (!property) throw new Error('Property not found')

  // Get similar properties
  const { data: similarProps } = await supabase
    .from('properties')
    .select('id')
    .eq('city', property.city)
    .eq('listing_type', property.listing_type)
    .eq('status', 'active')
    .gte('beds', Math.max(0, property.beds - 1))
    .lte('beds', property.beds + 1)
    .limit(50)

  const propertyMetrics = await getPropertyEngagement(propertyId)
  
  // Get metrics for similar properties
  const similarMetrics = await Promise.all(
    (similarProps || [])
      .filter(p => p.id !== propertyId)
      .slice(0, 20)
      .map(p => getPropertyEngagement(p.id))
  )

  // Calculate averages
  const avgViews = similarMetrics.length > 0
    ? similarMetrics.reduce((sum, m) => sum + m.views.total, 0) / similarMetrics.length
    : 0
  const avgInquiries = similarMetrics.length > 0
    ? similarMetrics.reduce((sum, m) => sum + m.inquiries.total, 0) / similarMetrics.length
    : 0
  const avgSaves = similarMetrics.length > 0
    ? similarMetrics.reduce((sum, m) => sum + m.saves, 0) / similarMetrics.length
    : 0

  // Calculate percentiles
  const viewsSorted = similarMetrics.map(m => m.views.total).sort((a, b) => a - b)
  const inquiriesSorted = similarMetrics.map(m => m.inquiries.total).sort((a, b) => a - b)
  const savesSorted = similarMetrics.map(m => m.saves).sort((a, b) => a - b)

  return {
    property: propertyMetrics,
    marketAverage: {
      views: Math.round(avgViews),
      inquiries: Math.round(avgInquiries * 10) / 10,
      saves: Math.round(avgSaves)
    },
    percentile: {
      views: calculatePercentile(propertyMetrics.views.total, viewsSorted),
      inquiries: calculatePercentile(propertyMetrics.inquiries.total, inquiriesSorted),
      saves: calculatePercentile(propertyMetrics.saves, savesSorted)
    }
  }
}

function calculatePercentile(value: number, sortedArray: number[]): number {
  if (sortedArray.length === 0) return 50
  const index = sortedArray.findIndex(v => v >= value)
  if (index === -1) return 100
  return Math.round((index / sortedArray.length) * 100)
}
