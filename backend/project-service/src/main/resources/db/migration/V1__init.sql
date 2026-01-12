CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TYPE project_stage AS ENUM ('IDEA','MVP','REVENUE','EXIT_READY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE deal_type AS ENUM ('COFOUNDER','FUNDING','SELL_PROJECT','HIRE_TEAM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('DRAFT','PUBLISHED','MATCHING','IN_DEAL','CLOSED','HIDDEN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS projects (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            varchar(200) NOT NULL,
  slug             varchar(220) UNIQUE,
  description      text NOT NULL,
  stage            project_stage NOT NULL,
  industry         varchar(120) NOT NULL,
  country          varchar(2),
  status           project_status NOT NULL DEFAULT 'DRAFT',
  deal_type        deal_type NOT NULL,
  funding_need_usd numeric(14,2),
  equity_percent   numeric(5,2),
  traction_summary text,
  pitch_deck_url   text,
  is_featured      boolean NOT NULL DEFAULT false,
  featured_rank    int,
  published_at     timestamptz,
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
