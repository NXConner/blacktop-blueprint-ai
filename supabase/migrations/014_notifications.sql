CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Authenticated can read notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated can insert notifications" ON notifications FOR INSERT WITH CHECK (true);