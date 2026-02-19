-- ============================================
-- STUDENT ACCOMMODATIONS SYSTEM
-- ============================================

-- Add 'student' to property_type enum
ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'student';

-- Add student-specific fields to properties table
ALTER TABLE properties
ADD COLUMN furnished BOOLEAN DEFAULT FALSE,
ADD COLUMN shared_rooms BOOLEAN DEFAULT FALSE,
ADD COLUMN utilities_included BOOLEAN DEFAULT FALSE,
ADD COLUMN nearby_universities JSONB DEFAULT '[]'::jsonb,
ADD COLUMN student_lease_terms TEXT;

-- Add check constraints for student fields
-- shared_rooms only makes sense if price exists (rental property)
ALTER TABLE properties
ADD CONSTRAINT chk_student_shared_rooms CHECK (
  shared_rooms = FALSE OR (listing_type = 'rent' AND price IS NOT NULL)
);

-- Create index for student property discovery
-- Note: WHERE clauses removed to avoid enum value issue in same transaction
CREATE INDEX idx_properties_student_type ON properties(property_type);
CREATE INDEX idx_properties_student_furnished ON properties(furnished);
CREATE INDEX idx_properties_student_utilities ON properties(utilities_included);

-- Comments for documentation
COMMENT ON COLUMN properties.furnished IS 'Whether the property includes furniture';
COMMENT ON COLUMN properties.shared_rooms IS 'Whether the property supports shared rooms/roommates (rental only)';
COMMENT ON COLUMN properties.utilities_included IS 'Whether utilities (water, electricity, internet) are included in rent';
COMMENT ON COLUMN properties.nearby_universities IS 'JSONB array of nearby universities: [{name: "University Name", distance_km: 2.5}]';
COMMENT ON COLUMN properties.student_lease_terms IS 'Student-specific lease terms (e.g., semester-based, flexible sublet options)';
