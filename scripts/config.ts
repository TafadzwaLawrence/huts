import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  scraping: {
    userAgent: 'Mozilla/5.0 (compatible; HutsBot/1.0; +https://huts.co.zw)',
    rateLimit: 2000, // milliseconds between requests
    timeout: 10000, // request timeout in ms
  },
  generation: {
    useAI: !!process.env.OPENAI_API_KEY,
    batchSize: 50, // records per batch for insertion
  },
}

// Validation
if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  console.error('❌ Missing required environment variables:')
  if (!config.supabase.url) console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  if (!config.supabase.serviceRoleKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease add these to your .env.local file')
  process.exit(1)
}

if (!config.openai.apiKey) {
  console.warn('⚠️  OPENAI_API_KEY not found - using template-based content generation\n')
}
