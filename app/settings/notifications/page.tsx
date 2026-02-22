'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Home, 
  Heart, 
  Star, 
  DollarSign,
  Loader2,
  Smartphone,
  Globe,
  Clock
} from 'lucide-react'

interface NotificationSettings {
  // Email notifications
  email_new_messages: boolean
  email_property_inquiries: boolean
  email_saved_property_updates: boolean
  email_review_notifications: boolean
  email_marketing: boolean
  email_weekly_digest: boolean
  
  // Push notifications
  push_new_messages: boolean
  push_property_inquiries: boolean
  push_saved_property_updates: boolean
  push_review_notifications: boolean
  
  // In-app notifications
  inapp_new_messages: boolean
  inapp_property_inquiries: boolean
  inapp_saved_property_updates: boolean
  inapp_review_notifications: boolean
}

const defaultSettings: NotificationSettings = {
  email_new_messages: true,
  email_property_inquiries: true,
  email_saved_property_updates: true,
  email_review_notifications: true,
  email_marketing: false,
  email_weekly_digest: true,
  push_new_messages: true,
  push_property_inquiries: true,
  push_saved_property_updates: false,
  push_review_notifications: true,
  inapp_new_messages: true,
  inapp_property_inquiries: true,
  inapp_saved_property_updates: true,
  inapp_review_notifications: true,
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    // Load notification settings from localStorage (or could be from DB)
    const saved = localStorage.getItem('notification_settings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    
    // Simulate API call - in production, save to database
    await new Promise(resolve => setTimeout(resolve, 500))
    localStorage.setItem('notification_settings', JSON.stringify(settings))
    
    setSaving(false)
    setHasChanges(false)
    toast.success('Notification preferences saved')
  }

  const toggleAllInCategory = (category: 'email' | 'push' | 'inapp', value: boolean) => {
    const updates: Partial<NotificationSettings> = {}
    Object.keys(settings).forEach(key => {
      if (key.startsWith(category)) {
        updates[key as keyof NotificationSettings] = value
      }
    })
    setSettings(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-foreground">Choose how you want to be notified</p>
      </div>

      {/* Email Notifications */}
      <div className="bg-white rounded-xl border-2 border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Mail className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Email Notifications</h2>
              <p className="text-sm text-foreground">Receive updates via email</p>
            </div>
          </div>
          <button
            onClick={() => toggleAllInCategory('email', !settings.email_new_messages)}
            className="text-sm text-foreground hover:text-foreground transition-colors"
          >
            Toggle all
          </button>
        </div>
        
        <div className="divide-y divide-border">
          <NotificationToggle
            icon={MessageSquare}
            title="New Messages"
            description="When someone sends you a message"
            checked={settings.email_new_messages}
            onChange={(v) => updateSetting('email_new_messages', v)}
          />
          <NotificationToggle
            icon={Home}
            title="Property Inquiries"
            description="When someone inquires about your property"
            checked={settings.email_property_inquiries}
            onChange={(v) => updateSetting('email_property_inquiries', v)}
          />
          <NotificationToggle
            icon={Heart}
            title="Saved Property Updates"
            description="Price changes or status updates on saved properties"
            checked={settings.email_saved_property_updates}
            onChange={(v) => updateSetting('email_saved_property_updates', v)}
          />
          <NotificationToggle
            icon={Star}
            title="Review Notifications"
            description="When you receive a new review"
            checked={settings.email_review_notifications}
            onChange={(v) => updateSetting('email_review_notifications', v)}
          />
          <NotificationToggle
            icon={DollarSign}
            title="Marketing & Promotions"
            description="Tips, product updates, and promotional offers"
            checked={settings.email_marketing}
            onChange={(v) => updateSetting('email_marketing', v)}
          />
          <NotificationToggle
            icon={Clock}
            title="Weekly Digest"
            description="Summary of activity on your account"
            checked={settings.email_weekly_digest}
            onChange={(v) => updateSetting('email_weekly_digest', v)}
          />
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white rounded-xl border-2 border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Push Notifications</h2>
              <p className="text-sm text-foreground">Receive push notifications on your devices</p>
            </div>
          </div>
          <button
            onClick={() => toggleAllInCategory('push', !settings.push_new_messages)}
            className="text-sm text-foreground hover:text-foreground transition-colors"
          >
            Toggle all
          </button>
        </div>
        
        <div className="divide-y divide-border">
          <NotificationToggle
            icon={MessageSquare}
            title="New Messages"
            description="Instant alerts for new messages"
            checked={settings.push_new_messages}
            onChange={(v) => updateSetting('push_new_messages', v)}
          />
          <NotificationToggle
            icon={Home}
            title="Property Inquiries"
            description="Get notified when someone shows interest"
            checked={settings.push_property_inquiries}
            onChange={(v) => updateSetting('push_property_inquiries', v)}
          />
          <NotificationToggle
            icon={Heart}
            title="Saved Property Updates"
            description="Updates on your saved properties"
            checked={settings.push_saved_property_updates}
            onChange={(v) => updateSetting('push_saved_property_updates', v)}
          />
          <NotificationToggle
            icon={Star}
            title="Review Notifications"
            description="New reviews on your properties"
            checked={settings.push_review_notifications}
            onChange={(v) => updateSetting('push_review_notifications', v)}
          />
        </div>
      </div>

      {/* In-App Notifications */}
      <div className="bg-white rounded-xl border-2 border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Globe className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">In-App Notifications</h2>
              <p className="text-sm text-foreground">Notifications shown while using Huts</p>
            </div>
          </div>
          <button
            onClick={() => toggleAllInCategory('inapp', !settings.inapp_new_messages)}
            className="text-sm text-foreground hover:text-foreground transition-colors"
          >
            Toggle all
          </button>
        </div>
        
        <div className="divide-y divide-border">
          <NotificationToggle
            icon={MessageSquare}
            title="New Messages"
            description="Show notification badge for new messages"
            checked={settings.inapp_new_messages}
            onChange={(v) => updateSetting('inapp_new_messages', v)}
          />
          <NotificationToggle
            icon={Home}
            title="Property Inquiries"
            description="In-app alerts for inquiries"
            checked={settings.inapp_property_inquiries}
            onChange={(v) => updateSetting('inapp_property_inquiries', v)}
          />
          <NotificationToggle
            icon={Heart}
            title="Saved Property Updates"
            description="Alerts for saved property changes"
            checked={settings.inapp_saved_property_updates}
            onChange={(v) => updateSetting('inapp_saved_property_updates', v)}
          />
          <NotificationToggle
            icon={Star}
            title="Review Notifications"
            description="Show when you receive reviews"
            checked={settings.inapp_review_notifications}
            onChange={(v) => updateSetting('inapp_review_notifications', v)}
          />
        </div>
      </div>

      {/* Quiet Hours - Coming Soon */}
      <div className="bg-white rounded-xl border-2 border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Clock className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Quiet Hours</h2>
              <p className="text-sm text-foreground">Pause notifications during specific hours</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-muted text-foreground text-sm font-medium rounded-full">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-muted rounded-full animate-pulse" />
              <span className="text-sm text-foreground">You have unsaved changes</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const saved = localStorage.getItem('notification_settings')
                  if (saved) setSettings(JSON.parse(saved))
                  else setSettings(defaultSettings)
                  setHasChanges(false)
                }}
                className="px-4 py-2 text-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-muted text-white px-6 py-2 rounded-xl font-medium hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Toggle Component
function NotificationToggle({
  icon: Icon,
  title,
  description,
  checked,
  onChange
}: {
  icon: React.ElementType
  title: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-foreground" />
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-muted' : 'bg-muted'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
