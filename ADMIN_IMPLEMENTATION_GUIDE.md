# Huts Admin Panel — Implementation Guide

> **For the agent building the admin panel in a separate workspace.**
> This document describes the complete architecture, all existing files, all API contracts, and all pending work needed to finish the admin application.

---

## 1. Project Context

**Platform:** Huts — rental & sale property listing platform for Zimbabwe.
**Framework:** Next.js 14 App Router + TypeScript + Tailwind CSS + Supabase (PostgreSQL).
**Admin panel location:** `app/admin/` — server-rendered, protected by email whitelist.

---

## 2. Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://idhcvldxyhfjzytswomo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key — NEVER expose client-side>
ADMIN_EMAILS=chitangalawrence03@gmail.com   # comma-separated for multiple admins
NEXT_PUBLIC_SITE_URL=https://huts.co.zw
RESEND_API_KEY=<resend key>
```

---

## 3. Supabase Client Rules — CRITICAL

There are two different Supabase clients. Using the wrong one is the #1 source of bugs.

```typescript
// lib/supabase/server.ts

// createClient() — session-based, subject to RLS
// USE FOR: reading the current user's session, auth checks only
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

// createAdminClient() — service role key, BYPASSES ALL RLS
// USE FOR: every admin DB read and write
// NEVER use createClient() for admin data queries — RLS will hide rows
import { createAdminClient } from '@/lib/supabase/server'
const admin = createAdminClient()
const { data } = await admin.from('agents').select('*') // sees all rows
```

**Rule:** In every admin page/API route:
- Auth check → `createClient()` (reads the cookie session)
- Any database query → `createAdminClient()` (bypasses RLS)

---

## 4. Admin Guard Utilities

### `lib/admin/check-admin.ts`
```typescript
// checkIsAdmin() — returns { isAdmin, user, profile }
// requireAdmin() — throws if not admin (use in API routes)
export async function checkIsAdmin() { ... }
export async function requireAdmin() { ... }
```
Admin check logic:
1. User has `is_admin = true` in `profiles` table, **OR**
2. User's email is in `ADMIN_EMAILS` env var

### `lib/admin/activity-logger.ts`
```typescript
logAdminActivity({
  adminId: string,
  action: AdminAction,  // e.g. 'property_approved', 'agent_suspended'
  resourceType: ResourceType,  // 'property' | 'user' | 'agent' | 'review' | 'message'
  resourceId: string,
  metadata?: Record<string, any>,
})
```
Writes to `admin_activity_logs` table. Non-fatal — wrap in try/catch.

### `lib/admin/index.ts`
```typescript
export { checkIsAdmin, requireAdmin } from './check-admin'
export { logAdminActivity, getRecentActivity, getResourceActivity } from './activity-logger'
```

---

## 5. Admin Layout — `app/admin/layout.tsx`

**Auth:** Redirects to `/auth/signup` if not logged in, to `/dashboard` if not admin.

**Top bar:** "HUTS" wordmark → "Admin" label → admin email display.

**Navigation tabs (in order):**
| Tab | Href | Icon |
|-----|------|------|
| Overview | `/admin` | `LayoutDashboard` |
| Verification | `/admin/verification` | `ShieldCheck` |
| Properties | `/admin/properties` | `Building2` |
| Users | `/admin/users` | `Users` |
| Agents | `/admin/agents` | `Briefcase` |
| Reviews | `/admin/reviews` | `Star` |
| Messages | `/admin/conversations` | `MessageSquare` |

**Colors:** navbar bg `#212529`, content bg `#F9FAFB`, nav border `#E9ECEF`.

---

## 6. Existing Admin Pages — What's Already Built

### 6.1 Overview — `app/admin/page.tsx` ✅

**Type:** Server Component.
**Data source:** `createAdminClient()` (not `createClient()`).

Stats displayed:
- Total properties, Pending review, Total users, Total reviews (stat cards)
- Active/Approved/Rejected/Landlords/Renters (mini stats)
- Alert banner if pending properties > 0 → links to `/admin/verification`
- Recent pending properties table (last 5)
- Recent users table (last 5)

