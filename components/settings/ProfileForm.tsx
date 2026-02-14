'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Briefcase, Home, Loader2, Check, Camera, Sparkles, Shield, Clock } from 'lucide-react';
import { UploadButton } from '@/lib/uploadthing';
import { toast } from 'sonner';
import type { Profile } from '@/types';

interface ProfileFormProps {
  profile: Profile;
  userEmail: string;
  createdAt: string;
}

export default function ProfileForm({ profile, userEmail, createdAt }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [formData, setFormData] = useState({
    name: profile.name || '',
    phone: profile.phone || '',
    bio: profile.bio || '',
    role: profile.role as 'renter' | 'landlord',
  });

  // Track changes
  useEffect(() => {
    const changed = 
      formData.name !== (profile.name || '') ||
      formData.phone !== (profile.phone || '') ||
      formData.bio !== (profile.bio || '') ||
      formData.role !== profile.role ||
      avatarUrl !== (profile.avatar_url || '');
    setHasChanges(changed);
  }, [formData, avatarUrl, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.bio.length > 500) {
      toast.error('Bio must be 500 characters or less');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name || null,
          phone: formData.phone || null,
          bio: formData.bio || null,
          role: formData.role,
          avatar_url: avatarUrl || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      router.refresh();
      setHasChanges(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const profileCompletion = () => {
    let completed = 0;
    if (formData.name) completed++;
    if (formData.phone) completed++;
    if (formData.bio) completed++;
    if (avatarUrl) completed++;
    if (formData.role) completed++;
    return Math.round((completed / 5) * 100);
  };

  const completionPercent = profileCompletion();

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-[#212529] to-[#495057] rounded-2xl p-8 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white/20 bg-white/10 flex items-center justify-center shadow-xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-14 w-14 text-white/60" />
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-8 w-8 text-white" />
            </div>
            {/* Upload overlay */}
            <div className="absolute -bottom-2 -right-2">
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res: any) => {
                  if (res?.[0]?.url) {
                    setAvatarUrl(res[0].url);
                    toast.success('Photo uploaded!');
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Upload failed: ${error.message}`);
                }}
                appearance={{
                  button: 'h-10 w-10 rounded-full bg-white text-[#212529] hover:bg-gray-100 shadow-lg flex items-center justify-center p-0 ut-ready:bg-white ut-uploading:bg-gray-200',
                  allowedContent: 'hidden',
                }}
                content={{
                  button: <Camera className="h-5 w-5" />,
                }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-2xl font-bold">{formData.name || 'Your Name'}</h3>
            <p className="text-white/70 mt-1">{userEmail}</p>
            <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                formData.role === 'landlord' 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/20 text-white'
              }`}>
                {formData.role === 'landlord' ? <Briefcase size={14} /> : <Home size={14} />}
                {formData.role === 'landlord' ? 'Landlord' : 'Renter'}
              </span>
              <span className="text-white/50 text-sm flex items-center gap-1">
                <Clock size={14} />
                Joined {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Completion Ring */}
          <div className="relative">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="6"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke={completionPercent === 100 ? '#212529' : 'white'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(completionPercent / 100) * 226} 226`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">{completionPercent}%</span>
            </div>
          </div>
        </div>

        {/* Completion checklist */}
        <div className="relative mt-6 pt-6 border-t border-white/10">
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            {[
              { label: 'Name', completed: !!formData.name },
              { label: 'Phone', completed: !!formData.phone },
              { label: 'Bio', completed: !!formData.bio },
              { label: 'Photo', completed: !!avatarUrl },
              { label: 'Role', completed: !!formData.role },
            ].map(({ label, completed }) => (
              <span
                key={label}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  completed
                    ? 'bg-[#212529]/20 text-[#212529]'
                    : 'bg-white/10 text-white/50'
                }`}
              >
                {completed ? <Check size={12} /> : <span className="w-3 h-3 rounded-full border border-current" />}
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Account Type */}
      <div className="bg-white border border-[#E9ECEF] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-[#495057]" />
            <h3 className="font-semibold text-[#212529]">Account Type</h3>
          </div>
          <span className="text-xs text-[#ADB5BD] bg-[#F8F9FA] px-3 py-1 rounded-full">
            You can switch anytime
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Renter Option */}
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'renter' })}
            className={`relative border-2 rounded-2xl p-6 transition-all text-left group overflow-hidden ${
              formData.role === 'renter'
                ? 'border-[#212529] bg-[#F8F9FA] shadow-xl scale-[1.02]'
                : 'border-[#E9ECEF] hover:border-[#ADB5BD] hover:shadow-md bg-white'
            }`}
          >
            {/* Background decoration */}
            {formData.role === 'renter' && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#212529]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            )}
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                  formData.role === 'renter' ? 'bg-[#212529]' : 'bg-[#F8F9FA]'
                }`}>
                  <Home className={`h-7 w-7 ${formData.role === 'renter' ? 'text-white' : 'text-[#495057]'}`} />
                </div>
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  formData.role === 'renter' 
                    ? 'border-[#212529] bg-[#212529]' 
                    : 'border-[#E9ECEF] group-hover:border-[#ADB5BD]'
                }`}>
                  {formData.role === 'renter' && <Check size={14} className="text-white" />}
                </div>
              </div>
              
              <h4 className="font-bold text-xl mb-1 text-[#212529]">Renter</h4>
              <p className="text-sm mb-4 text-[#495057]">
                Find your perfect home
              </p>
              
              {/* Features */}
              <ul className="space-y-2 text-sm text-[#495057]">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#212529]" />
                  Search & filter properties
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#212529]" />
                  Save favorites
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#212529]" />
                  Message landlords directly
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#212529]" />
                  Get new listing alerts
                </li>
              </ul>
            </div>
          </button>

          {/* Landlord Option */}
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'landlord' })}
            className={`relative border-2 rounded-2xl p-6 transition-all text-left group overflow-hidden ${
              formData.role === 'landlord'
                ? 'border-[#212529] bg-[#F8F9FA] shadow-xl scale-[1.02]'
                : 'border-[#E9ECEF] hover:border-[#ADB5BD] hover:shadow-md bg-white'
            }`}
          >
            {/* Background decoration */}
            {formData.role === 'landlord' && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#212529]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            )}
            
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                  formData.role === 'landlord' ? 'bg-[#212529]' : 'bg-[#F8F9FA]'
                }`}>
                  <Briefcase className={`h-7 w-7 ${formData.role === 'landlord' ? 'text-white' : 'text-[#495057]'}`} />
                </div>
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  formData.role === 'landlord' 
                    ? 'border-[#212529] bg-[#212529]' 
                    : 'border-[#E9ECEF] group-hover:border-[#ADB5BD]'
                }`}>
                  {formData.role === 'landlord' && <Check size={14} className="text-white" />}
                </div>
              </div>
              
              <h4 className="font-bold text-xl mb-1 text-[#212529]">Landlord</h4>
              <p className="text-sm mb-4 text-[#495057]">
                List and grow your portfolio
              </p>
              
              {/* Features */}
              <ul className="space-y-2 text-sm text-[#495057]">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#212529]" />
                  List unlimited properties
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#212529]" />
                  Manage inquiries & messages
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#212529]" />
                  Analytics & insights
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#212529]" />
                  Verified landlord badge
                </li>
              </ul>
            </div>
          </button>
        </div>
        
        {/* Role switch note */}
        <div className="mt-4 p-3 bg-[#F8F9FA] rounded-xl flex items-start gap-3">
          <Sparkles size={16} className="text-[#495057] mt-0.5 shrink-0" />
          <p className="text-xs text-[#495057]">
            <strong>Tip:</strong> You can be both! Switch between roles anytime. As a landlord, you can still browse and save properties.
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white border border-[#E9ECEF] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <User size={18} className="text-[#495057]" />
          <h3 className="font-semibold text-[#212529]">Personal Information</h3>
        </div>
        
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#495057] mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl focus:border-[#212529] focus:outline-none transition-colors text-[#212529] placeholder:text-[#ADB5BD]"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#495057] mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={userEmail}
                disabled
                className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl bg-[#F8F9FA] text-[#495057] cursor-not-allowed pr-24"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#ADB5BD] bg-[#E9ECEF] px-2.5 py-1 rounded-full">
                Cannot change
              </span>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#495057] mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl focus:border-[#212529] focus:outline-none transition-colors text-[#212529] placeholder:text-[#ADB5BD]"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="bio" className="block text-sm font-medium text-[#495057]">
                Bio
              </label>
              <span className={`text-xs font-medium ${
                formData.bio.length > 450 ? 'text-[#FF6B6B]' : 'text-[#ADB5BD]'
              }`}>
                {formData.bio.length}/500
              </span>
            </div>
            <textarea
              id="bio"
              rows={4}
              value={formData.bio}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setFormData({ ...formData, bio: e.target.value });
                }
              }}
              maxLength={500}
              className="w-full px-4 py-3 border-2 border-[#E9ECEF] rounded-xl focus:border-[#212529] focus:outline-none transition-colors resize-none text-[#212529] placeholder:text-[#ADB5BD]"
              placeholder="Tell potential landlords or renters about yourself..."
            />
            {formData.bio.length > 450 && (
              <p className="text-xs text-[#FF6B6B] mt-1 flex items-center gap-1">
                <Sparkles size={12} />
                Almost at the character limit!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button - Fixed at bottom on mobile */}
      <div className="sticky bottom-4 bg-white/80 backdrop-blur-sm border border-[#E9ECEF] rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            {hasChanges ? (
              <p className="text-sm text-[#495057] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B6B] animate-pulse" />
                You have unsaved changes
              </p>
            ) : (
              <p className="text-sm text-[#212529] flex items-center gap-2">
                <Check size={14} />
                All changes saved
              </p>
            )}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => router.push('/dashboard/overview')}
              className="flex-1 sm:flex-initial px-6 py-3 border-2 border-[#E9ECEF] text-[#495057] rounded-xl hover:border-[#ADB5BD] transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !hasChanges}
              className="flex-1 sm:flex-initial px-8 py-3 bg-[#212529] text-white rounded-xl hover:bg-black transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
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
    </form>
  );
}
