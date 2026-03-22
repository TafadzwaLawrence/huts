import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Badge, Skeleton } from '@/components/ui'
import { formatPrice } from '@/lib/utils'
import type { Database } from '@/types/database'
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'

type Commission = Database['public']['Tables']['commissions']['Row'] & {
  transactions?: Database['public']['Tables']['transactions']['Row']
}

async function getCommissions(userId: string) {
  const supabase = await createClient()

  const { data: commissions, error } = await supabase
    .from('commissions')
    .select(`
      *,
      transactions(*)
    `)
    .eq('agent_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching commissions:', error)
    return []
  }

  return (commissions || []) as Commission[]
}

function calculateMetrics(commissions: Commission[]) {
  const totalEarned = commissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + (c.agent_commission || 0), 0)

  const totalPending = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + (c.agent_commission || 0), 0)

  const totalCancelled = commissions
    .filter(c => c.status === 'cancelled')
    .reduce((sum, c) => sum + (c.agent_commission || 0), 0)

  return {
    totalEarned,
    totalPending,
    totalCancelled,
    totalCount: commissions.length,
    paidCount: commissions.filter(c => c.status === 'paid').length,
    pendingCount: commissions.filter(c => c.status === 'pending').length,
    cancelledCount: commissions.filter(c => c.status === 'cancelled').length,
  }
}

async function CommissionsContent() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/signin')
  }

  // Check if user is agent
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'agent') {
    redirect('/dashboard')
  }

  const commissions = await getCommissions(user.id)
  const metrics = calculateMetrics(commissions)

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatPrice(metrics.totalEarned)}</p>
            <p className="text-xs text-gray-600 mt-1">
              {metrics.paidCount} transaction{metrics.paidCount !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {formatPrice(metrics.totalPending)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {metrics.pendingCount} transaction{metrics.pendingCount !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Average Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {metrics.totalCount > 0
                ? formatPrice(
                    (metrics.totalEarned + metrics.totalPending) / metrics.totalCount
                  )
                : '$0'}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {metrics.totalCount > 0
                ? Math.round((metrics.paidCount / metrics.totalCount) * 100)
                : 0}
              %
            </p>
            <p className="text-xs text-gray-600 mt-1">
              of transactions closed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commissions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Commissions</span>
            <Badge variant="outline">{metrics.totalCount}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="py-8 text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-600">No commissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Transaction
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Commission Rate
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Transaction Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Created
                    </th>
                    {metrics.paidCount > 0 && (
                      <th className="text-left py-3 px-4 font-semibold text-sm">
                        Paid
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {commissions.map(commission => (
                    <tr key={commission.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <a
                          href={`/agent/transactions/${commission.transaction_id}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {commission.transaction_id.slice(0, 8)}...
                        </a>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {formatPrice(commission.agent_commission || 0)}
                      </td>
                      <td className="py-3 px-4">
                        {Math.round((commission.agent_split_pct || 50) * 100) / 100}%
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            commission.status === 'paid'
                              ? 'solid'
                              : commission.status === 'pending'
                              ? 'default'
                              : 'outline'
                          }
                        >
                          {commission.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 capitalize">
                        {commission.transactions?.transaction_type || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {commission.created_at
                          ? new Date(commission.created_at).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      {metrics.paidCount > 0 && (
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {commission.paid_at
                            ? new Date(commission.paid_at).toLocaleDateString()
                            : '-'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CommissionsLoading() {
  return (
    <div className="space-y-6">
      {/* Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CommissionsDashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Commissions</h1>
        <p className="text-gray-600 mt-1">Track your earnings from transactions</p>
      </div>

      <Suspense fallback={<CommissionsLoading />}>
        <CommissionsContent />
      </Suspense>
    </div>
  )
}
