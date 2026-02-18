'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Building2,
  Home,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: string
  avatar_url: string | null
  verified: boolean | null
  bio: string | null
  created_at: string | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [roleFilter, setRoleFilter] = useState('all')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users?role=${roleFilter}&page=${page}&limit=20`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setUsers(data.users)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [roleFilter])

  useEffect(() => {
    fetchUsers()
  }, [page, roleFilter])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#212529]">Users</h1>
          <p className="text-sm text-[#ADB5BD] mt-1">{total} total users</p>
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-0.5 bg-[#F8F9FA] p-0.5 rounded-full border border-[#E9ECEF]">
          {['all', 'landlord', 'renter'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                roleFilter === r
                  ? 'bg-[#212529] text-white shadow-sm'
                  : 'text-[#495057] hover:text-[#212529]'
              }`}
            >
              {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[#F1F3F5]">
              <div className="w-10 h-10 bg-[#E9ECEF] rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#E9ECEF] rounded animate-pulse w-1/3" />
                <div className="h-3 bg-[#E9ECEF] rounded animate-pulse w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E9ECEF] py-20 text-center">
          <Users size={40} className="mx-auto text-[#E9ECEF] mb-3" />
          <h3 className="font-semibold text-[#212529] mb-1">No users found</h3>
          <p className="text-sm text-[#ADB5BD]">
            {roleFilter !== 'all' ? `No ${roleFilter}s found` : 'No users in the system'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-[#E9ECEF] overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[#F8F9FA] text-[10px] font-semibold text-[#ADB5BD] uppercase tracking-wider border-b border-[#E9ECEF]">
              <div className="col-span-4">User</div>
              <div className="col-span-3">Contact</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Joined</div>
              <div className="col-span-1">Verified</div>
            </div>

            <div className="divide-y divide-[#F1F3F5]">
              {users.map((u) => (
                <div key={u.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors">
                  {/* User */}
                  <div className="md:col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center text-sm font-bold text-[#495057] flex-shrink-0 border border-[#E9ECEF]">
                      {(u.name || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#212529] truncate">{u.name || 'No name'}</p>
                      <p className="text-xs text-[#ADB5BD] truncate md:hidden">{u.email}</p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="md:col-span-3 hidden md:block min-w-0">
                    <p className="text-xs text-[#495057] truncate flex items-center gap-1">
                      <Mail size={10} className="flex-shrink-0" /> {u.email}
                    </p>
                    {u.phone && (
                      <p className="text-xs text-[#ADB5BD] truncate flex items-center gap-1 mt-0.5">
                        <Phone size={10} className="flex-shrink-0" /> {u.phone}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div className="md:col-span-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      u.role === 'landlord'
                        ? 'bg-[#212529] text-white'
                        : 'bg-[#F8F9FA] text-[#495057] border border-[#E9ECEF]'
                    }`}>
                      {u.role === 'landlord' ? <Building2 size={10} /> : <Home size={10} />}
                      {u.role}
                    </span>
                  </div>

                  {/* Joined */}
                  <div className="md:col-span-2 hidden md:block">
                    <p className="text-xs text-[#ADB5BD] flex items-center gap-1">
                      <Calendar size={10} />
                      {u.created_at 
                        ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'
                      }
                    </p>
                  </div>

                  {/* Verified */}
                  <div className="md:col-span-1 hidden md:block">
                    <span className={`w-2 h-2 rounded-full inline-block ${u.verified ? 'bg-[#51CF66]' : 'bg-[#E9ECEF]'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-[#E9ECEF] text-[#495057] hover:border-[#212529] disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-[#495057] px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-[#E9ECEF] text-[#495057] hover:border-[#212529] disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
