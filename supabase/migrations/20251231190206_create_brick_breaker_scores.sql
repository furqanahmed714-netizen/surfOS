/*
  # Create brick breaker scores table

  1. New Tables
    - `brick_breaker_scores`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `score` (integer)
      - `level` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `brick_breaker_scores` table
    - Add policy for authenticated users to insert their own scores
    - Add policy for all users to read scores (for leaderboard)
*/

CREATE TABLE IF NOT EXISTS brick_breaker_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE brick_breaker_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own brick breaker scores"
  ON brick_breaker_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read brick breaker scores for leaderboard"
  ON brick_breaker_scores
  FOR SELECT
  TO authenticated
  USING (true);
