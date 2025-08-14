-- Latest locations RPCs

-- Latest vehicle locations from gps_tracking
CREATE OR REPLACE FUNCTION public.get_latest_vehicle_locations()
RETURNS TABLE (
  vehicle_id uuid,
  location_coordinates geography(Point, 4326),
  speed numeric,
  heading integer,
  altitude numeric,
  timestamp timestamptz,
  accuracy numeric
) AS $$
  SELECT DISTINCT ON (gt.vehicle_id)
    gt.vehicle_id,
    gt.location_coordinates,
    gt.speed,
    gt.heading,
    gt.altitude,
    gt.timestamp,
    gt.accuracy
  FROM public.gps_tracking gt
  ORDER BY gt.vehicle_id, gt.timestamp DESC;
$$ LANGUAGE sql STABLE;

-- Latest employee positions from employee_tracking
CREATE OR REPLACE FUNCTION public.get_latest_employee_positions()
RETURNS TABLE (
  employee_id text,
  latitude double precision,
  longitude double precision,
  speed double precision,
  heading double precision,
  recorded_at timestamptz
) AS $$
  SELECT DISTINCT ON (et.employee_id)
    et.employee_id,
    et.latitude,
    et.longitude,
    COALESCE(et.speed, 0),
    COALESCE(et.heading, 0),
    et.recorded_at
  FROM public.employee_tracking et
  ORDER BY et.employee_id, et.recorded_at DESC;
$$ LANGUAGE sql STABLE;