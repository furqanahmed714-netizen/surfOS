/*
  # Add Category to Feedbacks

  1. Schema Changes
    - Add `category` column to `feedbacks` table
    - Category is optional, defaults to 'General'
    - Categories will be auto-detected from content keywords
  
  2. Indexes
    - Add index on category for filtering performance

  3. Notes
    - Categories are stored as simple text values
    - Frontend will extract unique categories for filter dropdown
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedbacks' AND column_name = 'category'
  ) THEN
    ALTER TABLE feedbacks ADD COLUMN category text NOT NULL DEFAULT 'General';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_feedbacks_category ON feedbacks(category);