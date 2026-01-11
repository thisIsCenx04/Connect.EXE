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