**Component used:** `AdminStatCard` from `components/admin`.

---

### 6.2 Verification — `app/admin/verification/page.tsx` ✅

**Type:** Client Component (`'use client'`).
**Purpose:** Review pending property listings. Approve or reject with optional rejection reason.

**Data flow:**
- Fetches: `GET /api/admin/properties?status=pending&page=X&limit=10`
- Approve: `POST /api/admin/properties` `{ propertyId, action: 'approve' }`
- Reject: `POST /api/admin/properties` `{ propertyId, action: 'reject', reason: string }`

**Features:** Bulk selection checkbox, bulk approve/reject via `BulkActionToolbar` (calls `/api/admin/bulk-actions`), pagination.

---

### 6.3 Properties — `app/admin/properties/page.tsx` ✅

**Type:** Client Component.
**Purpose:** View all properties, filter by status, toggle active/inactive, delete.

**Data flow:**
- Fetches: `GET /api/admin/properties?status=all|approved|pending|rejected&page=X&limit=20`
- Toggle status: `PATCH /api/admin/properties/[id]` `{ status: 'active' | 'inactive' }`
- Delete: `DELETE /api/admin/properties/[id]`

**Fields shown:** thumbnail, title, city/area, owner name+email, listing type, price, status badge, created date, actions.

---

### 6.4 Users — `app/admin/users/page.tsx` ✅

**Type:** Client Component.
**Purpose:** List all users, filter by role (all/landlord/renter), bulk actions.

**Data flow:**
- Fetches: `GET /api/admin/users?role=all|landlord|renter&page=X&limit=20`

**Detail page:** `app/admin/users/[id]/page.tsx` with `EditUserForm.tsx` client component.

---

### 6.5 Agents — `app/admin/agents/page.tsx` ✅

**Type:** Server Component.
**Purpose:** List agents filtered by status tabs.

**Status tabs:** `pending | active | suspended | inactive` (with count badges)

**Data query:**
```typescript
const supabase = createAdminClient() // no await — sync
const { data: agents } = await supabase
  .from('agents')
  .select(`
    id, user_id, agent_type, business_name, office_city,
    phone, verified, status, featured, avg_rating, total_reviews,
    created_at, slug,
    profiles:user_id (full_name, email, avatar_url)
  `)
  .eq('status', statusFilter)
  .order('created_at', { ascending: false })
```

**Columns:** Agent (business_name / profile full_name + email), Type (with icon), City, Rating, Verified, Submitted date, "Review →" button.

**Important:** `createAdminClient()` is called synchronously (no `await`) — it does NOT read cookies, it uses the service role key directly.

---

### 6.6 Agent Detail — `app/admin/agents/[id]/page.tsx` ✅

**Type:** Server Component.
**Purpose:** Full agent profile view + action sidebar.

**Data query:**
```typescript
const { data: agent } = await supabase
  .from('agents')
  .select(`
    *,
    profiles:user_id (full_name, email, avatar_url, created_at),
    agent_service_areas (city, is_primary)
  `)
  .eq('id', params.id)
  .single()
```

**NOTE:** Does NOT join `agent_reviews` — crashes due to FK issues. Uses denormalized `agent.avg_rating` and `agent.total_reviews` from the agents table directly.

**Layout:** 2/3 left (profile card, professional details, service areas, specializations, languages, website) + 1/3 right sidebar (AdminAgentActions component).

**Status badge colors:**
```typescript
active:    'bg-green-50 text-green-700 border border-green-200'
pending:   'bg-amber-50 text-amber-700 border border-amber-200'
suspended: 'bg-red-50 text-red-700 border border-red-200'
inactive:  'bg-gray-100 text-gray-600 border border-gray-200'
```

---

### 6.7 AdminAgentActions — `app/admin/agents/[id]/AdminAgentActions.tsx` ✅

**Type:** Client Component.
**Props:**
```typescript
interface Props {
  agentId: string
  currentStatus: string      // 'pending' | 'active' | 'suspended' | 'inactive'
  currentVerified: boolean
  currentFeatured: boolean
  agentSlug: string | null
}
```

