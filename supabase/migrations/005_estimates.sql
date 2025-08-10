CREATE TABLE IF NOT EXISTS estimates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT,
  client_address TEXT,
  service_type TEXT NOT NULL,
  inputs JSONB NOT NULL,
  breakdown JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_estimates_created ON estimates(created_at);