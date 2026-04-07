'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Briefcase, Home, Loader2, Check, Camera, Clock, Award, ExternalLink, X } from 'lucide-react';
import { UploadButton } from '@/lib/uploadthing';
import { toast } from 'sonner';
import type { Profile } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

interface ProfileFormProps {
  profile: Profile;
  userEmail: string;
  createdAt: string;
  isAgent?: boolean;
  agentType?: string | null;
  isPremier?: boolean;
  agentSlug?: string | null;
}

export default function ProfileForm({ profile, userEmail, createdAt, isAgent = false, agentType, isPremier = false, agentSlug }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [formData, setFormData] = useState({
    name: profile.full_name || '',
    phone: profile.phone || '',
    bio: profile.bio || '',
    role: profile.role as 'renter' | 'landlord' | 'agent',
  });

  useEffect(() => {
    const changed = 
      formData.name !== (profile.full_name || '') ||
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
          ...(isAgent ? {} : { role: formData.role }),
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

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Header - Avatar & Basic Info */}
      <div className="bg-white rounded-lg border border-[#E9ECEF] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-lg overflow-hidden border border-[#E9ECEF] bg-[#F8F9FA] flex items-center justify-center">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-[#ADB5BD]" />
              )}
            </div>
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
                  button: 'w-8 h-8 rounded-lg bg-[#212529] text-white hover:bg-black shadow-sm flex items-center justify-center p-0 ut-ready:bg-[#212529] ut-uploading:bg-[#495057] focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1',
                  allowedContent: 'hidden',
                }}
                content={{
                  button: <Camera className="h-3.5 w-3.5" />,
                }}
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[#212529]">{formData.name || 'Your Name'}</h2>
            <p className="text-sm text-[#495057] mt-0.5">{userEmail}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F8F9FA] text-[#495057] border border-[#E9ECEF]">
                {isAgent ? <Award size={12} /> : formData.role === 'landlord' ? <Briefcase size={12} /> : <Home size={12} />}
                {isAgent
                  ? (agentType === 'property_manager' ? 'Property Manager'
                    : agentType === 'home_builder' ? 'Home Builder'
                    : agentType === 'photographer' ? 'Photographer'
                    : 'Agent')
                  : formData.role === 'landlord' ? 'Landlord' : 'Renter'}
              </span>
              {isAgent && isPremier && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  <Award size={11} />
                  Premier
                </span>
              )}
              <span className="text-xs text-[#ADB5BD] flex items-center gap-1">
                <Clock size={12} />
                Joined {formatJoinDate(createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Type */}
      <div className="bg-white rounded-lg border border-[#E9ECEF] p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-base font-semibold text-[#212529] mb-1">Account Type</h3>
          <p className="text-sm text-[#495057]">Choose how you want to use Huts</p>
        </div>
        {isAgent ? (
          <div className="flex items-start gap-4 p-4 border border-[#212529] bg-[#F8F9FA] rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-[#212529] flex items-center justify-center shrink-0">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-base text-[#212529]">Agent Account</h4>
                {isPremier && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                    <Award size={9} />
                    Premier
                  </span>
                )}
              </div>
              <p className="text-sm text-[#495057] mt-1">
                Your account is registered as a licensed agent. To update your agent profile, specialisations, or service areas, use the Agent Portal.
              </p>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <Link
                  href="/dashboard/agent-profile"
                  className="text-sm font-medium text-[#212529] underline underline-offset-2 hover:no-underline"
                >
                  Edit Agent Profile
                </Link>
                {agentSlug && (
                  <Link
                    href={`/agent/${agentSlug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-sm text-[#495057] hover:text-[#212529] transition-colors"
                  >
                    <ExternalLink size={13} />
                    View Public Profile
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Renter Option */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'renter' })}
              className={`relative flex items-start gap-4 p-4 border rounded-lg transition-all text-left focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1 ${
                formData.role === 'renter'
                  ? 'border-[#212529] bg-[#F8F9FA]'
                  : 'border-[#E9ECEF] hover:border-[#ADB5BD]'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                formData.role === 'renter' ? 'bg-[#212529]' : 'bg-[#F8F9FA]'
              }`}>
                <Home className={`h-5 w-5 ${formData.role === 'renter' ? 'text-white' : 'text-[#495057]'}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-base text-[#212529] mb-0.5">Renter</h4>
                <p className="text-sm text-[#495057]">Find and rent properties</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                formData.role === 'renter' 
                  ? 'border-[#212529] bg-[#212529]' 
                  : 'border-[#E9ECEF]'
              }`}>
                {formData.role === 'renter' && <Check size={12} className="text-white" />}
              </div>
            </button>

            {/* Landlord Option */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'landlord' })}
              className={`relative flex items-start gap-4 p-4 border rounded-lg transition-all text-left focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1 ${
                formData.role === 'landlord'
                  ? 'border-[#212529] bg-[#F8F9FA]'
                  : 'border-[#E9ECEF] hover:border-[#ADB5BD]'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                formData.role === 'landlord' ? 'bg-[#212529]' : 'bg-[#F8F9FA]'
              }`}>
                <Briefcase className={`h-5 w-5 ${formData.role === 'landlord' ? 'text-white' : 'text-[#495057]'}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-base text-[#212529] mb-0.5">Landlord</h4>
                <p className="text-sm text-[#495057]">List and manage properties</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                formData.role === 'landlord' 
                  ? 'border-[#212529] bg-[#212529]' 
                  : 'border-[#E9ECEF]'
              }`}>
                {formData.role === 'landlord' && <Check size={12} className="text-white" />}
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg border border-[#E9ECEF] p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-base font-semibold text-[#212529] mb-1">Personal Information</h3>
          <p className="text-sm text-[#495057]">Update your contact details</p>
        </div>
        
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-[#212529] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:border-[#212529] focus:ring-1 focus:ring-[#212529] outline-none transition-colors text-[#212529] placeholder:text-[#ADB5BD]"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#212529] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={userEmail}
              disabled
              className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg bg-[#F8F9FA] text-[#495057] cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-[#212529] mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:border-[#212529] focus:ring-1 focus:ring-[#212529] outline-none transition-colors text-[#212529] placeholder:text-[#ADB5BD]"
              placeholder="+263 77 123 4567"
            />
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="bio" className="block text-sm font-semibold text-[#212529]">
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
              className="w-full px-3 py-2 border border-[#E9ECEF] rounded-lg focus:border-[#212529] focus:ring-1 focus:ring-[#212529] outline-none transition-colors resize-none text-[#212529] placeholder:text-[#ADB5BD]"
              placeholder="Tell potential landlords or renters about yourself..."
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-white rounded-lg border border-[#E9ECEF] p-4 shadow-sm flex items-center justify-end gap-3">
        {hasChanges && (
          <p className="text-sm text-[#495057] mr-auto">
            Unsaved changes
          </p>
        )}
        <button
          type="button"
          onClick={() => router.push('/dashboard/overview')}
          className="px-4 py-2 border border-[#E9ECEF] text-[#495057] rounded-lg hover:border-[#212529] hover:text-[#212529] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !hasChanges}
          className="px-5 py-2 bg-[#212529] text-white rounded-lg hover:bg-black transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#212529] focus:ring-offset-1"
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