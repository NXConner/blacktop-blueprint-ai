-- Business Profile singleton
authentication;

CREATE TABLE IF NOT EXISTS business_profile (
  id TEXT PRIMARY KEY CHECK (id = 'singleton'),
  profile JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge Base table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  source TEXT,
  tags TEXT[],
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, key)
);

CREATE INDEX IF NOT EXISTS idx_kb_category_key ON knowledge_base(category, key);