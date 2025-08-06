-- ================================
-- MODULE MANAGEMENT SYSTEM TABLES
-- ================================

-- Table for tracking installed modules
CREATE TABLE IF NOT EXISTS installed_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  description TEXT,
  version VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'inactive' CHECK (status IN ('installing', 'active', 'inactive', 'error', 'updating')),
  configuration JSONB DEFAULT '{}',
  health_status JSONB DEFAULT '{}',
  dependencies TEXT[] DEFAULT '{}',
  installed_by UUID REFERENCES auth.users(id),
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activated_at TIMESTAMP WITH TIME ZONE,
  last_health_check TIMESTAMP WITH TIME ZONE
);

-- Table for module marketplace catalog
CREATE TABLE IF NOT EXISTS module_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL,
  subcategory VARCHAR,
  version VARCHAR NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  pricing_model VARCHAR DEFAULT 'monthly' CHECK (pricing_model IN ('free', 'one_time', 'monthly', 'annual')),
  rating DECIMAL(3,2) DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  features TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  implementation_path VARCHAR,
  estimated_time VARCHAR,
  download_url VARCHAR,
  checksum_sha256 VARCHAR,
  dependencies TEXT[] DEFAULT '{}',
  compatibility JSONB DEFAULT '{}',
  documentation_url VARCHAR,
  support_url VARCHAR,
  provider_id UUID,
  status VARCHAR DEFAULT 'available' CHECK (status IN ('available', 'deprecated', 'beta', 'coming_soon')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for module providers/developers
CREATE TABLE IF NOT EXISTS module_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  company VARCHAR,
  email VARCHAR,
  website VARCHAR,
  description TEXT,
  verified BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  total_modules INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for module reviews and ratings
CREATE TABLE IF NOT EXISTS module_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id VARCHAR NOT NULL REFERENCES module_catalog(module_id),
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR,
  review TEXT,
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id, user_id)
);

-- Table for module installation logs
CREATE TABLE IF NOT EXISTS module_installation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id VARCHAR NOT NULL,
  installation_id UUID,
  log_level VARCHAR DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warning', 'error')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for module configuration schemas
CREATE TABLE IF NOT EXISTS module_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id VARCHAR NOT NULL REFERENCES module_catalog(module_id),
  version VARCHAR NOT NULL,
  config_schema JSONB NOT NULL,
  default_values JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for module permissions
CREATE TABLE IF NOT EXISTS module_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id VARCHAR NOT NULL,
  resource VARCHAR NOT NULL,
  actions TEXT[] NOT NULL,
  roles TEXT[] NOT NULL,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for module rollback points
CREATE TABLE IF NOT EXISTS module_rollbacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rollback_id VARCHAR NOT NULL UNIQUE,
  module_id VARCHAR NOT NULL,
  rollback_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Table for module downloads and analytics
CREATE TABLE IF NOT EXISTS module_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id VARCHAR NOT NULL REFERENCES module_catalog(module_id),
  user_id UUID REFERENCES auth.users(id),
  version VARCHAR,
  download_type VARCHAR DEFAULT 'install' CHECK (download_type IN ('install', 'update', 'trial')),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for module subscriptions and licensing
CREATE TABLE IF NOT EXISTS module_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  module_id VARCHAR NOT NULL REFERENCES module_catalog(module_id),
  subscription_type VARCHAR DEFAULT 'monthly' CHECK (subscription_type IN ('trial', 'monthly', 'annual', 'lifetime')),
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
  price DECIMAL(10,2),
  billing_cycle INTEGER DEFAULT 1,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  subscription_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_end TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  payment_method_id VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

CREATE INDEX IF NOT EXISTS idx_installed_modules_status ON installed_modules(status);
CREATE INDEX IF NOT EXISTS idx_installed_modules_category ON installed_modules(category);
CREATE INDEX IF NOT EXISTS idx_installed_modules_user ON installed_modules(installed_by);

CREATE INDEX IF NOT EXISTS idx_module_catalog_category ON module_catalog(category);
CREATE INDEX IF NOT EXISTS idx_module_catalog_status ON module_catalog(status);
CREATE INDEX IF NOT EXISTS idx_module_catalog_rating ON module_catalog(rating DESC);
CREATE INDEX IF NOT EXISTS idx_module_catalog_downloads ON module_catalog(download_count DESC);

