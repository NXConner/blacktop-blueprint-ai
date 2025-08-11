CREATE TABLE IF NOT EXISTS vehicle_inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  inspection_date TIMESTAMPTZ DEFAULT NOW(),
  inspector_name VARCHAR(255),
  checklist JSONB NOT NULL, -- structured checklist results
  notes TEXT,
  attachment_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_vehicle ON vehicle_inspections(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_date ON vehicle_inspections(inspection_date);