**Actions (all call PATCH `/api/admin/agents/[agentId]`):**
| Button | Payload | Shown when |
|--------|---------|------------|
| Approve Agent | `{ status: 'active' }` | status !== 'active' |
| Suspend Agent | `{ status: 'suspended' }` | status !== 'suspended' |
| Reactivate Agent | `{ status: 'active' }` | status === 'suspended' |
| Mark as Verified | `{ verified: true }` | always |
| Remove Verification | `{ verified: false }` | always |
| Mark as Featured | `{ featured: true }` | always |
| Remove Featured | `{ featured: false }` | always |
| View Public Profile | link to `/agent/[slug]` | agentSlug != null |
| Delete Agent | DELETE `/api/admin/agents/[agentId]` | always |

Uses `router.refresh()` after each action to re-render server component.

---

### 6.8 Reviews — `app/admin/reviews/page.tsx` ✅

**Type:** Client Component.
**Purpose:** View all reviews, filter All vs "Flagged (3+ not helpful)", delete.

**Data flow:**
- Fetches: `GET /api/admin/reviews?status=all|flagged&page=X&limit=20`
- Delete: `DELETE /api/admin/reviews/[id]`

---

### 6.9 Conversations/Messages — `app/admin/conversations/page.tsx` ✅

**Type:** Client Component.
**Purpose:** View all conversations between renters and landlords, expand to see messages.

**Data flow:**
- List: `GET /api/admin/conversations?page=X&limit=20`
- Messages for a conversation: `GET /api/admin/conversations/[id]`

---

## 7. Admin API Routes

### Properties
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/properties` | List with filters (status, page, limit) |
| PATCH | `/api/admin/properties` | Approve/reject (body: `{ propertyId, action, reason? }`) |
| PATCH | `/api/admin/properties/[id]` | Edit fields: status, verification_status, title, price, featured |
| DELETE | `/api/admin/properties/[id]` | Permanently delete |

### Agents
| Method | Route | Purpose |
|--------|-------|---------|
| PATCH | `/api/admin/agents/[id]` | Update status/verified/featured |
| DELETE | `/api/admin/agents/[id]` | Permanently delete agent record |

**PATCH body (only these fields are allowed):**
```json
{ "status": "active" }            // approve
{ "status": "suspended" }         // suspend
{ "status": "inactive" }          // deactivate
{ "verified": true }              // grant verification badge (also sends email)
{ "verified": false }             // remove verification
{ "featured": true }              // feature on homepage
{ "featured": false }             // unfeature
```

On `status → active` OR `verified → true`, the API automatically sends `AgentVerificationEmail` via Resend (non-fatal if email fails).

### Users
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/users` | List with role filter + pagination |
| PATCH | `/api/admin/users/[id]` | Edit user profile fields |
| DELETE | `/api/admin/users/[id]` | Delete user |

### Reviews
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/reviews` | List, filter flagged |
| DELETE | `/api/admin/reviews/[id]` | Delete review |

### Conversations
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/conversations` | List all with pagination |
| GET | `/api/admin/conversations/[id]` | Get messages in conversation |

### Bulk Actions
| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/admin/bulk-actions` | Bulk approve/reject/delete |

**Body:**
```json
{
  "action": "approve" | "reject" | "delete" | "suspend" | "unsuspend",
  "resourceType": "property" | "user" | "agent",
  "resourceIds": ["id1", "id2"]
}
```

### Stats / Export
| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/admin/stats` | Dashboard aggregates |
| GET | `/api/admin/export` | CSV export |

---

## 8. Database Schema — Key Tables

### `agents` table (canonical — migration 030 + 037)
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE
agent_type    TEXT  -- 'real_estate_agent' | 'property_manager' | 'home_builder' | 'photographer' | 'other'
business_name TEXT
bio           TEXT
phone         TEXT
office_city   TEXT
years_experience INTEGER
license_number TEXT
website       TEXT
languages     TEXT[]
specializations TEXT[]
slug          TEXT UNIQUE
verified      BOOLEAN DEFAULT FALSE
verification_date TIMESTAMPTZ
is_active     BOOLEAN DEFAULT TRUE
status        TEXT NOT NULL DEFAULT 'pending'  -- added by migration 037
  CHECK (status IN ('pending', 'active', 'suspended', 'inactive'))
