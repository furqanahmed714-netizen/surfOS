/*
  # Create Feedback System

  1. New Tables
    - `feedbacks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text) - short summary of the feedback
      - `description` (text) - detailed feedback content
      - `vote_count` (integer) - cached count of votes for performance
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `feedback_votes`
      - `id` (uuid, primary key)
      - `feedback_id` (uuid, references feedbacks)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - Unique constraint on (feedback_id, user_id) to prevent duplicate votes

  2. Security
    - Enable RLS on both tables
    - Authenticated users can read all feedback
    - Users can only create their own feedback
    - Users can only vote once per feedback (enforced by unique constraint + RLS)
    - Users cannot vote on their own feedback

  3. Indexes
    - Index on feedbacks.vote_count for sorting by popularity
    - Index on feedbacks.created_at for sorting by date
    - Index on feedback_votes for checking existing votes
*/

CREATE TABLE IF NOT EXISTS feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  vote_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feedback_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL REFERENCES feedbacks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(feedback_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_vote_count ON feedbacks(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_votes_lookup ON feedback_votes(feedback_id, user_id);

ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view feedbacks"
  ON feedbacks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own feedback"
  ON feedbacks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON feedbacks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
  ON feedbacks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone authenticated can view votes"
  ON feedback_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can vote on feedback they did not create"
  ON feedback_votes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND NOT EXISTS (
      SELECT 1 FROM feedbacks WHERE feedbacks.id = feedback_id AND feedbacks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove their own vote"
  ON feedback_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_feedback_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE feedbacks SET vote_count = vote_count + 1, updated_at = now() WHERE id = NEW.feedback_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE feedbacks SET vote_count = vote_count - 1, updated_at = now() WHERE id = OLD.feedback_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_vote_count ON feedback_votes;
CREATE TRIGGER trigger_update_vote_count
  AFTER INSERT OR DELETE ON feedback_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_vote_count();