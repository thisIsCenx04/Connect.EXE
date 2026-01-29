CREATE TABLE IF NOT EXISTS payment_wallets (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance_vnd bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_payment_wallets_updated_at ON payment_wallets;
CREATE TRIGGER trg_payment_wallets_updated_at
BEFORE UPDATE ON payment_wallets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
