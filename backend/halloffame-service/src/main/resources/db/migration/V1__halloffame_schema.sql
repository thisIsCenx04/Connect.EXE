-- =========================================================
-- Hall of Fame Service - PostgreSQL Schema V1
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
  CREATE TYPE hof_type AS ENUM ('STARTUP','PERSON');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE hof_status AS ENUM ('APPLIED','APPROVED','REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE hof_post_type AS ENUM ('STARTUP','PERSON','PROJECT_STORY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE hof_post_status AS ENUM ('DRAFT','PUBLISHED','ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE hof_link_type AS ENUM ('WEBSITE','PITCH_DECK','DEMO','REPO','SOCIAL','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE hof_media_role AS ENUM ('COVER','GALLERY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- HALL OF FAME ENTRIES
-- =========================================================
CREATE TABLE IF NOT EXISTS hall_of_fame_entries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type          hof_type NOT NULL,
  reference_id  uuid NOT NULL,
  score         numeric(6,2) NOT NULL DEFAULT 0,
  status        hof_status NOT NULL DEFAULT 'APPLIED',

  applied_by    uuid,
  reviewed_by   uuid,
  reviewed_at   timestamptz,

  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  UNIQUE(type, reference_id)
);

CREATE INDEX IF NOT EXISTS idx_hof_status_score ON hall_of_fame_entries(status, score DESC);

DROP TRIGGER IF EXISTS trg_hof_entries_updated_at ON hall_of_fame_entries;
CREATE TRIGGER trg_hof_entries_updated_at
BEFORE UPDATE ON hall_of_fame_entries
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- HALL OF FAME VOTES
-- =========================================================
CREATE TABLE IF NOT EXISTS hall_of_fame_votes (
  entry_id   uuid NOT NULL REFERENCES hall_of_fame_entries(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL,
  value      smallint NOT NULL CHECK (value IN (1,2,3,4,5)),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entry_id, user_id)
);

-- =========================================================
-- HALL OF FAME POSTS
-- =========================================================
CREATE TABLE IF NOT EXISTS hall_of_fame_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type hof_post_type NOT NULL,
  source_project_id uuid,
  title varchar(200) NOT NULL,
  summary text,
  body text NOT NULL,
  cover_url text,
  status hof_post_status NOT NULL DEFAULT 'DRAFT',
  created_by uuid,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_hof_posts_updated_at ON hall_of_fame_posts;
CREATE TRIGGER trg_hof_posts_updated_at
BEFORE UPDATE ON hall_of_fame_posts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- HALL OF FAME POST TAGS
-- =========================================================
CREATE TABLE IF NOT EXISTS hall_of_fame_post_tags (
  post_id uuid NOT NULL REFERENCES hall_of_fame_posts(id) ON DELETE CASCADE,
  tag varchar(50) NOT NULL,
  PRIMARY KEY (post_id, tag)
);

-- =========================================================
-- HALL OF FAME POST LINKS
-- =========================================================
CREATE TABLE IF NOT EXISTS hall_of_fame_post_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES hall_of_fame_posts(id) ON DELETE CASCADE,
  type hof_link_type NOT NULL,
  label varchar(120),
  url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hof_links_post ON hall_of_fame_post_links(post_id);

-- =========================================================
-- HALL OF FAME POST MEDIA
-- =========================================================
CREATE TABLE IF NOT EXISTS hall_of_fame_post_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES hall_of_fame_posts(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  role hof_media_role NOT NULL DEFAULT 'GALLERY',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hof_media_post ON hall_of_fame_post_media(post_id);

-- =========================================================
-- END
-- =========================================================
