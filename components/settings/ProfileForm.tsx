'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Briefcase, Home, Loader2, Check, Camera, Clock } from 'lucide-react';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Header - Clean */}
      <div className="bg-white border border-[#E9ECEF] rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-[#E9ECEF] bg-[#F8F9FA] flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-[#ADB5BD]" />
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
            {/* Upload overlay */}
            <div className="absolute -bottom-1 -right-1">
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
                  button: 'h-9 w-9 rounded-full bg-[#212529] text-white hover:bg-black shadow-sm flex items-center justify-center p-0 ut-ready:bg-[#212529] ut-uploading:bg-[#495057]',
                  allowedContent: 'hidden',
                }}
                content={{
                  button: <Camera className="h-4 w-4" />,
                }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[#212529]">{formData.name || 'Your Name'}</h2>
            <p className="text-sm text-[#495057] mt-1">{userEmail}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F8F9FA] text-[#495057] border border-[#E9ECEF]">
                {formData.role === 'landlord' ? <Briefcase size={12} /> : <Home size={12} />}
                {formData.role === 'landlord' ? 'Landlord' : 'Renter'}
              </span>
              <span className="text-xs text-[#ADB5BD] flex items-center gap-1">
                <Clock size={12} />
                Joined {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Type */}
      <div className="bg-white border border-[#E9ECEF] rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-[#212529] mb-1">Account Type</h3>
          <p className="text-sm text-[#495057]">Choose how you want to use Huts</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Renter Option */}
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'renter' })}
            className={`border rounded-lg p-5 transition-all text-left ${
              formData.role === 'renter'
                ? 'border-[#212529] bg-[#F8F9FA]'
                : 'border-[#E9ECEF] hover:border-[#212529]'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                formData.role === 'renter' ? 'bg-[#212529]' : 'bg-[#F8F9FA]'
              }`}>
                <Home className={`h-6 w-6 ${formData.role === 'renter' ? 'text-white' : 'text-[#495057]'}`} />
              </div>
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                formData.role === 'renter' 
                  ? 'border-[#212529] bg-[#212529]' 
                  : 'border-[#E9ECEF]'
              }`}>
                {formData.role === 'renter' && <Check size={12} className="text-white" />}
              </div>
            </div>
            
            <h4 className="font-semibold text-base mb-1 text-[#212529]">Renter</h4>
            <p className="text-sm text-[#495057]">
              Find and rent properties
            </p>
          </button>

          {/* Landlord Option */}
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'landlord' })}
            className={`border rounded-lg p-5 transition-all text-left ${
              formData.role === 'landlord'
                ? 'border-[#212529] bg-[#F8F9FA]'
                : 'border-[#E9ECEF] hover:border-[#212529]'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                formData.role === 'landlord' ? 'bg-[#212529]' : 'bg-[#F8F9FA]'
              }`}>
                <Briefcase className={`h-6 w-6 ${formData.role === 'landlord' ? 'text-white' : 'text-[#495057]'}`} />
              </div>
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                formData.role === 'landlord' 
                  ? 'border-[#212529] bg-[#212529]' 
                  : 'border-[#E9ECEF]'
              }`}>
                {formData.role === 'landlord' && <Check size={12} className="text-white" />}
              </div>
            </div>
            
            <h4 className="font-semibold text-base mb-1 text-[#212529]">Landlord</h4>
            <p className="text-sm text-[#495057]">
              List and manage properties
            </p>
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white border border-[#E9ECEF] rounded-lg p-6">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-[#212529] mb-1">Personal Information</h3>
          <p className="text-sm text-[#495057]">Update your contact details</p>
        </div>
        
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#212529] mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-[#E9ECEF] rounded-lg focus:border-[#212529] focus:outline-none transition-colors text-[#212529] placeholder:text-[#ADB5BD]"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#212529] mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={userEmail}
              disabled
              className="w-full px-3 py-2.5 border border-[#E9ECEF] rounded-lg bg-[#F8F9FA] text-[#ADB5BD] cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#212529] mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2.5 border border-[#E9ECEF] rounded-lg focus:border-[#212529] focus:outline-none transition-colors text-[#212529] placeholder:text-[#ADB5BD]"
              placeholder="+263 77 123 4567"
            />
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="bio" className="block text-sm font-medium text-[#212529]">
                Bio
              </label>
              <span className={`text-xs ${
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
              className="w-full px-3 py-2.5 border border-[#E9ECEF] rounded-lg focus:border-[#212529] focus:outline-none transition-colors resize-none text-[#212529] placeholder:text-[#ADB5BD]"
              placeholder="Tell potential landlords or renters about yourself..."
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-white border-t border-[#E9ECEF] pt-6 flex items-center justify-end gap-3">
        {hasChanges && (
          <p className="text-sm text-[#495057] mr-auto">
            Unsaved changes
          </p>
        )}
        <button
          type="button"
          onClick={() => router.push('/dashboard/overview')}
          className="px-5 py-2.5 border border-[#E9ECEF] text-[#495057] rounded-lg hover:border-[#212529] transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !hasChanges}
          className="px-6 py-2.5 bg-[#212529] text-white rounded-lg hover:bg-black transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
    </form>
  );
}
