export interface VehicleSpec {
  name: string;
  curbWeightLbs: number;
  gvwrLbs: number;
}

export interface LoadSpec {
  description: string;
  weightLbs: number;
}

export const C30_1978: VehicleSpec = { name: '1978 Chevy C30', curbWeightLbs: 4300, gvwrLbs: 12000 };
export const SK550_EMPTY_LBS = 1865;
export const SEALER_LBS_PER_GAL = 10;

export function computeSk550Load(fullGallons: number): LoadSpec {
  const sealer = fullGallons * SEALER_LBS_PER_GAL;
  return { description: `SK550 + ${fullGallons} gal`, weightLbs: SK550_EMPTY_LBS + sealer };
}

export function checkVehicleLoad(vehicle: VehicleSpec, loads: LoadSpec[], passengersLbs: number = 400): { total: number; within: boolean; pct: number } {
  const totalLoad = loads.reduce((s, l) => s + l.weightLbs, 0) + passengersLbs + vehicle.curbWeightLbs;
  const pct = totalLoad / vehicle.gvwrLbs;
  return { total: totalLoad, within: totalLoad <= vehicle.gvwrLbs, pct };
}