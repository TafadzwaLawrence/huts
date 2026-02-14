# Huts - Database Schema & Business Logic

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   profiles  │       │   properties    │       │ property_images │
├─────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)     │──┐    │ id (PK)         │──┐    │ id (PK)         │
│ email       │  │    │ user_id (FK)────│──┘    │ property_id(FK)─│───┐
│ name        │  │    │ title           │       │ url             │   │
│ avatar_url  │  │    │ description     │       │ order           │   │
│ phone       │  │    │ price           │       │ alt_text        │   │
│ role        │  │    │ beds            │       └─────────────────┘   │
│ created_at  │  │    │ baths           │                             │
└─────────────┘  │    │ sqft            │       ┌─────────────────┐   │
                 │    │ property_type   │       │ saved_properties│   │
                 │    │ status          │       ├─────────────────┤   │
                 │    │ address         │       │ user_id (FK)────│───┤
                 │    │ city            │       │ property_id(FK)─│───┘
                 │    │ neighborhood    │       │ saved_at        │
                 │    │ lat/lng         │       └─────────────────┘
                 │    │ amenities       │
                 │    │ available_from  │       ┌─────────────────┐
                 │    │ created_at      │       │    inquiries    │
                 │    └─────────────────┘       ├─────────────────┤
                 │                              │ id (PK)         │
                 │                              │ property_id(FK)─│───┐
                 └──────────────────────────────│ sender_id (FK)  │   │
                                                │ recipient_id(FK)│   │
                                                │ message         │   │
                                                │ status          │   │
                                                │ created_at      │   │
                                                └─────────────────┘   │
                                                                      │
                 ┌─────────────────┐       ┌─────────────────┐        │
                 │   area_guides   │       │  property_views │        │
                 ├─────────────────┤       ├─────────────────┤        │
                 │ id (PK)         │       │ id (PK)         │        │
                 │ slug            │       │ property_id(FK)─│────────┘
                 │ name            │       │ viewer_id (FK)  │
                 │ description     │       │ viewed_at       │
                 │ city            │       │ source          │
                 │ meta_title      │       └─────────────────┘
                 │ meta_description│
                 │ content         │
                 └─────────────────┘
```

---

## Complete SQL Schema

### 1. Profiles (extends Supabase auth.users)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'renter' CHECK (role IN ('landlord', 'renter', 'admin')),
  bio TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Index for lookups
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
```

### 2. Properties

```sql
CREATE TYPE property_type AS ENUM (
  'apartment',
  'house',
  'studio',
  'room',
  'townhouse',
  'condo'
);

CREATE TYPE property_status AS ENUM (
  'draft',
  'active',
  'rented',
  'inactive'
);

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  property_type property_type NOT NULL DEFAULT 'apartment',
  status property_status NOT NULL DEFAULT 'draft',
  
  -- Pricing
  price INTEGER NOT NULL CHECK (price > 0),  -- Monthly rent in cents
  deposit INTEGER,                            -- Security deposit in cents
  
  -- Details
  beds INTEGER NOT NULL CHECK (beds >= 0),
  baths NUMERIC(3,1) NOT NULL CHECK (baths >= 0),  -- Allows 1.5 baths
  sqft INTEGER CHECK (sqft > 0),
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  neighborhood TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  
  -- Features (stored as JSONB for flexibility)
  amenities JSONB DEFAULT '[]',
  /*
    Example amenities:
    ["parking", "laundry", "ac", "heating", "dishwasher", 
     "pet_friendly", "furnished", "gym", "pool", "balcony"]
  */
  
  -- Availability
  available_from DATE,
  lease_term TEXT,  -- "12 months", "flexible", "month-to-month"
  
  -- SEO
  slug TEXT UNIQUE,
  meta_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Indexes for search performance
CREATE INDEX idx_properties_user ON properties(user_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_beds ON properties(beds);
CREATE INDEX idx_properties_location ON properties USING GIST (
  ll_to_earth(lat, lng)
) WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Full-text search index
CREATE INDEX idx_properties_search ON properties USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(neighborhood, '') || ' ' || coalesce(city, ''))
);

-- Auto-generate slug
CREATE OR REPLACE FUNCTION generate_property_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(NEW.id::text, 1, 8);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_property_slug
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION generate_property_slug();
```