featured      BOOLEAN NOT NULL DEFAULT FALSE   -- added by migration 037
avg_rating    NUMERIC(3,2)
total_reviews INTEGER DEFAULT 0
created_at    TIMESTAMPTZ DEFAULT NOW()
updated_at    TIMESTAMPTZ DEFAULT NOW()
```

### `agent_profiles` VIEW
After migration 037: `CREATE OR REPLACE VIEW agent_profiles AS SELECT * FROM agents`
This is just a view — write to `agents` directly.

### `agent_service_areas` table
```sql
id       UUID PRIMARY KEY
agent_id UUID REFERENCES agents(id) ON DELETE CASCADE  -- FK fixed by migration 037
city     TEXT NOT NULL
is_primary BOOLEAN DEFAULT FALSE
```

### `profiles` table (users)
```sql
id        UUID PRIMARY KEY (matches auth.users.id)
full_name TEXT
email     TEXT
role      TEXT  -- 'landlord' | 'renter' | 'agent'
is_admin  BOOLEAN DEFAULT FALSE
avatar_url TEXT
phone     TEXT
created_at TIMESTAMPTZ
```

### `properties` table
```sql
id                  UUID PRIMARY KEY
user_id             UUID REFERENCES profiles(id)
title               TEXT
slug                TEXT UNIQUE
status              TEXT  -- 'active' | 'inactive' | 'pending'
verification_status TEXT  -- 'pending' | 'approved' | 'rejected'
listing_type        TEXT  -- 'rent' | 'sale'
price               INTEGER  -- monthly rent in cents
sale_price          BIGINT   -- sale price in cents
city                TEXT
area                TEXT
property_type       TEXT
bedrooms            INTEGER
bathrooms           INTEGER
square_feet         INTEGER
rejection_reason    TEXT
featured            BOOLEAN DEFAULT FALSE
verified_at         TIMESTAMPTZ
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

### `admin_activity_logs` table
```sql
id            UUID PRIMARY KEY
admin_id      UUID REFERENCES profiles(id)
action        TEXT
resource_type TEXT
resource_id   TEXT
metadata      JSONB
created_at    TIMESTAMPTZ DEFAULT NOW()
```

---

## 9. Shared Admin Components — `components/admin/`

All exported from `components/admin/index.ts`.

### `AdminStatCard`
```typescript
<AdminStatCard
  label="Pending Review"
  value={42}
  icon={ShieldAlert}
  href="/admin/verification"   // optional — makes it clickable
  highlight={true}             // optional — amber border
/>
```

### `AdminBadge`
```typescript
<AdminBadge variant="approved" />   // green
<AdminBadge variant="pending" />    // gray
<AdminBadge variant="rejected" />   // red
<AdminBadge variant="active" />
<AdminBadge variant="inactive" />
<AdminBadge variant="success" | "warning" | "error" />
// Props: variant, label?, showIcon?, size?: 'sm' | 'md'
```

### `AdminPageHeader`
```typescript
<AdminPageHeader
  title="Properties"
  description="42 total"
  action={<button>Export</button>}    // optional right-side slot
  stats={[{ label: "Active", value: 30 }]}  // optional mini stats
/>
```

### `AdminEmptyState`
```typescript
<AdminEmptyState
  icon={Building2}
  title="No properties found"
  description="Try changing your filter"
  action={<button>Clear filter</button>}  // optional
/>
```

### `AdminPagination`
```typescript
<AdminPagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

### `BulkActionToolbar`
Fixed bottom bar that appears when items are selected.
```typescript
<BulkActionToolbar
  selectedCount={selectedCount}
  resourceType="property"       // 'property' | 'user' | 'agent'
  selectedIds={selectedIds}
  onActionComplete={fetchData}
  onClearSelection={clearSelection}
