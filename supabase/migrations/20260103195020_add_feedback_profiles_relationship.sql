/*
  # Add Foreign Key Relationship Between Feedbacks and Profiles

  1. Changes
    - Add foreign key from feedbacks.user_id to profiles.id
    - This enables PostgREST to recognize the relationship for embedded queries
    - Allows fetching profile data (first_name, last_name) when querying feedbacks

  2. Notes
    - The feedbacks table already references auth.users
    - This additional FK to profiles enables the join syntax in Supabase client
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'feedbacks_user_id_profiles_fkey'
  ) THEN
    ALTER TABLE feedbacks 
    ADD CONSTRAINT feedbacks_user_id_profiles_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;