# Environment Setup for Area Guide Generation

## Required Environment Variables

Add these to your `.env.local` file (create it in the project root if it doesn't exist):

```env
# ============================================
# EXISTING VARIABLES (keep these)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://idhcvldxyhfjzytswomo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_existing_anon_key_here
UPLOADTHING_TOKEN=your_existing_uploadthing_token_here
RESEND_API_KEY=your_existing_resend_key_here
SENTRY_DSN=your_existing_sentry_dsn_here

# ============================================
# NEW REQUIRED VARIABLE FOR AREA GENERATION
# ============================================

# Supabase Service Role Key (required for bulk inserts)
# Get this from: https://supabase.com/dashboard/project/idhcvldxyhfjzytswomo/settings/api
# Look for "service_role" secret key (NOT the anon public key)
# ⚠️ WARNING: This key has full database access - never commit to git!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_service_role_key_here

# ============================================
# OPTIONAL VARIABLES FOR ENHANCED FEATURES
# ============================================

# OpenAI API Key (optional - for AI-generated content)
# Without this, the script uses template-based content (works fine!)
# Get this from: https://platform.openai.com/api-keys
# Costs: ~$0.01-0.03 per area guide (~$1-3 for 100 areas)
OPENAI_API_KEY=sk-your-openai-key-here
```

## How to Get Your Service Role Key

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project (Huts - idhcvldxyhfjzytswomo)
3. Click **Settings** (gear icon) in the left sidebar
4. Click **API** in the settings menu
5. Scroll down to **Project API keys**
6. Find the key labeled **`service_role`** (NOT `anon`)
7. Click **Reveal** then **Copy**
8. Paste it in `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

## Security Best Practices

### ✅ DO:
- Store service role key in `.env.local` only
- Verify `.env.local` is in your `.gitignore`
- Use service role key only in trusted server-side scripts
- Keep your `.env.local` file permissions restricted (chmod 600)

### ❌ DON'T:
- Commit service role key to git repositories
- Share service role key in messages/emails
- Use service role key in client-side code
- Store in public environment variables (like Vercel public vars)

## Verifying Your Setup

After adding the variables, test your setup:

```bash
# Test 1: Check environment loads correctly
npm run generate-areas -- --dry-run

# Expected output:
# 🏠 HUTS Area Guide Generator
# ═══════════════════════════════════════════
# Mode: DRY RUN (no database changes)
# ...
```

If you see errors about missing variables:
1. Check `.env.local` exists in project root
2. Verify variable names match exactly (case-sensitive)
3. Ensure there are no quotes around values
4. Restart your terminal/editor to reload environment

## Optional: OpenAI API Key

If you want AI-generated descriptions instead of templates:

1. Go to https://platform.openai.com/api-keys
2. Click **Create new secret key**
3. Name it "Huts Area Guide Generator"
4. Copy the key (starts with `sk-`)
5. Add to `.env.local` as `OPENAI_API_KEY`

**Cost estimate:**
- GPT-4: ~$0.02-0.03 per area guide
- GPT-3.5: ~$0.005-0.01 per area guide
- 35 areas: ~$0.70 with GPT-4, ~$0.20 with GPT-3.5

**Note:** Template-based generation works great and is completely free! Only add OpenAI if you want more varied/natural content.

## Example Complete .env.local

```env
# Supabase (Existing + New Service Role Key)
NEXT_PUBLIC_SUPABASE_URL=https://idhcvldxyhfjzytswomo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkaGN2bGR4eWhmanp5dHN3b21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMTI5NjUsImV4cCI6MjA0OTY4ODk2NX0.meCv2tDuxjtQb5RL4PSkpg_lvG2yPTQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_SERVICE_ROLE_KEY_HERE

# Uploadthing (Existing)
UPLOADTHING_TOKEN='eyJhcGlLZXkiOiJza19saXZlX2I4OGU5NTE1NTFiMDQ3ZjY2MDEyOTE4NDdkM2UxODFkMjFmZGNkNWJjYjU0NGVjYmE0ODUxMzZmNzQ0ZTk5MWYiLCJhcHBJZCI6IjNlb3RiMmY5bnciLCJyZWdpb25zIjpbInNlYTEiXX0='

# Resend (Existing)
RESEND_API_KEY=re_QXT3mx7c_2MSM9BdfYww1NW42mTMdUZ1M

# Sentry (Existing)
SENTRY_DSN=https://7eff2bd4522f30a7f7f3c2b55d207a1d@o4509355706613760.ingest.de.sentry.io/4510860358975568

# OpenAI (Optional - for AI content)
# OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
```

## Troubleshooting

**"Missing required environment variables: SUPABASE_SERVICE_ROLE_KEY"**
- Verify `.env.local` exists in project root (same level as `package.json`)
- Check variable name is exactly `SUPABASE_SERVICE_ROLE_KEY`
- Ensure no spaces around the `=` sign
- Try restarting your terminal

**"Error: Invalid API key"**
- Double-check you copied the **service_role** key (not anon key)
- Verify the entire key was copied (they're very long!)
- Check for accidental spaces at start/end

**"⚠️ OPENAI_API_KEY not found"**
- This is just a warning - scripts will use templates instead
- Totally normal if you don't have/want OpenAI API
- Ignore it or add the key to enable AI generation

**Scripts can't find .env.local**
- Ensure file is in project root: `/home/tafadzwa/Documents/Github/Huts/.env.local`
- Check file is named exactly `.env.local` (note the leading dot)
- On Linux/Mac: `ls -la | grep env` to verify it exists

## Next Steps

Once your `.env.local` is configured:

1. **Install dependencies:** `npm install`
2. **Test with dry run:** `npm run generate-areas -- --dry-run`
3. **Generate area guides:** `npm run generate-areas`
4. **View results:** Visit http://localhost:3000/areas

See `scripts/README.md` for full usage documentation.
