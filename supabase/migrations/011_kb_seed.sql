INSERT INTO knowledge_base (category, key, value, source, tags)
VALUES
  ('taxes', 'sales_VA', '0.053'::jsonb, 'seed', ARRAY['sales','va'])
ON CONFLICT (category, key) DO NOTHING;

INSERT INTO knowledge_base (category, key, value, source, tags)
VALUES
  ('taxes', 'sales_NC', '0.0475'::jsonb, 'seed', ARRAY['sales','nc'])
ON CONFLICT (category, key) DO NOTHING;