### 3. Property Images

```sql
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,           -- Uploadthing URL
  thumbnail_url TEXT,          -- Uploadthing thumbnail URL
  alt_text TEXT,
  "order" INTEGER DEFAULT 0,   -- For sorting images
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_property_images_property ON property_images(property_id);
CREATE INDEX idx_property_images_order ON property_images(property_id, "order");

-- Ensure only one primary image per property
CREATE UNIQUE INDEX idx_property_images_primary 
  ON property_images(property_id) 
  WHERE is_primary = TRUE;
```

### 4. Saved Properties (Favorites)

```sql
CREATE TABLE saved_properties (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,  -- User's private notes about the property
  PRIMARY KEY (user_id, property_id)
);

CREATE INDEX idx_saved_properties_user ON saved_properties(user_id);
```

### 5. Inquiries (Messages)

```sql
CREATE TYPE inquiry_status AS ENUM (
  'unread',
  'read',
  'replied',
  'archived'
);

CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  message TEXT NOT NULL,
  status inquiry_status DEFAULT 'unread',
  
  -- Contact preferences
  preferred_contact TEXT,  -- 'email', 'phone', 'either'
  preferred_move_in DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ
);

CREATE INDEX idx_inquiries_property ON inquiries(property_id);
CREATE INDEX idx_inquiries_sender ON inquiries(sender_id);
CREATE INDEX idx_inquiries_recipient ON inquiries(recipient_id);
CREATE INDEX idx_inquiries_status ON inquiries(recipient_id, status);
```

### 6. Property Views (Analytics)

```sql
CREATE TABLE property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- NULL for anonymous
  session_id TEXT,  -- For anonymous tracking
  source TEXT,      -- 'search', 'direct', 'social', 'email'
  referrer TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_property_views_property ON property_views(property_id);
CREATE INDEX idx_property_views_date ON property_views(property_id, viewed_at);
```

### 7. Area Guides (SEO Pages)

```sql
CREATE TABLE area_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,           -- "Downtown Apartments"
  city TEXT NOT NULL,
  neighborhood TEXT,
  
  -- Content
  description TEXT,
  content TEXT,                 -- Markdown content for the guide
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Stats (updated periodically)
  avg_rent INTEGER,
  property_count INTEGER DEFAULT 0,
  
  -- Location bounds for filtering
  bounds_ne_lat DOUBLE PRECISION,
  bounds_ne_lng DOUBLE PRECISION,
  bounds_sw_lat DOUBLE PRECISION,
  bounds_sw_lng DOUBLE PRECISION,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_area_guides_slug ON area_guides(slug);
CREATE INDEX idx_area_guides_city ON area_guides(city);
```

---

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_guides ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- PROPERTIES
CREATE POLICY "Active properties are viewable by everyone"
  ON properties FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Landlords can insert properties"
  ON properties FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'landlord')
  );

CREATE POLICY "Landlords can update own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Landlords can delete own properties"
  ON properties FOR DELETE
  USING (auth.uid() = user_id);

-- PROPERTY IMAGES
CREATE POLICY "Property images are viewable with property"
  ON property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_id 
      AND (status = 'active' OR user_id = auth.uid())
    )
  );

CREATE POLICY "Property owners can manage images"
  ON property_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = property_id AND user_id = auth.uid()
    )
  );

-- SAVED PROPERTIES
CREATE POLICY "Users can view own saved properties"
  ON saved_properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save properties"
  ON saved_properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave properties"
  ON saved_properties FOR DELETE
  USING (auth.uid() = user_id);

-- INQUIRIES
CREATE POLICY "Users can view own inquiries (sent or received)"
  ON inquiries FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Authenticated users can send inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update inquiry status"
  ON inquiries FOR UPDATE
  USING (auth.uid() = recipient_id);

