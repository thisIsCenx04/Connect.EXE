-- =========================================================
-- AI Service - PostgreSQL Schema V1
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
  CREATE TYPE ai_agent_type AS ENUM ('IDEA_VALIDATOR','BMC_GENERATOR','PITCH_CREATOR','MARKET_RESEARCH','LEGAL_FINANCE_BASIC');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ai_usage_status AS ENUM ('SUCCESS','FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- AI REQUESTS
-- =========================================================
CREATE TABLE IF NOT EXISTS ai_requests (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL,
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
-- AI OUTPUTS
-- =========================================================
CREATE TABLE IF NOT EXISTS ai_outputs (
  request_id   uuid PRIMARY KEY REFERENCES ai_requests(id) ON DELETE CASCADE,
  output_text  text,
  output_json  jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- END
-- =========================================================
