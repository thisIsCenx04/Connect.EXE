-- =========================================================
-- Auth Service - PostgreSQL Schema V1
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

-- =========================================================
-- USERS TABLE
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
-- OAUTH ACCOUNTS
-- =========================================================
CREATE TABLE IF NOT EXISTS user_oauth_accounts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider      varchar(20) NOT NULL,
  provider_uid  varchar(255) NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider, provider_uid)
);

CREATE INDEX IF NOT EXISTS idx_oauth_user ON user_oauth_accounts(user_id);

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
-- EMAIL VERIFICATION TOKENS
-- =========================================================
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

-- =========================================================
-- PASSWORD RESET TOKENS
-- =========================================================
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
-- INVESTOR PREFERENCES (for matching)
-- =========================================================
CREATE TABLE IF NOT EXISTS investor_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  industries text,
  stages text,
  min_funding_usd numeric(14,2),
  max_funding_usd numeric(14,2),
  country varchar(2),
  city varchar(120),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_investor_preferences_user ON investor_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_preferences_country ON investor_preferences(country);

DROP TRIGGER IF EXISTS trg_investor_preferences_updated_at ON investor_preferences;
CREATE TRIGGER trg_investor_preferences_updated_at
BEFORE UPDATE ON investor_preferences
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

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
