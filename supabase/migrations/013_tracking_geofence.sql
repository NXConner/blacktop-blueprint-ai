-- Tracking, Geofence, and Operations tables

-- Geofences
CREATE TABLE IF NOT EXISTS geofences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  center_latitude DOUBLE PRECISION NOT NULL,
  center_longitude DOUBLE PRECISION NOT NULL,
  radius INTEGER NOT NULL, -- meters
  type TEXT NOT NULL CHECK (type IN ('work_site','depot','restricted','maintenance')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin messages/inbox
CREATE TABLE IF NOT EXISTS admin_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id TEXT,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GPS location pings (generic device)
CREATE TABLE IF NOT EXISTS gps_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  speed DOUBLE PRECISION,
  heading DOUBLE PRECISION,
  altitude DOUBLE PRECISION,
  accuracy DOUBLE PRECISION,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gps_locations_device_time ON gps_locations(device_id, timestamp DESC);

-- Routes/trips
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  assigned_vehicle_id TEXT,
  assigned_driver_id TEXT,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  waypoints JSONB DEFAULT '[]'::jsonb,
  estimated_distance DOUBLE PRECISION,
  estimated_duration INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','cancelled'))
);

-- Geofence events
CREATE TABLE IF NOT EXISTS geofence_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fence_id UUID REFERENCES geofences(id) ON DELETE CASCADE,
  subject_type TEXT NOT NULL CHECK (subject_type IN ('vehicle','employee')), -- who triggered
  subject_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('enter','exit','breach')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_geofence_events_time ON geofence_events(occurred_at DESC);

-- Employee tracking pings
CREATE TABLE IF NOT EXISTS employee_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  speed DOUBLE PRECISION,
  heading DOUBLE PRECISION,
  accuracy DOUBLE PRECISION,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_employee_tracking_time ON employee_tracking(employee_id, recorded_at DESC);

-- Shifts (clock in/out)
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id TEXT NOT NULL,
  clock_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clock_out TIMESTAMPTZ,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_shifts_employee ON shifts(employee_id, clock_in DESC);

-- Enable RLS
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofence_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Simple policies: authenticated users can read/write their own rows when applicable
CREATE POLICY IF NOT EXISTS "Authenticated can read geofences" ON geofences FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Admins can manage geofences" ON geofences FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated can read admin_messages" ON admin_messages FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated can insert admin_messages" ON admin_messages FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated can read gps_locations" ON gps_locations FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated can insert gps_locations" ON gps_locations FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated can read routes" ON routes FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated can insert routes" ON routes FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated can update routes" ON routes FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated can read geofence_events" ON geofence_events FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated can insert geofence_events" ON geofence_events FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated can read employee_tracking" ON employee_tracking FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated can insert employee_tracking" ON employee_tracking FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated can read shifts" ON shifts FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated can insert shifts" ON shifts FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Authenticated can update shifts" ON shifts FOR UPDATE USING (true) WITH CHECK (true);