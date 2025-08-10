import { supabase } from '@/integrations/supabase/client';

export interface FuelEntry { vehicle_id?: string; date?: string; gallons: number; price_per_gallon: number; odometer?: number; notes?: string }

export async function addFuelEntry(entry: FuelEntry): Promise<void> {
  await supabase.from('fleet_fuel_logs').insert(entry);
}

export async function getFuelSummary(vehicleId?: string): Promise<{ totalGallons: number; totalCost: number; avgPrice: number }> {
  const query = supabase.from('fleet_fuel_logs').select('*');
  const { data } = vehicleId ? await query.eq('vehicle_id', vehicleId) : await query;
  const rows = (data as any[]) || [];
  const totalGallons = rows.reduce((s, r) => s + Number(r.gallons || 0), 0);
  const totalCost = rows.reduce((s, r) => s + Number(r.gallons || 0) * Number(r.price_per_gallon || 0), 0);
  return { totalGallons, totalCost, avgPrice: totalGallons ? totalCost / totalGallons : 0 };
}