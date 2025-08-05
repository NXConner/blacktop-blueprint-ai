-- Blacktop Blackout Core Database Schema
-- This migration creates the foundational tables for the asphalt management system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Companies/Organizations table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    license_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles/Fleet Management
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(100) NOT NULL, -- 'truck', 'roller', 'paver', 'support'
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    license_plate VARCHAR(20),
    vin VARCHAR(50),
    fuel_capacity DECIMAL(10,2),
    current_fuel_level DECIMAL(5,2) DEFAULT 100.00,
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'in_use', 'maintenance', 'out_of_service'
    gps_device_id VARCHAR(100),
    last_maintenance_date DATE,
    next_maintenance_due DATE,
    odometer_reading INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crew/Employee Management
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    position VARCHAR(100), -- 'operator', 'supervisor', 'driver', 'laborer'
    certification_level VARCHAR(50), -- 'junior', 'senior', 'master', 'supervisor'
    hire_date DATE,
    hourly_rate DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'on_leave'
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crews (groups of employees)
CREATE TABLE IF NOT EXISTS crews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    crew_name VARCHAR(100) NOT NULL,
    supervisor_id UUID REFERENCES employees(id),
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'deployed', 'off_duty'
    specialization VARCHAR(100), -- 'resurfacing', 'patching', 'sealcoating', 'marking'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crew Members (many-to-many relationship between crews and employees)
CREATE TABLE IF NOT EXISTS crew_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crew_id UUID REFERENCES crews(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    role VARCHAR(100), -- 'supervisor', 'operator', 'laborer'
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(crew_id, employee_id)
);

-- Projects/Jobs
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    project_number VARCHAR(50) UNIQUE NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    client_contact VARCHAR(255),
    location_address TEXT,
    location_coordinates GEOGRAPHY(POINT, 4326),
    project_type VARCHAR(100), -- 'resurfacing', 'new_construction', 'maintenance', 'patching'
    estimated_cost DECIMAL(15,2),
    actual_cost DECIMAL(15,2),
    start_date DATE,
    estimated_completion_date DATE,
    actual_completion_date DATE,
    status VARCHAR(50) DEFAULT 'planned', -- 'planned', 'active', 'paused', 'completed', 'cancelled'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    weather_dependent BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Management
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_type VARCHAR(100) NOT NULL, -- 'asphalt', 'aggregate', 'cement', 'sealant'
    material_grade VARCHAR(50),
    supplier VARCHAR(255),
    unit_cost DECIMAL(10,2),
    unit_of_measure VARCHAR(20), -- 'ton', 'yard', 'gallon', 'bag'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Usage/Inventory
CREATE TABLE IF NOT EXISTS material_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id),
    quantity_used DECIMAL(10,2) NOT NULL,
    cost_per_unit DECIMAL(10,2),
    total_cost DECIMAL(15,2),
    usage_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Work Sessions (actual work periods)
CREATE TABLE IF NOT EXISTS work_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    crew_id UUID REFERENCES crews(id),
    session_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    work_area_coordinates GEOGRAPHY(POLYGON, 4326),
    work_type VARCHAR(100), -- 'preparation', 'laying', 'compaction', 'finishing'
    temperature_start INTEGER, -- in Fahrenheit
    temperature_end INTEGER,
    weather_conditions VARCHAR(100),
    productivity_score DECIMAL(5,2), -- 0-100 score
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GPS Tracking Data
CREATE TABLE IF NOT EXISTS gps_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    location_coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
    speed DECIMAL(5,2), -- mph
    heading INTEGER, -- degrees 0-360
    altitude DECIMAL(8,2), -- feet
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    accuracy DECIMAL(5,2), -- meters
    INDEX USING GIST (location_coordinates),
    INDEX ON (vehicle_id, timestamp DESC)
);

-- Weather Data
CREATE TABLE IF NOT EXISTS weather_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
    temperature INTEGER, -- Fahrenheit
    humidity INTEGER, -- percentage
    wind_speed DECIMAL(5,2), -- mph
    wind_direction INTEGER, -- degrees
    precipitation DECIMAL(5,2), -- inches
    precipitation_probability INTEGER, -- percentage
    weather_condition VARCHAR(100), -- 'clear', 'cloudy', 'rain', 'snow'
    forecast_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    data_source VARCHAR(50), -- 'weather_api', 'local_sensor'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX USING GIST (location_coordinates),
    INDEX ON (forecast_timestamp DESC)
);