-- AREA GUIDES (public read)
CREATE POLICY "Area guides are public"
  ON area_guides FOR SELECT
  USING (true);
```

---

## Business Logic Flows

### 1. User Registration Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Sign Up    │────▶│ Supabase Auth│────▶│  Trigger:    │
│   (email,    │     │  Creates     │     │  Create      │
│   password)  │     │  auth.user   │     │  Profile     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  Redirect to │◀────│  Role Select │
                     │  Dashboard   │     │  (landlord/  │
                     │              │     │   renter)    │
                     └──────────────┘     └──────────────┘
```

**Logic:**
1. User signs up with email/password (or OAuth)
2. Supabase creates `auth.user`
3. Trigger automatically creates `profiles` row with default role `renter`
4. User prompted to select role (landlord/renter)
5. If landlord, shown property management dashboard
6. If renter, shown saved properties & search

### 2. Property Listing Flow (Landlord)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Create     │────▶│  Validate    │────▶│   Upload     │
│   Property   │     │  Form Data   │     │   Images to  │
│   Form       │     │              │     │  Uploadthing │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Property    │◀────│   Create     │◀────│   Save URLs  │
│  Live!       │     │   Property   │     │   to DB      │
│  (status:    │     │   Row        │     │              │
│   active)    │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Logic:**
1. Landlord fills property form (title, price, address, etc.)
2. Client validates: required fields, price > 0, valid address
3. Images uploaded to Uploadthing, get back URLs
4. Insert property with `status: 'draft'`
5. Insert property_images with Uploadthing URLs
6. Preview page shown to landlord
7. On publish, update `status: 'active'`, set `published_at`

### 3. Property Search Flow (Renter)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Search     │────▶│  Build       │────▶│   Execute    │
│   Filters    │     │  Query       │     │   Query      │
│   (city,     │     │              │     │              │
│   price,     │     │              │     │              │
│   beds...)   │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Display    │◀────│   Sort &     │◀────│   Filter     │
│   Results    │     │   Paginate   │     │   Results    │
│   Grid/Map   │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Query Building Logic:**
```typescript
let query = supabase
  .from('properties')
  .select(`
    *,
    property_images!inner(url, is_primary),
    profiles!inner(name, avatar_url)
  `)
  .eq('status', 'active')

// Apply filters dynamically
if (filters.city) query = query.ilike('city', `%${filters.city}%`)
if (filters.minPrice) query = query.gte('price', filters.minPrice)
if (filters.maxPrice) query = query.lte('price', filters.maxPrice)
if (filters.beds) query = query.gte('beds', filters.beds)
if (filters.propertyType) query = query.eq('property_type', filters.propertyType)
if (filters.amenities?.length) {
  query = query.contains('amenities', filters.amenities)
}

// Geo search (properties within radius)
if (filters.lat && filters.lng && filters.radius) {
  query = query.rpc('properties_within_radius', {
    lat: filters.lat,
    lng: filters.lng,
    radius_km: filters.radius
  })
}

// Sort
const sortOptions = {
  'price_asc': { column: 'price', ascending: true },
  'price_desc': { column: 'price', ascending: false },
  'newest': { column: 'published_at', ascending: false },
}
query = query.order(sortOptions[sort].column, sortOptions[sort])

// Paginate
query = query.range(page * pageSize, (page + 1) * pageSize - 1)
```

### 4. Property Inquiry Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Renter     │────▶│  Submit      │────▶│   Create     │
│   Views      │     │  Inquiry     │     │   Inquiry    │
│   Property   │     │  Form        │     │   Row        │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Renter     │◀────│   Send Email │◀────│   Trigger    │
│   Notified   │     │   via Resend │     │   Email      │
│              │     │   to Landlord│     │   Function   │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Logic:**
1. Renter clicks "Contact Landlord" on property page
2. Shows inquiry form (message, move-in date, contact preference)
3. On submit, insert into `inquiries` table
4. Supabase Edge Function triggered (or API route)
5. Send email to landlord via Resend
6. Landlord sees inquiry in dashboard with "unread" status
7. When landlord opens, update status to "read"
8. When landlord replies, update status to "replied"

