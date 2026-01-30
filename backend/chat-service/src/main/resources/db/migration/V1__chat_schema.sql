-- =========================================================
-- Chat Service - PostgreSQL Schema V1
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
  CREATE TYPE conversation_type AS ENUM ('FOUNDER_INVESTOR','FOUNDER_MENTOR','STARTUP_TALENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- CONVERSATIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        conversation_type NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- CONVERSATION PARTICIPANTS
-- =========================================================
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL,
  joined_at       timestamptz NOT NULL DEFAULT now(),
  last_read_at    timestamptz,
  PRIMARY KEY (conversation_id, user_id)
);

-- =========================================================
-- MESSAGES
-- =========================================================
CREATE TABLE IF NOT EXISTS messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL,
  content         text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conv_time ON messages(conversation_id, created_at);

-- =========================================================
-- END
-- =========================================================
