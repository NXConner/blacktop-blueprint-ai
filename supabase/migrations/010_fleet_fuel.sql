CREATE TABLE IF NOT EXISTS fleet_fuel_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID,
  date TIMESTAMPTZ DEFAULT NOW(),
  gallons NUMERIC NOT NULL,
  price_per_gallon NUMERIC NOT NULL,
  odometer INTEGER,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_fuel_vehicle ON fleet_fuel_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_date ON fleet_fuel_logs(date);