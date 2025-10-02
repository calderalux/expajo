-- Migration: Add currency field to destinations table
-- Date: 2025-01-27

-- Add currency column
ALTER TABLE destinations 
ADD COLUMN currency TEXT;

-- Add comment to document the column
COMMENT ON COLUMN destinations.currency IS 'Primary currency used in this destination';

-- Example: Update existing destinations with sample currency data
-- UPDATE destinations 
-- SET currency = 'NGN'
-- WHERE country = 'Nigeria';

-- UPDATE destinations 
-- SET currency = 'USD'
-- WHERE country = 'United States';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'destinations' AND column_name = 'currency';
