-- Invoice lifecycle and receipts
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS lifecycle_status TEXT DEFAULT 'draft';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS sent_at timestamptz;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS viewed_at timestamptz;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS paid_at timestamptz;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE TABLE IF NOT EXISTS public.invoice_status_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_receipts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id uuid REFERENCES public.payments(id) ON DELETE CASCADE,
  receipt_number TEXT,
  issued_at timestamptz DEFAULT now(),
  payload jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Authenticated read invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated update invoices" ON public.invoices FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated read status history" ON public.invoice_status_history FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated insert status history" ON public.invoice_status_history FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated read receipts" ON public.payment_receipts FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated insert receipts" ON public.payment_receipts FOR INSERT WITH CHECK (true);