### 5. Save Property Flow

```typescript
// Toggle save status
async function toggleSaveProperty(propertyId: string, userId: string) {
  const { data: existing } = await supabase
    .from('saved_properties')
    .select()
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .single()

  if (existing) {
    // Unsave
    await supabase
      .from('saved_properties')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId)
    return { saved: false }
  } else {
    // Save
    await supabase
      .from('saved_properties')
      .insert({ user_id: userId, property_id: propertyId })
    return { saved: true }
  }
}
```

### 6. Property Analytics Flow

```typescript
// Track view (called on property page load)
async function trackPropertyView(
  propertyId: string,
  viewerId: string | null,
  sessionId: string,
  source: string
) {
  await supabase.from('property_views').insert({
    property_id: propertyId,
    viewer_id: viewerId,
    session_id: sessionId,
    source: source,
    referrer: document.referrer
  })
}

// Get analytics for landlord dashboard
async function getPropertyAnalytics(propertyId: string) {
  const { data } = await supabase
    .from('property_views')
    .select('viewed_at, source')
    .eq('property_id', propertyId)
    .gte('viewed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  
  return {
    totalViews: data.length,
    viewsByDay: groupByDay(data),
    viewsBySource: groupBySource(data)
  }
}
```

---

## Useful Database Functions

### Geo Search Function

```sql
-- Find properties within radius
CREATE OR REPLACE FUNCTION properties_within_radius(
  center_lat DOUBLE PRECISION,
  center_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION
)
RETURNS SETOF properties AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM properties
  WHERE status = 'active'
    AND lat IS NOT NULL
    AND lng IS NOT NULL
    AND earth_distance(
      ll_to_earth(center_lat, center_lng),
      ll_to_earth(lat, lng)
    ) / 1000 <= radius_km
  ORDER BY earth_distance(
    ll_to_earth(center_lat, center_lng),
    ll_to_earth(lat, lng)
  );
END;
$$ LANGUAGE plpgsql;
```

### Full-Text Search Function

```sql
-- Search properties by text
CREATE OR REPLACE FUNCTION search_properties(search_query TEXT)
RETURNS SETOF properties AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM properties
  WHERE status = 'active'
    AND to_tsvector('english', 
      coalesce(title, '') || ' ' || 
      coalesce(description, '') || ' ' || 
      coalesce(neighborhood, '') || ' ' || 
      coalesce(city, '')
    ) @@ plainto_tsquery('english', search_query)
  ORDER BY ts_rank(
    to_tsvector('english', 
      coalesce(title, '') || ' ' || 
      coalesce(description, '')
    ),
    plainto_tsquery('english', search_query)
  ) DESC;
END;
$$ LANGUAGE plpgsql;
```

### Update Area Stats Function

```sql
-- Update area guide stats (run periodically)
CREATE OR REPLACE FUNCTION update_area_stats()
RETURNS void AS $$
BEGIN
  UPDATE area_guides ag
  SET 
    property_count = (
      SELECT COUNT(*) FROM properties p
      WHERE p.city = ag.city
        AND (ag.neighborhood IS NULL OR p.neighborhood = ag.neighborhood)
        AND p.status = 'active'
    ),
    avg_rent = (
      SELECT AVG(price) FROM properties p
      WHERE p.city = ag.city
        AND (ag.neighborhood IS NULL OR p.neighborhood = ag.neighborhood)
        AND p.status = 'active'
    ),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

---

## Migration Order

Run these in Supabase SQL Editor in order:

1. `001_profiles.sql` - Profiles table + trigger
2. `002_properties.sql` - Properties table + indexes
3. `003_property_images.sql` - Images table
4. `004_saved_properties.sql` - Favorites
5. `005_inquiries.sql` - Messages
6. `006_property_views.sql` - Analytics
7. `007_area_guides.sql` - SEO pages
8. `008_rls_policies.sql` - All RLS policies
9. `009_functions.sql` - Utility functions
