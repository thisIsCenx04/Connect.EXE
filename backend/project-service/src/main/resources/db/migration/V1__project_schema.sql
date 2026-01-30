-- =========================================================
-- Project Service - PostgreSQL Schema V1
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
  CREATE TYPE project_stage AS ENUM ('IDEA','MVP','REVENUE','EXIT_READY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE deal_type AS ENUM ('COFOUNDER','FUNDING','SELL_PROJECT','HIRE_TEAM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('DRAFT','PUBLISHED','MATCHING','IN_DEAL','CLOSED','HIDDEN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE project_moderation_status AS ENUM ('PENDING','APPROVED','REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE project_visibility AS ENUM ('PUBLIC','PRIVATE','HIDDEN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE project_link_type AS ENUM ('WEBSITE','PITCH_DECK','DEMO','REPO','SOCIAL','OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE project_media_role AS ENUM ('COVER','GALLERY','DOCUMENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE project_member_role AS ENUM ('FOUNDER','CO_FOUNDER','MEMBER','ADVISOR','INVESTOR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE interest_status AS ENUM ('REQUESTED','ACCEPTED','REJECTED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- PROJECTS TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS projects (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         uuid NOT NULL,

  title            varchar(200) NOT NULL,
  slug             varchar(220) UNIQUE,
  summary          text,
  description      text NOT NULL,
  content          text,

  stage            project_stage NOT NULL,
  industry         varchar(120) NOT NULL,
  country          varchar(2),

  status           project_status NOT NULL DEFAULT 'DRAFT',
  moderation_status project_moderation_status NOT NULL DEFAULT 'PENDING',
  visibility       project_visibility NOT NULL DEFAULT 'PRIVATE',
  deal_type        deal_type NOT NULL,

  funding_need_usd numeric(14,2),
  funding_target_usd numeric(14,2),
  funding_raised_usd numeric(14,2),
  valuation_usd    numeric(14,2),
  equity_percent   numeric(5,2),
  funding_timeline text,

  traction_summary text,
  traction_metrics text,
  pitch_deck_url   text,

  is_featured      boolean NOT NULL DEFAULT false,
  featured_rank    int,

  published_at     timestamptz,
  submitted_at     timestamptz,
  reviewed_by      uuid,
  reviewed_at      timestamptz,
  closed_at        timestamptz,

  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_filter ON projects(status, stage, industry, country, deal_type);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured, featured_rank);
CREATE INDEX IF NOT EXISTS idx_projects_title_trgm ON projects USING gin (title gin_trgm_ops);

DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- PROJECT MEMBERS
-- =========================================================
CREATE TABLE IF NOT EXISTS project_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL,
  role        project_member_role NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);

-- =========================================================
-- PROJECT TAGS
-- =========================================================
CREATE TABLE IF NOT EXISTS project_tags (
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag        varchar(50) NOT NULL,
  PRIMARY KEY (project_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_project_tags_tag ON project_tags(tag);

-- =========================================================
-- PROJECT ATTACHMENTS
-- =========================================================
CREATE TABLE IF NOT EXISTS project_attachments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_url   text NOT NULL,
  file_type  varchar(40),
  role       project_media_role,
  sort_order int,
  caption    text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_attachments_project ON project_attachments(project_id);

-- =========================================================
-- PROJECT LINKS
-- =========================================================
CREATE TABLE IF NOT EXISTS project_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type project_link_type NOT NULL,
  label varchar(120),
  url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_links_project ON project_links(project_id);

-- =========================================================
-- PROJECT INTERESTS
-- =========================================================
CREATE TABLE IF NOT EXISTS project_interests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_user_id  uuid NOT NULL,
  message       text,
  status        interest_status NOT NULL DEFAULT 'REQUESTED',

  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  UNIQUE(project_id, from_user_id)
);

CREATE INDEX IF NOT EXISTS idx_interests_project ON project_interests(project_id, status);
CREATE INDEX IF NOT EXISTS idx_interests_user ON project_interests(from_user_id, status);

DROP TRIGGER IF EXISTS trg_project_interests_updated_at ON project_interests;
CREATE TRIGGER trg_project_interests_updated_at
BEFORE UPDATE ON project_interests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- MATCH RECOMMENDATIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS match_recommendations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  target_user_id uuid NOT NULL,
  score          numeric(6,2) NOT NULL,
  reason_json    jsonb,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, target_user_id)
);

CREATE INDEX IF NOT EXISTS idx_match_project_score ON match_recommendations(project_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_match_target_score ON match_recommendations(target_user_id, score DESC);

-- =========================================================
-- END
-- =========================================================
