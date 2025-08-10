INSERT INTO chart_of_accounts (code, name, type, category, is_active, balance)
VALUES
  ('1100', 'Accounts Receivable', 'asset', 'current_asset', true, 0)
ON CONFLICT (code) DO NOTHING;

INSERT INTO chart_of_accounts (code, name, type, category, is_active, balance)
VALUES
  ('4000', 'Service Revenue', 'revenue', 'operating_revenue', true, 0)
ON CONFLICT (code) DO NOTHING;

INSERT INTO chart_of_accounts (code, name, type, category, is_active, balance)
VALUES
  ('5000', 'Materials Expense', 'expense', 'cost_of_goods_sold', true, 0)
ON CONFLICT (code) DO NOTHING;

INSERT INTO chart_of_accounts (code, name, type, category, is_active, balance)
VALUES
  ('5100', 'Labor Expense', 'expense', 'operating_expense', true, 0)
ON CONFLICT (code) DO NOTHING;

INSERT INTO chart_of_accounts (code, name, type, category, is_active, balance)
VALUES
  ('5200', 'Overhead Expense', 'expense', 'operating_expense', true, 0)
ON CONFLICT (code) DO NOTHING;