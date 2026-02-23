'use client'

import { useState } from 'react'
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Link2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface SocialShareButtonsProps {
  title: string
  url: string
  description?: string
}

export default function SocialShareButtons({ title, url, description }: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const shareUrl = encodeURIComponent(url)
  const shareTitle = encodeURIComponent(title)
  const shareDescription = encodeURIComponent(description || title)

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}&via=huts`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
    whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        })
      } catch (err) {
        // User cancelled or error - do nothing
      }
    } else {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className="relative">
      {/* Main share button */}
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#E9ECEF] rounded-lg hover:border-[#212529] transition-all group"
        aria-label="Share property"
      >
        <Share2 size={18} className="text-[#495057] group-hover:text-[#212529]" />
        <span className="text-sm font-medium text-[#495057] group-hover:text-[#212529]">
          Share
        </span>
      </button>

      {/* Share options dropdown (desktop fallback) */}
      {isOpen && !navigator.share && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#E9ECEF] z-50 overflow-hidden">
            <div className="p-3 border-b border-[#E9ECEF]">
              <p className="text-xs font-semibold text-[#212529] uppercase tracking-wide">
                Share Property
              </p>
            </div>

            <div className="p-2 space-y-1">
              {/* Facebook */}
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F8F9FA] transition-colors group"
                onClick={() => setIsOpen(false)}
              >
                <Facebook size={20} className="text-[#1877F2]" />
                <span className="text-sm font-medium text-[#495057] group-hover:text-[#212529]">
                  Facebook
                </span>
              </a>

              {/* Twitter */}
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F8F9FA] transition-colors group"
                onClick={() => setIsOpen(false)}
              >
                <Twitter size={20} className="text-[#1DA1F2]" />
                <span className="text-sm font-medium text-[#495057] group-hover:text-[#212529]">
                  Twitter
                </span>
              </a>

              {/* LinkedIn */}
              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F8F9FA] transition-colors group"
                onClick={() => setIsOpen(false)}
              >
                <Linkedin size={20} className="text-[#0A66C2]" />
                <span className="text-sm font-medium text-[#495057] group-hover:text-[#212529]">
                  LinkedIn
                </span>
              </a>

              {/* WhatsApp */}
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F8F9FA] transition-colors group"
                onClick={() => setIsOpen(false)}
              >
                <MessageCircle size={20} className="text-[#25D366]" />
                <span className="text-sm font-medium text-[#495057] group-hover:text-[#212529]">
                  WhatsApp
                </span>
              </a>

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#F8F9FA] transition-colors group"
              >
                {copied ? (
                  <Check size={20} className="text-[#51CF66]" />
                ) : (
                  <Link2 size={20} className="text-[#495057]" />
                )}
                <span className="text-sm font-medium text-[#495057] group-hover:text-[#212529]">
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
