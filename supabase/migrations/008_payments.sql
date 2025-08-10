ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unpaid';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0;

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  method TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);