/>
```

### `useAdminSelection` hook
```typescript
const {
  selectedIds,      // string[]
  selectedCount,    // number
  toggleSelection,  // (id: string) => void
  toggleAll,        // () => void
  clearSelection,   // () => void
  isSelected,       // (id: string) => boolean
  isAllSelected,    // boolean
  isSomeSelected,   // boolean
} = useAdminSelection(items)  // items must have { id: string }
```

### `AdminExportButton`
```typescript
<AdminExportButton type="properties" | "users" | "agents" />
// Calls GET /api/admin/export?type=X and downloads CSV
```

---

## 10. Design System Constants

### Colors
```css
--pure-white:   #FFFFFF
--off-white:    #F8F9FA   /* card backgrounds, table headers */
--light-gray:   #E9ECEF   /* borders */
--medium-gray:  #ADB5BD   /* muted text, placeholders */
--dark-gray:    #495057   /* secondary text */
--charcoal:     #212529   /* primary text, buttons */
--red:          #FF6B6B   /* destructive actions */
--green:        #51CF66   /* success/active states */
```

### Icon sizes (from `lib/constants.ts`)
```typescript
import { ICON_SIZES } from '@/lib/constants'
// ICON_SIZES.xs=12  sm=14  md=16  lg=20  xl=24  2xl=32  3xl=48
```

### Agent type labels (from `lib/constants.ts`)
```typescript
import { AGENT_TYPE_LABELS, AGENT_SPECIALIZATION_LABELS } from '@/lib/constants'
AGENT_TYPE_LABELS['real_estate_agent'] // → 'Real Estate Agent'
AGENT_TYPE_LABELS['property_manager']  // → 'Property Manager'
AGENT_TYPE_LABELS['home_builder']      // → 'Home Builder'
AGENT_TYPE_LABELS['photographer']      // → 'Real Estate Photographer'
AGENT_TYPE_LABELS['other']             // → 'Other Professional'
```

---

## 11. Email on Agent Approval

Located at `emails/AgentVerificationEmail.tsx`.

Sent automatically by `PATCH /api/admin/agents/[id]` when:
- `status` becomes `'active'`, OR
- `verified` becomes `true`

**Template props:**
```typescript
{
  agentName: string       // business_name || full_name
  agentType: string       // human-readable type label
  profileUrl: string      // https://huts.co.zw/agent/[slug]
  portalUrl:  string      // https://huts.co.zw/agent/overview
  action: 'approved' | 'verified'
}
```

---

## 12. Migration 037 — Must Be Run First

**File:** `supabase/migrations/037_agents_clean_setup.sql`

**Run in Supabase SQL Editor before the admin agent pages will work.**

What it does:
1. Adds `status` + `featured` columns to `agents` if missing
2. Backfills existing rows (`is_active=true → status='active'`)
3. Adds CHECK constraint on status
4. Fixes `agent_service_areas.agent_id` FK → `agents(id)`
5. Fixes `agent_reviews.agent_id` FK → `agents(id)`
6. Drops old `agent_profiles` table/view, recreates as `VIEW agent_profiles AS SELECT * FROM agents`
7. Creates indexes on `agents(status)`, `agents(featured)`, `agents(slug)`

The final query returns a row showing `total_agents`, `pending`, `active`, `status_col_exists='status'`, `result='Setup complete'` to confirm success.

---

## 13. What Still Needs to Be Built

### 13.1 Agent Signup → Role Upgrade ❌
After the agent INSERT succeeds in `app/agents/signup/page.tsx`, the code must call:
```typescript
await supabase.rpc('fn_upgrade_to_agent', { p_user_id: user.id })
```
Without this, `profiles.role` stays as `'renter'` and the agent portal layout redirects away.

### 13.2 Agent Edit Profile Page ❌
`app/agent/(portal)/profile/page.tsx` currently re-exports the landlord profile page.
Needs a dedicated form with fields: `business_name`, `bio`, `phone`, `office_city`, `years_experience`, `license_number`, `website`, `languages[]`, `specializations[]`, profile photo upload via Uploadthing.

API route needed: `PATCH /api/agent/profile` — updates `agents` row for `user_id = current user`.

### 13.3 Service Areas in Agent Signup ❌
Need to collect cities served during signup → insert rows into `agent_service_areas` after the agent record is created.
Without this, the `/find-agent` city filter returns 0 results for new agents.

### 13.4 Admin Overview — Agent Stats ❌
The overview page (`app/admin/page.tsx`) does not yet show agent stats.
Should add:
- Total agents count
- Pending agents count (with alert banner like properties)
- Link to `/admin/agents?status=pending`

Add these queries to the `Promise.all` in `app/admin/page.tsx`:
```typescript
admin.from('agents').select('*', { count: 'exact', head: true }),
admin.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
```

### 13.5 Agent Listing on `/find-agent` ❌
Public page to browse agents by city, type, and specialization.
Queries: `SELECT * FROM agents WHERE status = 'active'` (RLS handles this; use `createClient()` not admin client on the public page).

---

## 14. Standard API Route Pattern

Every admin API route follows this exact pattern:

```typescript
import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'chitangalawrence03@gmail.com')
  .split(',').map(e => e.trim())

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // 1. Auth check — use session client
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    if (!ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 2. Parse and whitelist body fields
    const body = await req.json()
    const allowed: Record<string, unknown> = {}
    if ('status' in body && ['pending','active','suspended','inactive'].includes(body.status)) {
      allowed.status = body.status
    }
    if (!Object.keys(allowed).length) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // 3. DB write — use admin client to bypass RLS
    const adminDb = createAdminClient()
    const { data, error } = await adminDb
      .from('agents')
      .update({ ...allowed, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select('id, status')
      .single()
    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Admin] PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## 15. File Structure Summary

```
app/admin/
├── layout.tsx                    ← Auth guard + nav tabs
├── page.tsx                      ← Overview dashboard (server component)
├── verification/
│   └── page.tsx                  ← Pending property review (client)
├── properties/
│   └── page.tsx                  ← All properties list (client)
├── users/
│   ├── page.tsx                  ← Users list (client)
│   └── [id]/
│       ├── page.tsx
│       └── EditUserForm.tsx
├── agents/
│   ├── page.tsx                  ← Agent list by status tab (server)
│   └── [id]/
│       ├── page.tsx              ← Agent detail (server)
│       └── AdminAgentActions.tsx ← Action buttons (client)
├── reviews/
│   └── page.tsx                  ← Reviews list (client)
└── conversations/
    └── page.tsx                  ← Conversations list (client)

app/api/admin/
├── properties/
│   ├── route.ts                  ← GET list, PATCH approve/reject
│   └── [id]/route.ts             ← PATCH edit, DELETE
├── agents/
│   └── [id]/route.ts             ← PATCH status/verified/featured, DELETE
├── users/
│   ├── route.ts
│   └── [id]/route.ts
├── reviews/
│   └── [id]/route.ts
├── conversations/
│   ├── route.ts
│   └── [id]/route.ts
├── bulk-actions/route.ts
├── stats/route.ts
└── export/route.ts

components/admin/
├── AdminStatCard.tsx
├── AdminBadge.tsx
├── AdminEmptyState.tsx
├── AdminPageHeader.tsx
├── AdminPagination.tsx
├── AdminBulkActions.tsx          ← BulkActionToolbar
├── AdminExportButton.tsx
├── AdminTable.tsx
├── AdminActionButtons.tsx
├── useAdminSelection.ts          ← hook
└── index.ts                      ← re-exports everything

lib/admin/
├── check-admin.ts                ← checkIsAdmin(), requireAdmin()
├── activity-logger.ts            ← logAdminActivity()
└── index.ts

lib/supabase/
├── server.ts                     ← createClient(), createAdminClient()
└── client.ts                     ← browser client

emails/
└── AgentVerificationEmail.tsx    ← Sent on agent approval/verification

supabase/migrations/
└── 037_agents_clean_setup.sql    ← RUN THIS FIRST in Supabase SQL editor
```
