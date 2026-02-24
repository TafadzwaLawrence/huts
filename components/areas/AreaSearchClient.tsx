'use client'

import { useEffect } from 'react'

export default function AreaSearchClient() {
  useEffect(() => {
    const searchInput = document.getElementById('area-search-input') as HTMLInputElement
    const areasGrid = document.getElementById('areas-grid')
    
    if (!searchInput || !areasGrid) return

    const handleSearch = () => {
      const query = searchInput.value.toLowerCase().trim()
      const cards = areasGrid.querySelectorAll('a')

      cards.forEach((card) => {
        const text = card.textContent?.toLowerCase() || ''
        const matches = text.includes(query)
        
        if (matches) {
          card.style.display = 'block'
        } else {
          card.style.display = 'none'
        }
      })
    }

    searchInput.addEventListener('input', handleSearch)

    return () => {
      searchInput.removeEventListener('input', handleSearch)
    }
  }, [])

  return null
}
