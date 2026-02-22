'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Shield, Key, Smartphone, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

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
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
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

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    
    if (strength <= 2) return { strength: 33, label: 'Weak', color: 'bg-muted' }
    if (strength <= 3) return { strength: 66, label: 'Medium', color: 'bg-muted' }
    return { strength: 100, label: 'Strong', color: 'bg-muted' }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Security</h1>
        <p className="text-foreground">Manage your account security settings</p>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border-2 border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <Key className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Change Password</h2>
            <p className="text-sm text-foreground">Update your password regularly for security</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border-2 border-border rounded-xl focus:border-border focus:outline-none transition-colors"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground hover:text-foreground"
              >
                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border-2 border-border rounded-xl focus:border-border focus:outline-none transition-colors"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Password strength indicator */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground">Password strength</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength.label === 'Strong' ? 'text-foreground' :
                    passwordStrength.label === 'Medium' ? 'text-foreground' :
                    'text-foreground'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                confirmPassword && confirmPassword !== newPassword
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-border focus:border-border'
              }`}
              placeholder="Confirm new password"
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="mt-1 text-sm text-foreground">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            className="w-full bg-muted text-white py-3 rounded-xl font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-xl border-2 border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Two-Factor Authentication</h2>
              <p className="text-sm text-foreground">Add an extra layer of security</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-muted text-foreground text-sm font-medium rounded-full">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-xl border-2 border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <Shield className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Active Sessions</h2>
            <p className="text-sm text-foreground">Manage your logged-in devices</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-foreground" />
              <div>
                <p className="font-medium text-foreground">Current Device</p>
                <p className="text-sm text-foreground">This browser session</p>
              </div>
            </div>
            <span className="text-xs text-foreground font-medium">Active Now</span>
          </div>
        </div>

        <button className="mt-4 w-full py-3 border-2 border-border text-foreground rounded-xl font-medium hover:border-border hover:text-foreground transition-colors">
          Sign Out All Other Devices
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border-2 border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-muted/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Danger Zone</h2>
            <p className="text-sm text-foreground">Irreversible actions</p>
          </div>
        </div>

        <button className="w-full py-3 border-2 border-border text-foreground rounded-xl font-medium hover:bg-muted/10 transition-colors">
          Delete Account
        </button>
        <p className="mt-2 text-xs text-foreground text-center">
          This will permanently delete your account and all associated data.
        </p>
      </div>
    </div>
  )
}