-- PavementScan Pro - Surface Analysis
CREATE TABLE IF NOT EXISTS pavement_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    scan_location GEOGRAPHY(POINT, 4326) NOT NULL,
    scan_area GEOGRAPHY(POLYGON, 4326),
    scan_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scan_type VARCHAR(50), -- 'pre_work', 'progress', 'post_work', 'maintenance'
    surface_condition_score DECIMAL(5,2), -- 0-100 score
    crack_density DECIMAL(8,4), -- linear feet per square foot
    pothole_count INTEGER DEFAULT 0,
    roughness_index DECIMAL(8,4), -- IRI (International Roughness Index)
    rutting_depth DECIMAL(6,3), -- inches
    image_urls TEXT[], -- array of image URLs
    analysis_data JSONB, -- detailed scan analysis data
    ai_confidence_score DECIMAL(5,2), -- 0-100 AI confidence
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX USING GIST (scan_location),
    INDEX ON (project_id, scan_timestamp DESC)
);

-- Atlas Integration - Point Cloud Data
CREATE TABLE IF NOT EXISTS atlas_point_clouds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    scan_location GEOGRAPHY(POINT, 4326) NOT NULL,
    point_cloud_file_url TEXT NOT NULL,
    mesh_file_url TEXT,
    elevation_data JSONB, -- elevation points and measurements
    terrain_analysis JSONB, -- slope, grade, volume calculations
    capture_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processing_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX USING GIST (scan_location)
);

-- Cost Tracking
CREATE TABLE IF NOT EXISTS cost_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- 'labor', 'materials', 'equipment', 'fuel', 'overhead'
    subcategory VARCHAR(100),
    description TEXT,
    amount DECIMAL(15,2) NOT NULL,
    entry_date DATE DEFAULT CURRENT_DATE,
    invoice_number VARCHAR(100),
    vendor VARCHAR(255),
    approved_by UUID REFERENCES employees(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment Maintenance
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(100), -- 'routine', 'repair', 'inspection', 'emergency'
    description TEXT NOT NULL,
    cost DECIMAL(10,2),
    performed_by VARCHAR(255),
    performed_date DATE DEFAULT CURRENT_DATE,
    next_service_due DATE,
    parts_replaced TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts and Notifications
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type VARCHAR(100) NOT NULL, -- 'weather', 'maintenance', 'cost_overrun', 'safety', 'equipment'
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50), -- 'project', 'vehicle', 'crew', 'weather'
    related_entity_id UUID,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES employees(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    INDEX ON (alert_type, severity, created_at DESC)
);

-- Real-time System Status
CREATE TABLE IF NOT EXISTS system_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component VARCHAR(100) NOT NULL, -- 'overwatch', 'pavement_scan', 'atlas_hub', 'weather'
    status VARCHAR(50) NOT NULL, -- 'online', 'offline', 'degraded', 'maintenance'
    last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT,
    performance_metrics JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Activity Audit
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX ON (user_id, created_at DESC)
);

-- Row Level Security Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_entries ENABLE ROW LEVEL SECURITY;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crews_updated_at BEFORE UPDATE ON crews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cost_entries_updated_at BEFORE UPDATE ON cost_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create some initial seed data
INSERT INTO companies (name, address, phone, email) VALUES 
('Blacktop Solutions Inc.', '123 Asphalt Ave, Construction City, CC 12345', '555-0100', 'info@blacktopsolutions.com');

-- Create views for common queries
CREATE OR REPLACE VIEW active_projects AS
SELECT 
    p.*,
    c.name as company_name,
    COALESCE(SUM(ce.amount), 0) as total_spent
FROM projects p
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN cost_entries ce ON p.id = ce.project_id
WHERE p.status IN ('planned', 'active')
GROUP BY p.id, c.name;

CREATE OR REPLACE VIEW fleet_status AS
SELECT 
    v.*,
    c.name as company_name,
    CASE 
        WHEN v.next_maintenance_due <= CURRENT_DATE THEN 'overdue'
        WHEN v.next_maintenance_due <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
        ELSE 'current'
    END as maintenance_status
FROM vehicles v
LEFT JOIN companies c ON v.company_id = c.id;

CREATE OR REPLACE VIEW crew_availability AS
SELECT 
    cr.*,
    c.name as company_name,
    COUNT(cm.employee_id) as crew_size
FROM crews cr
LEFT JOIN companies c ON cr.company_id = c.id
LEFT JOIN crew_members cm ON cr.id = cm.crew_id
GROUP BY cr.id, c.name;