CREATE INDEX IF NOT EXISTS idx_module_reviews_module ON module_reviews(module_id);
CREATE INDEX IF NOT EXISTS idx_module_reviews_rating ON module_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_module_logs_module ON module_installation_logs(module_id);
CREATE INDEX IF NOT EXISTS idx_module_logs_timestamp ON module_installation_logs(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_module_downloads_module ON module_downloads(module_id);
CREATE INDEX IF NOT EXISTS idx_module_downloads_date ON module_downloads(downloaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_module_subscriptions_user ON module_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_module_subscriptions_module ON module_subscriptions(module_id);
CREATE INDEX IF NOT EXISTS idx_module_subscriptions_status ON module_subscriptions(status);

-- ================================
-- FUNCTIONS AND TRIGGERS
-- ================================

-- Function to update module download count
CREATE OR REPLACE FUNCTION update_module_download_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.success = true THEN
    UPDATE module_catalog 
    SET download_count = download_count + 1,
        updated_at = NOW()
    WHERE module_id = NEW.module_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for download count updates
DROP TRIGGER IF EXISTS trigger_update_download_count ON module_downloads;
CREATE TRIGGER trigger_update_download_count
  AFTER INSERT ON module_downloads
  FOR EACH ROW
  EXECUTE FUNCTION update_module_download_count();

-- Function to update module rating
CREATE OR REPLACE FUNCTION update_module_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE module_catalog 
  SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM module_reviews 
    WHERE module_id = COALESCE(NEW.module_id, OLD.module_id)
  ),
  updated_at = NOW()
  WHERE module_id = COALESCE(NEW.module_id, OLD.module_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for rating updates
DROP TRIGGER IF EXISTS trigger_update_rating_insert ON module_reviews;
CREATE TRIGGER trigger_update_rating_insert
  AFTER INSERT ON module_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_module_rating();

DROP TRIGGER IF EXISTS trigger_update_rating_update ON module_reviews;
CREATE TRIGGER trigger_update_rating_update
  AFTER UPDATE ON module_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_module_rating();

DROP TRIGGER IF EXISTS trigger_update_rating_delete ON module_reviews;
CREATE TRIGGER trigger_update_rating_delete
  AFTER DELETE ON module_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_module_rating();

-- Function to clean up expired rollbacks
CREATE OR REPLACE FUNCTION cleanup_expired_rollbacks()
RETURNS void AS $$
BEGIN
  DELETE FROM module_rollbacks 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get module statistics
CREATE OR REPLACE FUNCTION get_module_stats(p_module_id VARCHAR DEFAULT NULL)
RETURNS TABLE (
  module_id VARCHAR,
  total_installs BIGINT,
  active_installs BIGINT,
  avg_rating DECIMAL,
  total_reviews BIGINT,
  total_downloads BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mc.module_id,
    COUNT(DISTINCT im.id) as total_installs,
    COUNT(DISTINCT im.id) FILTER (WHERE im.status = 'active') as active_installs,
    mc.rating as avg_rating,
    COUNT(DISTINCT mr.id) as total_reviews,
    mc.download_count as total_downloads
  FROM module_catalog mc
  LEFT JOIN installed_modules im ON mc.module_id = im.module_id
  LEFT JOIN module_reviews mr ON mc.module_id = mr.module_id
  WHERE (p_module_id IS NULL OR mc.module_id = p_module_id)
  GROUP BY mc.module_id, mc.rating, mc.download_count
  ORDER BY mc.download_count DESC;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- SEED DATA FOR TESTING
-- ================================

-- Insert sample module providers
INSERT INTO module_providers (id, name, company, email, verified, rating) VALUES
('00000000-0000-0000-0000-000000000001', 'Blacktop Systems', 'Blacktop Blackout Inc.', 'modules@blacktop-blackout.com', true, 4.8),
('00000000-0000-0000-0000-000000000002', 'Construction Tech Solutions', 'CTS Corp', 'support@cts-corp.com', true, 4.6),
('00000000-0000-0000-0000-000000000003', 'Enterprise Addons', 'EA Ltd', 'contact@enterprise-addons.com', true, 4.7)
ON CONFLICT (id) DO NOTHING;

-- Insert sample modules from the catalog
INSERT INTO module_catalog (
  module_id, name, description, category, version, price, rating, download_count,
  features, benefits, requirements, implementation_path, estimated_time,
  download_url, provider_id, status
) VALUES
-- Financial Modules
(
  'quickbooks', 'QuickBooks Integration', 'Two-way sync with QuickBooks Online/Desktop',
  'financial', '1.0.0', 299.00, 4.8, 1250,
  ARRAY['Automated invoicing', 'Expense tracking', 'Financial reporting', 'Tax preparation'],
  ARRAY['60% faster accounting', 'Reduced errors', 'Real-time sync'],
  ARRAY['QuickBooks Online/Desktop', 'API Access'],
  'src/integrations/quickbooks/', '2-3 days',
  'https://downloads.blacktop-blackout.com/modules/quickbooks-1.0.0.zip',
  '00000000-0000-0000-0000-000000000001', 'available'
),
(
  'accounting-suite', 'Advanced Accounting Suite', 'Full double-entry bookkeeping system',
  'financial', '1.0.0', 499.00, 4.9, 890,
  ARRAY['General ledger', 'AP/AR management', 'Bank reconciliation', 'Multi-currency'],
  ARRAY['60% overhead reduction', 'GAAP compliance', 'Real-time reporting'],
  ARRAY['Database access', 'Accounting knowledge'],
  'src/services/accounting/', '1-2 weeks',
  'https://downloads.blacktop-blackout.com/modules/accounting-suite-1.0.0.zip',
  '00000000-0000-0000-0000-000000000001', 'available'
),

-- Veteran Services
(
  'veteran-certification', 'Veteran Business Certification', 'VOSB/SDVOSB compliance tracking',
  'veteran', '1.0.0', 349.00, 4.9, 234,
  ARRAY['Certification management', 'Contract alerts', 'Set-aside tracking', 'Reporting'],
  ARRAY['$500B+ contract access', 'Compliance automation', 'Opportunity alerts'],
  ARRAY['Veteran status verification', 'Business registration'],
  'src/services/veteran-services/', '1-2 days',
  'https://downloads.blacktop-blackout.com/modules/veteran-cert-1.0.0.zip',
  '00000000-0000-0000-0000-000000000002', 'available'
),

-- Environmental Modules
(
  'environmental-compliance', 'Environmental Compliance Suite', 'EPA regulation compliance',
  'environmental', '1.0.0', 499.00, 4.8, 334,
  ARRAY['Air quality', 'Water management', 'Soil tracking', 'Carbon footprint'],
  ARRAY['EPA compliant', 'OSHA ready', 'Risk mitigation'],
  ARRAY['Environmental permits', 'Monitoring equipment'],
  'src/services/environmental/', '2-3 weeks',
  'https://downloads.blacktop-blackout.com/modules/environmental-1.0.0.zip',
  '00000000-0000-0000-0000-000000000003', 'available'
)
ON CONFLICT (module_id) DO NOTHING;

-- ================================
-- ROW LEVEL SECURITY
-- ================================

-- Enable RLS on tables
ALTER TABLE installed_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_installation_logs ENABLE ROW LEVEL SECURITY;

-- Policies for installed_modules
CREATE POLICY "Users can view their own installed modules" ON installed_modules
  FOR SELECT USING (installed_by = auth.uid());

CREATE POLICY "Users can insert their own module installations" ON installed_modules
  FOR INSERT WITH CHECK (installed_by = auth.uid());

CREATE POLICY "Users can update their own installed modules" ON installed_modules
  FOR UPDATE USING (installed_by = auth.uid());

-- Policies for module_reviews
CREATE POLICY "Anyone can view module reviews" ON module_reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON module_reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can update their own reviews" ON module_reviews
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reviews" ON module_reviews
  FOR DELETE USING (user_id = auth.uid());

-- Policies for module_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON module_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own subscriptions" ON module_subscriptions
  FOR ALL USING (user_id = auth.uid());

-- Policies for installation logs
CREATE POLICY "Users can view logs for their modules" ON module_installation_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM installed_modules 
      WHERE module_id = module_installation_logs.module_id 
      AND installed_by = auth.uid()
    )
  );

-- ================================
-- GRANTS AND PERMISSIONS
-- ================================

-- Grant access to authenticated users
GRANT SELECT ON module_catalog TO authenticated;
GRANT SELECT ON module_providers TO authenticated;
GRANT ALL ON installed_modules TO authenticated;
GRANT ALL ON module_reviews TO authenticated;
GRANT ALL ON module_subscriptions TO authenticated;
GRANT SELECT ON module_installation_logs TO authenticated;
GRANT SELECT ON module_configurations TO authenticated;
GRANT SELECT ON module_permissions TO authenticated;