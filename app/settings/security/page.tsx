'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Shield, Key, Smartphone, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react'

export default function SecurityPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const supabase = createClient()

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }

    setDeleting(true)
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete account')
      }
      await supabase.auth.signOut()
      toast.success('Account deleted successfully')
      window.location.href = '/?deleted=1'
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account')
      setDeleting(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      
      toast.success('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    
    if (strength <= 2) return { strength: 33, label: 'Weak', color: 'bg-[#ADB5BD]' }
    if (strength <= 3) return { strength: 66, label: 'Medium', color: 'bg-[#495057]' }
    return { strength: 100, label: 'Strong', color: 'bg-[#212529]' }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#212529]">Security</h1>
        <p className="text-sm text-[#495057] mt-1">Manage your account security settings</p>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg border border-[#E9ECEF] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-[#F8F9FA] flex items-center justify-center">
            <Key size={18} className="text-[#495057]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#212529]">Change Password</h2>
            <p className="text-sm text-[#495057]">Update your password regularly for security</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#212529] mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-[#E9ECEF] rounded-lg text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#212529] focus:ring-1 focus:ring-[#212529] outline-none transition-colors"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ADB5BD] hover:text-[#495057] focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1 rounded"
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#212529] mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-[#E9ECEF] rounded-lg text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#212529] focus:ring-1 focus:ring-[#212529] outline-none transition-colors"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ADB5BD] hover:text-[#495057] focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1 rounded"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#495057]">Password strength</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength.label === 'Strong' ? 'text-[#212529]' :
                    passwordStrength.label === 'Medium' ? 'text-[#495057]' :
                    'text-[#ADB5BD]'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-1.5 bg-[#E9ECEF] rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#212529] mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-[#212529] placeholder:text-[#ADB5BD] focus:outline-none transition-colors ${
                confirmPassword && confirmPassword !== newPassword
                  ? 'border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B]'
                  : 'border-[#E9ECEF] focus:border-[#212529] focus:ring-1 focus:ring-[#212529]'
              }`}
              placeholder="Confirm new password"
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="mt-1 text-xs text-[#FF6B6B]">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            className="w-full bg-[#212529] text-white py-2 rounded-lg font-semibold text-sm hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-lg border border-[#E9ECEF] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#F8F9FA] flex items-center justify-center">
              <Smartphone size={18} className="text-[#495057]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#212529]">Two-Factor Authentication</h2>
              <p className="text-sm text-[#495057]">Add an extra layer of security</p>
            </div>
          </div>
          <span className="px-2 py-1 bg-[#F8F9FA] text-[#495057] text-xs font-medium rounded-full border border-[#E9ECEF]">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-lg border border-[#E9ECEF] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-[#F8F9FA] flex items-center justify-center">
            <Shield size={18} className="text-[#495057]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#212529]">Active Sessions</h2>
            <p className="text-sm text-[#495057]">Manage your logged-in devices</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-lg border border-[#E9ECEF]">
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-[#212529]" />
              <div>
                <p className="font-medium text-[#212529] text-sm">Current Device</p>
                <p className="text-xs text-[#495057]">This browser session</p>
              </div>
            </div>
            <span className="text-xs text-[#212529] font-medium">Active Now</span>
          </div>
        </div>

        <button className="mt-4 w-full py-2 border border-[#E9ECEF] text-[#495057] rounded-lg font-medium text-sm hover:border-[#212529] hover:text-[#212529] transition-colors focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1">
          Sign Out All Other Devices
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg border border-[#FF6B6B]/30 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-[#FF6B6B]/10 flex items-center justify-center">
            <AlertTriangle size={18} className="text-[#FF6B6B]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#FF6B6B]">Danger Zone</h2>
            <p className="text-sm text-[#495057]">Irreversible actions</p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2 border border-[#FF6B6B] text-[#FF6B6B] rounded-lg font-medium text-sm hover:bg-[#FF6B6B]/10 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-1"
            >
              <Trash2 size={14} />
              Delete Account
            </button>
            <p className="mt-2 text-xs text-[#ADB5BD] text-center">
              This will permanently delete your account and all associated data.
            </p>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-[#FF6B6B]/5 border border-[#FF6B6B]/20 rounded-lg">
              <p className="text-sm font-medium text-[#212529] mb-1">Are you absolutely sure?</p>
              <p className="text-sm text-[#495057]">
                This will permanently delete your account, all your properties, messages, and reviews.
                <strong className="text-[#212529]"> This cannot be undone.</strong>
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#212529] mb-1.5">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg font-mono text-sm text-[#212529] placeholder:text-[#ADB5BD] focus:border-[#FF6B6B] focus:ring-1 focus:ring-[#FF6B6B] outline-none transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }}
                className="flex-1 py-2 border border-[#E9ECEF] text-[#495057] rounded-lg font-medium text-sm hover:border-[#212529] hover:text-[#212529] transition-colors focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== 'DELETE'}
                className="flex-1 py-2 bg-[#FF6B6B] text-white rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-1"
              >
                {deleting ? (
                  <><Loader2 size={14} className="animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 size={14} /> Delete Forever</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}