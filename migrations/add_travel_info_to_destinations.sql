-- Migration: Add travel info fields to destinations table
-- Date: 2025-01-27

-- Add best_time_to_visit column
ALTER TABLE destinations 
ADD COLUMN best_time_to_visit TEXT;

-- Add climate column
ALTER TABLE destinations 
ADD COLUMN climate TEXT;

-- Add language column
ALTER TABLE destinations 
ADD COLUMN language TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN destinations.best_time_to_visit IS 'Best time of year to visit this destination';
COMMENT ON COLUMN destinations.climate IS 'Climate description for this destination';
COMMENT ON COLUMN destinations.language IS 'Primary language(s) spoken at this destination';

-- Example: Update existing destinations with sample data
-- UPDATE destinations 
-- SET 
--   best_time_to_visit = 'November to March (dry season)',
--   climate = 'Tropical savanna climate',
--   language = 'English, Yoruba'
-- WHERE id = 'your-destination-id';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'destinations' 
AND column_name IN ('best_time_to_visit', 'climate', 'language')
ORDER BY column_name;
