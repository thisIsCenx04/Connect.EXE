-- =========================================================
-- Payment Service - PostgreSQL Schema V1
-- =========================================================

-- 0) Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
  CREATE TYPE payment_provider AS ENUM ('STRIPE','MANUAL','VNPAY','MOMO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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
-- PLAN ENTITLEMENTS
-- =========================================================
CREATE TABLE IF NOT EXISTS plan_entitlements (
  plan_code   plan_code NOT NULL REFERENCES plans(code) ON DELETE CASCADE,
  key         entitlement_key NOT NULL,
  limit_value int,
  PRIMARY KEY (plan_code, key)
);

-- =========================================================
-- SUBSCRIPTIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL,
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
-- USAGE COUNTERS
-- =========================================================
CREATE TABLE IF NOT EXISTS usage_counters (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  key         entitlement_key NOT NULL,
  period_ym   char(7) NOT NULL,
  used_value  int NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, key, period_ym)
);

CREATE INDEX IF NOT EXISTS idx_usage_user_period ON usage_counters(user_id, period_ym);

-- =========================================================
-- PAYMENT ORDERS
-- =========================================================
CREATE TABLE IF NOT EXISTS payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_code plan_code NOT NULL REFERENCES plans(code),
  duration_months int NOT NULL,
  amount_vnd bigint NOT NULL,
  provider payment_provider NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'PENDING',
  order_code varchar(80) NOT NULL UNIQUE,
  request_id varchar(80),
  provider_trans_id varchar(120),
  response_code varchar(40),
  pay_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON payment_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_code ON payment_orders(order_code);

DROP TRIGGER IF EXISTS trg_payment_orders_updated_at ON payment_orders;
CREATE TRIGGER trg_payment_orders_updated_at
BEFORE UPDATE ON payment_orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- PAYMENT WALLETS
-- =========================================================
CREATE TABLE IF NOT EXISTS payment_wallets (
  user_id uuid PRIMARY KEY,
  balance_vnd bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_payment_wallets_updated_at ON payment_wallets;
CREATE TRIGGER trg_payment_wallets_updated_at
BEFORE UPDATE ON payment_wallets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- SEED DATA: Plans + Entitlements
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
  ('STARTUP','PROJECT_POST_LIMIT',NULL),
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
