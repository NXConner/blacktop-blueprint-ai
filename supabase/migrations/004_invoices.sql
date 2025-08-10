CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_created ON invoices(created_at);