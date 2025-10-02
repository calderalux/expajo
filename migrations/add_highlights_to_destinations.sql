-- Migration: Add highlights field to destinations table
-- Date: 2025-01-27

-- Add highlights column as JSONB array to store multiple highlight strings
ALTER TABLE destinations 
ADD COLUMN highlights JSONB DEFAULT '[]'::jsonb;

-- Add comment to document the column
COMMENT ON COLUMN destinations.highlights IS 'Array of highlight strings describing key features of the destination';

-- Create index for JSONB queries (optional, for performance)
CREATE INDEX idx_destinations_highlights ON destinations USING GIN (highlights);

-- Example: Update existing destinations with sample highlights
-- UPDATE destinations 
-- SET highlights = '["Rich cultural heritage", "Authentic local experiences", "Expert local guides"]'::jsonb
-- WHERE id = 'your-destination-id';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'destinations' AND column_name = 'highlights';
