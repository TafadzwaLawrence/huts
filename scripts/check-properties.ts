// Run this script to check your database contents
// npx ts-node scripts/check-properties.ts

import { createStaticClient } from '../lib/supabase/server'

async function checkProperties() {
  const supabase = createStaticClient()
  
  console.log('\n=== CHECKING PROPERTIES TABLE ===\n')
  
  // 1. Count all properties
  const { data: allProps, error: allError } = await supabase
    .from('properties')
    .select('id, verification_status, status', { count: 'exact' })
  
  console.log('Total properties:', allProps?.length || 0)
  if (allError) console.error('Error fetching all:', allError)
  
  // 2. Show verification_status breakdown
  const verificationCounts: Record<string, number> = {}
  allProps?.forEach(p => {
    const status = p.verification_status || 'null'
    verificationCounts[status] = (verificationCounts[status] || 0) + 1
  })
  console.log('By verification_status:', verificationCounts)
  
  // 3. Show status breakdown
  const statusCounts: Record<string, number> = {}
  allProps?.forEach(p => {
    const status = p.status || 'null'
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })
  console.log('By status:', statusCounts)
  
  // 4. Fetch verified properties
  const { data: verifiedProps, error: verifiedError } = await supabase
    .from('properties')
    .select('id, title, verification_status, status, created_at')
    .eq('verification_status', 'verified')
    .limit(5)
  
  console.log('\nVerified properties sample:')
  console.table(verifiedProps || [])
  if (verifiedError) console.error('Error fetching verified:', verifiedError)
  
  // 5. Check property_images
  if (verifiedProps && verifiedProps.length > 0) {
    const propertyIds = verifiedProps.map(p => p.id)
    const { data: images, error: imgError } = await supabase
      .from('property_images')
      .select('property_id, url, is_primary')
      .in('property_id', propertyIds)
    
    console.log('\nImages for these verified properties:')
    console.table(images || [])
    if (imgError) console.error('Error fetching images:', imgError)
  }
  
  console.log('\n=== END CHECK ===\n')
}

checkProperties().catch(console.error)
