export interface GeoPoint { lat: number; lon: number; }

export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en-US' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export async function autocompleteAddress(query: string): Promise<Array<{ label: string; lat: number; lon: number }>> {
  if (!query || query.trim().length < 3) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en-US' } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((d: any) => ({ label: d.display_name as string, lat: parseFloat(d.lat), lon: parseFloat(d.lon) }));
  } catch {
    return [];
  }
}

export function haversineMiles(a: GeoPoint, b: GeoPoint): number {
  const R = 3958.8; // miles
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type Region = 'VA' | 'NC' | 'OTHER';

export function detectRegionFromAddress(address: string): Region {
  if (/\bVA\b|Virginia/i.test(address)) return 'VA';
  if (/\bNC\b|North Carolina/i.test(address)) return 'NC';
  return 'OTHER';
}