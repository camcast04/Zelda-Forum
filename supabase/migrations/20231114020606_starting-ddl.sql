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

-- Create email_list table
CREATE TABLE email_list (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  user_id uuid REFERENCES auth.users (id),
  email text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  stop_asking boolean NOT NULL DEFAULT false,
  CONSTRAINT proper_email CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

-- Functions and Triggers
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

-- Policies
-- User Profiles
CREATE POLICY "all can see" ON user_profiles FOR SELECT TO PUBLIC USING (TRUE);
CREATE POLICY "users can insert" ON user_profiles FOR INSERT TO PUBLIC WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owners can update" ON user_profiles FOR UPDATE TO PUBLIC USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Posts
CREATE POLICY "all can see" ON posts FOR SELECT TO PUBLIC USING (TRUE);
CREATE POLICY "owners can insert" ON posts FOR INSERT TO PUBLIC WITH CHECK (auth.uid() = user_id);

-- Post Contents
CREATE POLICY "all can see" ON post_contents FOR SELECT TO PUBLIC USING (TRUE);
CREATE POLICY "authors can create" ON post_contents FOR INSERT TO PUBLIC WITH CHECK (auth.uid() = user_id);

-- Post Score
CREATE POLICY "all can see" ON post_score FOR SELECT TO PUBLIC USING (TRUE);

-- Post Votes
CREATE POLICY "all can see" ON post_votes FOR SELECT TO PUBLIC USING (TRUE);
CREATE POLICY "owners can insert" ON post_votes FOR INSERT TO PUBLIC WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owners can update" ON post_votes FOR UPDATE TO PUBLIC USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Email List
CREATE POLICY "owners can see their own" ON email_list FOR SELECT TO PUBLIC USING (auth.uid() = user_id);
CREATE POLICY "owners can insert for themselves" ON email_list FOR INSERT TO PUBLIC WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owners can update their data" ON email_list FOR UPDATE TO PUBLIC USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Functions for Posts and Comments
CREATE OR REPLACE FUNCTION create_new_post(userId uuid, title text, content text)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  new_id uuid := uuid_generate_v4();
BEGIN
  INSERT INTO posts (id, user_id, path) VALUES (new_id, userId, 'root');
  INSERT INTO post_contents (id, post_id, user_id, title, content) VALUES (uuid_generate_v4(), new_id, userId, title, content);
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION create_new_comment(userId uuid, content text, path ltree)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  new_id uuid := uuid_generate_v4();
BEGIN
  INSERT INTO posts (id, user_id, path) VALUES (new_id, userId, path);
  INSERT INTO post_contents (id, post_id, user_id, content) VALUES (uuid_generate_v4(), new_id, userId, content);
  RETURN new_id;
END;
$$;

-- Realtime Publication
BEGIN;
DROP PUBLICATION IF EXISTS supabase_realtime CASCADE;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;
