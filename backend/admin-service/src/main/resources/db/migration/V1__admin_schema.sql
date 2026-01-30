-- =========================================================
-- Admin Service - PostgreSQL Schema V1
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
  CREATE TYPE audit_action AS ENUM ('CREATE','UPDATE','DELETE','APPROVE','REJECT','LOGIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE content_type AS ENUM ('ARTICLE','EVENT','COMPETITION','TREND');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE content_status AS ENUM ('DRAFT','PUBLISHED','ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE resource_type AS ENUM ('FILE','LINK');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE plan_code AS ENUM ('FREE','PRO','STARTUP','INVESTOR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('ACTIVE','PAST_DUE','CANCELLED','EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_provider AS ENUM ('STRIPE','MANUAL','VNPAY','MOMO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ai_agent_type AS ENUM ('IDEA_VALIDATOR','BMC_GENERATOR','PITCH_CREATOR','MARKET_RESEARCH','LEGAL_FINANCE_BASIC');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ai_usage_status AS ENUM ('SUCCESS','FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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

-- =========================================================
-- USERS TABLE (read-only view for admin)
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email            varchar(255) UNIQUE NOT NULL,
  password_hash    text,
  full_name        varchar(255),
  avatar_url       text,
  role             varchar(20) NOT NULL DEFAULT 'USER',
  headline         varchar(255),
  bio              text,

  country          varchar(2),
  city             varchar(120),

  verified_status  varchar(20) NOT NULL DEFAULT 'NONE',
  verified_at      timestamptz,

  email_verified   boolean NOT NULL DEFAULT false,
  email_verified_at timestamptz,

  is_active        boolean NOT NULL DEFAULT true,
  last_login_at    timestamptz,

  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_users_email_trgm ON users USING gin (email gin_trgm_ops);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- INVESTOR KYC
-- =========================================================
CREATE TABLE IF NOT EXISTS investor_kyc (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  status          varchar(20) NOT NULL DEFAULT 'PENDING',
  legal_name      varchar(255),
  organization    varchar(255),
  website         text,
  linkedin_url    text,

  doc_type        varchar(30),
  doc_number      varchar(100),
  doc_file_url    text,
  requested_role  varchar(20),

  submitted_at    timestamptz NOT NULL DEFAULT now(),
  reviewed_by     uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at     timestamptz,
  review_note     text,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kyc_status ON investor_kyc(status);

DROP TRIGGER IF EXISTS trg_kyc_updated_at ON investor_kyc;
CREATE TRIGGER trg_kyc_updated_at
BEFORE UPDATE ON investor_kyc
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- PROJECTS (read-only for admin)
-- =========================================================
CREATE TABLE IF NOT EXISTS projects (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

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
  reviewed_by      uuid REFERENCES users(id) ON DELETE SET NULL,
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
-- PLANS
-- =========================================================
CREATE TABLE IF NOT EXISTS plans (
  code             plan_code PRIMARY KEY,
  name             varchar(80) NOT NULL,
  price_month_usd  numeric(10,2) NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- SUBSCRIPTIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_code             plan_code NOT NULL REFERENCES plans(code),
  status                subscription_status NOT NULL DEFAULT 'ACTIVE',
  provider              payment_provider NOT NULL DEFAULT 'MANUAL',
  provider_sub_id       varchar(255),

  current_period_start  timestamptz,
  current_period_end    timestamptz,

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sub_user_status ON subscriptions(user_id, status);

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- CONTENT ITEMS
-- =========================================================
CREATE TABLE IF NOT EXISTS content_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type          content_type NOT NULL,
  status        content_status NOT NULL DEFAULT 'DRAFT',
  title         varchar(200) NOT NULL,
  slug          varchar(220) UNIQUE,
  summary       text,
  body          text,
  cover_url     text,
  tags          text[],

  start_at      timestamptz,
  end_at        timestamptz,
  location      varchar(255),
  external_url  text,

  created_by    uuid REFERENCES users(id) ON DELETE SET NULL,
  published_at  timestamptz,

  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_type_status ON content_items(type, status);
CREATE INDEX IF NOT EXISTS idx_content_published ON content_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_title_trgm ON content_items USING gin (title gin_trgm_ops);

DROP TRIGGER IF EXISTS trg_content_items_updated_at ON content_items;
CREATE TRIGGER trg_content_items_updated_at
BEFORE UPDATE ON content_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- RESOURCE ITEMS
-- =========================================================
CREATE TABLE IF NOT EXISTS resource_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         varchar(200) NOT NULL,
  description   text,
  type          resource_type NOT NULL,
  url           text NOT NULL,
  tags          text[],
  status        content_status NOT NULL DEFAULT 'PUBLISHED',
  created_by    uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resource_status ON resource_items(status);
CREATE INDEX IF NOT EXISTS idx_resource_title_trgm ON resource_items USING gin (title gin_trgm_ops);

DROP TRIGGER IF EXISTS trg_resource_items_updated_at ON resource_items;
CREATE TRIGGER trg_resource_items_updated_at
BEFORE UPDATE ON resource_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- AI REQUESTS (for admin dashboard)
-- =========================================================
CREATE TABLE IF NOT EXISTS ai_requests (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_type        ai_agent_type NOT NULL,

  input_text        text NOT NULL,
  input_json        jsonb,

  status            ai_usage_status NOT NULL DEFAULT 'SUCCESS',
  error_message     text,

  prompt_tokens     int,
  completion_tokens int,
  cost_usd          numeric(10,4),

  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_user_time ON ai_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_agent_time ON ai_requests(agent_type, created_at DESC);

-- =========================================================
-- AUDIT LOGS
-- =========================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid REFERENCES users(id) ON DELETE SET NULL,
  action      audit_action NOT NULL,
  object_type varchar(60) NOT NULL,
  object_id   uuid,
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor_time ON audit_logs(actor_id, created_at DESC);

-- =========================================================
-- SEED DATA: Plans
-- =========================================================
INSERT INTO plans (code, name, price_month_usd)
VALUES
  ('FREE','Free',0),
  ('PRO','Pro',19),
  ('STARTUP','Startup',99),
  ('INVESTOR','Investor',49)
ON CONFLICT (code) DO NOTHING;

-- =========================================================
-- ADMIN SEED
-- =========================================================
INSERT INTO users (
  email,
  password_hash,
  full_name,
  role,
  email_verified,
  email_verified_at,
  is_active,
  created_at,
  updated_at
) VALUES (
  'connectexe.dev@gmail.com',
  '$2a$10$7msF045d2BfRXvWnEgK2GOpRBPvPWhkzybzkPGsEpFYjQoAiFmkDi',
  'ConnectEXE Admin',
  'ADMIN',
  true,
  now(),
  true,
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

-- =========================================================
-- END
-- =========================================================
