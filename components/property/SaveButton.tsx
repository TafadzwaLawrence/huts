'use client'

import { Heart } from 'lucide-react'

export default function SaveButton({ className }: { className?: string }) {
  return (
    <button
      onClick={(e) => e.preventDefault()}
      className={className || "absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors z-10"}
      aria-label="Save property"
    >
      <Heart size={18} className="text-[#495057]" />
    </button>
  )
}
