-- =========================================================
-- AIO Startup Platform - PostgreSQL Schema (MVP / Single DB)
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
-- 2) ENUM TYPES
-- =========================================================
DO $$ BEGIN
  -- auth/user
  CREATE TYPE user_role AS ENUM ('GUEST','FOUNDER','INVESTOR','MENTOR','ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('NONE','PENDING','APPROVED','REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE oauth_provider AS ENUM ('GOOGLE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE kyc_doc_type AS ENUM ('ID_CARD','PASSPORT','DRIVER_LICENSE','BUSINESS_LICENSE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- project market


DO $$ BEGIN
  CREATE TYPE interest_status AS ENUM ('REQUESTED','ACCEPTED','REJECTED','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- forum
DO $$ BEGIN
  CREATE TYPE post_status AS ENUM ('PUBLISHED','HIDDEN','DELETED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vote_type AS ENUM ('UP','DOWN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ai
DO $$ BEGIN
  CREATE TYPE ai_agent_type AS ENUM ('IDEA_VALIDATOR','BMC_GENERATOR','PITCH_CREATOR','MARKET_RESEARCH','LEGAL_FINANCE_BASIC');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ai_usage_status AS ENUM ('SUCCESS','FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- hall of fame
DO $$ BEGIN
  CREATE TYPE hof_type AS ENUM ('STARTUP','PERSON');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE hof_status AS ENUM ('APPLIED','APPROVED','REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- matching/chat
DO $$ BEGIN
  CREATE TYPE conversation_type AS ENUM ('FOUNDER_INVESTOR','FOUNDER_MENTOR','STARTUP_TALENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- payment
DO $$ BEGIN
  CREATE TYPE plan_code AS ENUM ('FREE','PRO','STARTUP','INVESTOR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('ACTIVE','PAST_DUE','CANCELLED','EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE entitlement_key AS ENUM (
    'AI_IDEA_VALIDATE','AI_PITCH',
    'PROJECT_POST_LIMIT','PROJECT_FEATURED',
    'INVESTOR_CONTACT','MATCHING_PRIORITY'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_provider AS ENUM ('STRIPE','MANUAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- audit
DO $$ BEGIN
  CREATE TYPE audit_action AS ENUM ('CREATE','UPDATE','DELETE','APPROVE','REJECT','LOGIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- =========================================================
-- 3) AUTH + USER + VERIFICATION
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email            varchar(255) UNIQUE NOT NULL,
  password_hash    text, -- nullable for SSO-only
  full_name        varchar(255),
  avatar_url       text,
  role             varchar(20) NOT NULL DEFAULT 'USER',
  headline         varchar(255),
  bio              text,

  country          varchar(2),   -- ISO2
  city             varchar(120),

  verified_status  varchar(20) NOT NULL DEFAULT 'NONE',
  verified_at      timestamptz,

  is_active        boolean NOT NULL DEFAULT true,
  last_login_at    timestamptz,

  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_verified_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_users_email_trgm ON users USING gin (email gin_trgm_ops);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS user_oauth_accounts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider      varchar(20) NOT NULL,
  provider_uid  varchar(255) NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider, provider_uid)
);

CREATE INDEX IF NOT EXISTS idx_oauth_user ON user_oauth_accounts(user_id);


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


CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       text NOT NULL UNIQUE,
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_verification_user ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_token ON email_verification_tokens(token);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       text NOT NULL UNIQUE,
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);


-- =========================================================
-- 4) PROJECT MARKET (CORE)
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

DO $$ BEGIN
  CREATE TYPE project_member_role AS ENUM ('FOUNDER','CO_FOUNDER','MEMBER','ADVISOR','INVESTOR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS project_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        project_member_role NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);


CREATE TABLE IF NOT EXISTS project_tags (
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag        varchar(50) NOT NULL,
  PRIMARY KEY (project_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_project_tags_tag ON project_tags(tag);


CREATE TABLE IF NOT EXISTS project_attachments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_url   text NOT NULL,
  file_type  varchar(40),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_attachments_project ON project_attachments(project_id);


CREATE TABLE IF NOT EXISTS project_interests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_user_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- investor/mentor/talent
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
-- 5) FORUM + REPUTATION
-- =========================================================

CREATE TABLE IF NOT EXISTS forum_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        varchar(120) NOT NULL UNIQUE,
  slug        varchar(140) NOT NULL UNIQUE,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_posts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id    uuid NOT NULL REFERENCES forum_categories(id) ON DELETE RESTRICT,
  author_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

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


CREATE TABLE IF NOT EXISTS forum_comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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


CREATE TABLE IF NOT EXISTS forum_votes (
  post_id    uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote       vote_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);


CREATE TABLE IF NOT EXISTS user_reputation (
  user_id    uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  points     int NOT NULL DEFAULT 0,
  level      varchar(30) NOT NULL DEFAULT 'NEWBIE',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reputation_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type  varchar(50) NOT NULL, -- POST_CREATED, UPVOTE_RECEIVED...
  ref_id      uuid,
  delta       int NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rep_events_user_time ON reputation_events(user_id, created_at DESC);


-- =========================================================
-- 6) AI AGENT
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

CREATE TABLE IF NOT EXISTS ai_outputs (
  request_id   uuid PRIMARY KEY REFERENCES ai_requests(id) ON DELETE CASCADE,
  output_text  text,
  output_json  jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);


-- =========================================================
-- 7) HALL OF FAME
-- =========================================================

CREATE TABLE IF NOT EXISTS hall_of_fame_entries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type          hof_type NOT NULL,
  reference_id  uuid NOT NULL, -- project_id or user_id
  score         numeric(6,2) NOT NULL DEFAULT 0,
  status        hof_status NOT NULL DEFAULT 'APPLIED',

  applied_by    uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_by   uuid REFERENCES users(id) ON DELETE SET NULL,
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


CREATE TABLE IF NOT EXISTS hall_of_fame_votes (
  entry_id   uuid NOT NULL REFERENCES hall_of_fame_entries(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value      smallint NOT NULL CHECK (value IN (1,2,3,4,5)),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entry_id, user_id)
);


-- =========================================================
-- 8) MATCHING + CHAT
-- =========================================================

CREATE TABLE IF NOT EXISTS match_recommendations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  target_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score          numeric(6,2) NOT NULL,
  reason_json    jsonb,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, target_user_id)
);

CREATE INDEX IF NOT EXISTS idx_match_project_score ON match_recommendations(project_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_match_target_score ON match_recommendations(target_user_id, score DESC);


CREATE TABLE IF NOT EXISTS conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        conversation_type NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at       timestamptz NOT NULL DEFAULT now(),
  last_read_at    timestamptz,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content         text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conv_time ON messages(conversation_id, created_at);


-- =========================================================
-- 9) PAYMENT (subscription + entitlements + usage)
-- =========================================================

CREATE TABLE IF NOT EXISTS plans (
  code             plan_code PRIMARY KEY,
  name             varchar(80) NOT NULL,
  price_month_usd  numeric(10,2) NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plan_entitlements (
  plan_code   plan_code NOT NULL REFERENCES plans(code) ON DELETE CASCADE,
  key         entitlement_key NOT NULL,
  limit_value int, -- NULL = unlimited
  PRIMARY KEY (plan_code, key)
);

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


CREATE TABLE IF NOT EXISTS usage_counters (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key         entitlement_key NOT NULL,
  period_ym   char(7) NOT NULL, -- 'YYYY-MM'
  used_value  int NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, key, period_ym)
);

CREATE INDEX IF NOT EXISTS idx_usage_user_period ON usage_counters(user_id, period_ym);


-- =========================================================
-- 10) ADMIN / AUDIT LOGS
-- =========================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid REFERENCES users(id) ON DELETE SET NULL,
  action      audit_action NOT NULL,
  object_type varchar(60) NOT NULL, -- 'project','user','kyc','post','hof'...
  object_id   uuid,
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor_time ON audit_logs(actor_id, created_at DESC);


-- =========================================================
-- 11) OPTIONAL SEED DATA (plans + entitlements)
-- =========================================================

INSERT INTO plans (code, name, price_month_usd)
VALUES
  ('FREE','Free',0),
  ('PRO','Pro',19),
  ('STARTUP','Startup',99),
  ('INVESTOR','Investor',49)
ON CONFLICT (code) DO NOTHING;

-- FREE
INSERT INTO plan_entitlements (plan_code, key, limit_value) VALUES
  ('FREE','AI_IDEA_VALIDATE',3),
  ('FREE','AI_PITCH',0),
  ('FREE','PROJECT_POST_LIMIT',1),
  ('FREE','PROJECT_FEATURED',0),
  ('FREE','INVESTOR_CONTACT',0),
  ('FREE','MATCHING_PRIORITY',0)
ON CONFLICT (plan_code, key) DO NOTHING;

-- PRO
INSERT INTO plan_entitlements (plan_code, key, limit_value) VALUES
  ('PRO','AI_IDEA_VALIDATE',50),
  ('PRO','AI_PITCH',20),
  ('PRO','PROJECT_POST_LIMIT',5),
  ('PRO','PROJECT_FEATURED',1),
  ('PRO','INVESTOR_CONTACT',5),
  ('PRO','MATCHING_PRIORITY',0)
ON CONFLICT (plan_code, key) DO NOTHING;

-- STARTUP
INSERT INTO plan_entitlements (plan_code, key, limit_value) VALUES
  ('STARTUP','AI_IDEA_VALIDATE',200),
  ('STARTUP','AI_PITCH',100),
  ('STARTUP','PROJECT_POST_LIMIT',NULL),  -- unlimited
  ('STARTUP','PROJECT_FEATURED',3),
  ('STARTUP','INVESTOR_CONTACT',20),
  ('STARTUP','MATCHING_PRIORITY',1)
ON CONFLICT (plan_code, key) DO NOTHING;

-- INVESTOR
INSERT INTO plan_entitlements (plan_code, key, limit_value) VALUES
  ('INVESTOR','AI_IDEA_VALIDATE',20),
  ('INVESTOR','AI_PITCH',10),
  ('INVESTOR','PROJECT_POST_LIMIT',0),
  ('INVESTOR','PROJECT_FEATURED',0),
  ('INVESTOR','INVESTOR_CONTACT',NULL),
  ('INVESTOR','MATCHING_PRIORITY',1)
ON CONFLICT (plan_code, key) DO NOTHING;

-- =========================================================
-- END
-- =========================================================
