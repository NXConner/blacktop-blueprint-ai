CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  parent_id UUID REFERENCES chart_of_accounts(id),
  is_active BOOLEAN DEFAULT TRUE,
  balance NUMERIC DEFAULT 0,
  tax_line TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  reference TEXT,
  total_debit NUMERIC NOT NULL,
  total_credit NUMERIC NOT NULL,
  is_posted BOOLEAN DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  posted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID REFERENCES chart_of_accounts(id),
  account_code TEXT,
  account_name TEXT,
  description TEXT,
  debit_amount NUMERIC DEFAULT 0,
  credit_amount NUMERIC DEFAULT 0,
  line_number INTEGER
);

CREATE INDEX IF NOT EXISTS idx_je_date ON journal_entries(date);
CREATE INDEX IF NOT EXISTS idx_jel_je ON journal_entry_lines(journal_entry_id);