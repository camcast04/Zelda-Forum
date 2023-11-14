-- Enable the ltree extension
CREATE EXTENSION IF NOT EXISTS ltree;

-- Create user_profiles table
CREATE TABLE user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) NOT NULL,
  username TEXT UNIQUE NOT NULL,
  CONSTRAINT proper_username CHECK (username ~* '^[a-zA-Z0-9_]+$'),
  CONSTRAINT username_length CHECK (char_length(username) > 3 AND char_length(username) < 15)
);

-- Create posts table
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  user_id uuid REFERENCES auth.users (id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  path ltree NOT NULL
);

-- Create post_score table
CREATE TABLE post_score (
  post_id uuid PRIMARY KEY REFERENCES posts (id) NOT NULL,
  score INT NOT NULL
);

-- Create post_contents table
CREATE TABLE post_contents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  user_id uuid REFERENCES auth.users (id) NOT NULL,
  post_id uuid REFERENCES posts (id) NOT NULL,
  title TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create post_votes table
CREATE TABLE post_votes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  post_id uuid REFERENCES posts (id) NOT NULL,
  user_id uuid REFERENCES auth.users (id) NOT NULL,
  vote_type TEXT NOT NULL,
  UNIQUE (post_id, user_id)
);

-- Functions and triggers
CREATE OR REPLACE FUNCTION initialize_post_score()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO post_score (post_id, score)
  VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER initialize_post_score
AFTER INSERT ON posts
FOR EACH ROW EXECUTE FUNCTION initialize_post_score();

CREATE OR REPLACE FUNCTION update_post_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE post_score
  SET score = (
    SELECT SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE -1 END)
    FROM post_votes
    WHERE post_id = NEW.post_id
  )
  WHERE post_id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_score
AFTER INSERT OR UPDATE ON post_votes
FOR EACH ROW EXECUTE FUNCTION update_post_score();

-- Row-level security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_score ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "all can see" ON "public"."user_profiles"
  AS PERMISSIVE FOR SELECT
  TO PUBLIC USING (TRUE);

CREATE POLICY "users can insert" ON "public"."user_profiles"
  AS PERMISSIVE FOR INSERT
  TO PUBLIC WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owners can update" ON "public"."user_profiles"
  AS PERMISSIVE FOR UPDATE
  TO PUBLIC USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for post_contents
CREATE POLICY "all can see" ON "public"."post_contents"
  AS PERMISSIVE FOR SELECT
  TO PUBLIC USING (TRUE);

CREATE POLICY "authors can create" ON "public"."post_contents"
  AS PERMISSIVE FOR INSERT
  TO PUBLIC WITH CHECK (auth.uid() = user_id);

-- Policies for post_score
CREATE POLICY "all can see" ON "public"."post_score"
  AS PERMISSIVE FOR SELECT
  TO PUBLIC USING (TRUE);

-- Policies for post_votes
CREATE POLICY "all can see" ON "public"."post_votes"
  AS PERMISSIVE FOR SELECT
  TO PUBLIC USING (TRUE);

CREATE POLICY "owners can insert" ON "public"."post_votes"
  AS PERMISSIVE FOR INSERT
  TO PUBLIC WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owners can update" ON "public"."post_votes"
  AS PERMISSIVE FOR UPDATE
  TO PUBLIC USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Realtime Publication
BEGIN;
DROP PUBLICATION IF EXISTS supabase_realtime CASCADE;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;