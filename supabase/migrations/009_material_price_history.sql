CREATE TABLE IF NOT EXISTS material_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  price NUMERIC NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mph_key ON material_price_history(key);