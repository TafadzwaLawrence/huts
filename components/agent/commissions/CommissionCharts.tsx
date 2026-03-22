'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatPrice } from '@/lib/utils'
import type { Database } from '@/types/database'

type Transaction = Database['public']['Tables']['transactions']['Row']
type Commission = Database['public']['Tables']['commissions']['Row'] & {
  transactions?: Transaction | null
}

interface EarningsChartProps {
  commissions: Commission[]
}

/**
 * Line chart showing cumulative earnings over time
 */
export function EarningsChart({ commissions }: EarningsChartProps) {
  const chartData = useMemo(() => {
    // Group commissions by month
    const monthlyData: Record<string, number> = {}

    commissions
      .filter(c => c.status === 'paid')
      .forEach(commission => {
        const date = new Date(commission.paid_at || commission.created_at)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (commission.agent_commission || 0)
      })

    // Convert to sorted array and calculate cumulative
    const sortedMonths = Object.keys(monthlyData).sort()
    let cumulative = 0
    const data = sortedMonths.map(month => {
      cumulative += monthlyData[month]
      return {
        month,
        monthShort: month.split('-')[1],
        amount: monthlyData[month],
        cumulative,
      }
    })

    return data
  }, [commissions])

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earnings Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-600">
            No earnings data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxCumulative = Math.max(...chartData.map(d => d.cumulative), 1)
  const height = 250
  const width = 100
  const padding = 40

  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg width={chartData.length * width + padding * 2} height={height} className="mx-auto">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = height - padding - ratio * (height - padding * 2)
              return (
                <g key={i}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartData.length * width + padding}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <text x={padding - 10} y={y + 4} fontSize="12" fill="#999" textAnchor="end">
                    {formatPrice(maxCumulative * ratio)}
                  </text>
                </g>
              )
            })}

            {/* Cumulative line chart */}
            {chartData.length > 1 && (
              <polyline
                points={chartData
                  .map((d, i) => {
                    const x = padding + i * width + width / 2
                    const y = height - padding - (d.cumulative / maxCumulative) * (height - padding * 2)
                    return `${x},${y}`
                  })
                  .join(' ')}
                fill="none"
                stroke="#000"
                strokeWidth="2"
              />
            )}

            {/* Data points */}
            {chartData.map((d, i) => {
              const x = padding + i * width + width / 2
              const y = height - padding - (d.cumulative / maxCumulative) * (height - padding * 2)
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="4" fill="#fff" stroke="#000" strokeWidth="2" />
                  <text x={x} y={height - padding + 20} fontSize="12" textAnchor="middle" fill="#666">
                    {d.monthShort}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {chartData.map((d, i) => (
            <div key={i} className="border-l-4 border-black pl-3">
              <p className="text-sm font-semibold">{d.month}</p>
              <p className="text-sm text-gray-600">{formatPrice(d.cumulative)} cumulative</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface CommissionBreakdownProps {
  commissions: Commission[]
}

/**
 * Pie chart showing earnings by transaction type
 */
export function CommissionBreakdown({ commissions }: CommissionBreakdownProps) {
  const chartData = useMemo(() => {
    const breakdown: Record<string, number> = {}

    commissions.forEach(commission => {
      // Try to get type from the relationship, fallback to 'other'
      const type = commission.transactions?.transaction_type || 'other'
      breakdown[type] = (breakdown[type] || 0) + (commission.agent_commission || 0)
    })

    return Object.entries(breakdown).map(([type, amount]) => ({
      type,
      amount,
      percentage: 0, // Will calculate below
    }))
  }, [commissions])

  const total = chartData.reduce((sum, d) => sum + d.amount, 0)
  const data = chartData.map(d => ({
    ...d,
    percentage: total > 0 ? (d.amount / total) * 100 : 0,
  }))

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earnings by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-600">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const colors = ['#000000', '#404040', '#808080', '#c0c0c0']

  let currentAngle = 0
  const slices = data.map((d, i) => {
    const sliceAngle = (d.percentage / 100) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + sliceAngle

    const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180)
    const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180)
    const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180)
    const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180)

    const largeArc = sliceAngle > 180 ? 1 : 0
    const pathData = [
      `M 100 100`,
      `L ${x1} ${y1}`,
      `A 80 80 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ')

    currentAngle = endAngle

    return {
      path: pathData,
      color: colors[i % colors.length],
      ...d,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Pie Chart */}
          <svg width="200" height="200" className="flex-shrink-0">
            {slices.map((slice, i) => (
              <path
                key={i}
                d={slice.path}
                fill={slice.color}
                stroke="white"
                strokeWidth="2"
              />
            ))}
          </svg>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            {slices.map((slice, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="font-semibold capitalize">{slice.type}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(slice.amount)}</p>
                  <p className="text-sm text-gray-600">{Math.round(slice.percentage)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatusMetricsProps {
  commissions: Commission[]
}

/**
 * Bar chart showing commissions by status
 */
export function StatusMetrics({ commissions }: StatusMetricsProps) {
  const statusData = useMemo(() => {
    const statusBreakdown: Record<string, { count: number; amount: number }> = {
      paid: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      cancelled: { count: 0, amount: 0 },
    }

    commissions.forEach(commission => {
      const status = commission.status || 'pending'
      if (status in statusBreakdown) {
        statusBreakdown[status].count++
        statusBreakdown[status].amount += commission.agent_commission || 0
      }
    })

    return statusBreakdown
  }, [commissions])

  const maxAmount = Math.max(
    statusData.paid.amount,
    statusData.pending.amount,
    statusData.cancelled.amount,
    1
  )

  const statusColors = {
    paid: '#000000',
    pending: '#808080',
    cancelled: '#c0c0c0',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commissions by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(statusData).map(([status, data]) => {
            const percentage = (data.amount / maxAmount) * 100
            return (
              <div key={status}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold capitalize">{status}</p>
                    <p className="text-sm text-gray-600">{data.count} transaction{data.count !== 1 ? 's' : ''}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(data.amount)}</p>
                </div>
                <div className="w-full bg-gray-200 rounded h-8 overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: statusColors[status as keyof typeof statusColors],
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
