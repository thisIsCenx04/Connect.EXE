-- =========================================================
-- Forum Service - PostgreSQL Schema V1
-- =========================================================

-- 0) Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1) Helper function: updated_at auto set
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- ENUM TYPES
-- =========================================================
DO $$ BEGIN
  CREATE TYPE post_status AS ENUM ('PUBLISHED','HIDDEN','DELETED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vote_type AS ENUM ('UP','DOWN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- FORUM CATEGORIES
-- =========================================================
CREATE TABLE IF NOT EXISTS forum_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar(120) NOT NULL UNIQUE,
  slug        varchar(140) NOT NULL UNIQUE,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- FORUM POSTS
-- =========================================================
CREATE TABLE IF NOT EXISTS forum_posts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id    uuid NOT NULL REFERENCES forum_categories(id) ON DELETE RESTRICT,
  author_id      uuid NOT NULL,

  title          varchar(200) NOT NULL,
  content        text NOT NULL,
  status         post_status NOT NULL DEFAULT 'PUBLISHED',

  upvote_count   int NOT NULL DEFAULT 0,
  downvote_count int NOT NULL DEFAULT 0,
  comment_count  int NOT NULL DEFAULT 0,

  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_category_time ON forum_posts(category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_time ON forum_posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_title_trgm ON forum_posts USING gin (title gin_trgm_ops);

DROP TRIGGER IF EXISTS trg_forum_posts_updated_at ON forum_posts;
CREATE TRIGGER trg_forum_posts_updated_at
BEFORE UPDATE ON forum_posts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- FORUM COMMENTS
-- =========================================================
CREATE TABLE IF NOT EXISTS forum_comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id   uuid NOT NULL,
  parent_id   uuid REFERENCES forum_comments(id) ON DELETE CASCADE,

  content     text NOT NULL,
  status      post_status NOT NULL DEFAULT 'PUBLISHED',

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_time ON forum_comments(post_id, created_at);

DROP TRIGGER IF EXISTS trg_forum_comments_updated_at ON forum_comments;
CREATE TRIGGER trg_forum_comments_updated_at
BEFORE UPDATE ON forum_comments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- FORUM VOTES
-- =========================================================
CREATE TABLE IF NOT EXISTS forum_votes (
  post_id    uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL,
  vote       vote_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- =========================================================
-- USER REPUTATION
-- =========================================================
CREATE TABLE IF NOT EXISTS user_reputation (
  user_id    uuid PRIMARY KEY,
  points     int NOT NULL DEFAULT 0,
  level      varchar(30) NOT NULL DEFAULT 'NEWBIE',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- REPUTATION EVENTS
-- =========================================================
CREATE TABLE IF NOT EXISTS reputation_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  event_type  varchar(50) NOT NULL,
  ref_id      uuid,
  delta       int NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rep_events_user_time ON reputation_events(user_id, created_at DESC);

-- =========================================================
-- SEED DEFAULT CATEGORIES
-- =========================================================
INSERT INTO forum_categories (name, slug, sort_order) VALUES
  ('General Discussion', 'general-discussion', 1),
  ('Startup Ideas', 'startup-ideas', 2),
  ('Funding & Investment', 'funding-investment', 3),
  ('Technical', 'technical', 4),
  ('Marketing', 'marketing', 5),
  ('Legal & Finance', 'legal-finance', 6)
ON CONFLICT (name) DO NOTHING;

-- =========================================================
-- END
-- =========================================================
