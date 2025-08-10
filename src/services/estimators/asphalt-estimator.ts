import { businessConfigService } from '@/services/business-config';
import { fuelPriceService, Region } from '@/services/fuel-price';
import { supabase } from '@/integrations/supabase/client';

export type Porosity = 'normal' | 'older';
export type ServiceType = 'driveway' | 'parking_lot';

export interface TravelInfo {
  jobAddress?: string;
  fromAddress?: string; // defaults to business address
  region: Region; // VA or NC for fuel pricing
  milesRoundTrip: number; // total miles business -> supplier -> business -> job -> business
  truckMpg?: number; // default 15-20 mpg trucks
}

export interface SealcoatInputs {
  areaSqFt: number;
  porosity: Porosity;
  oilSpotAreaSqFt?: number;
  includeFastDry?: boolean;
}

export interface CrackFillInputs {
  linearFeet: number;
  deepCracksFraction?: number; // 0-1 requiring sand pre-fill
  pricePerFoot?: number; // can override
}

export interface PatchingInputs {
  areaSqFt: number;
  thicknessInches: number; // 2in typical
  hotMix: boolean; // true hot mix; false cold patch
}

export interface StripingInputs {
  standardStalls?: number;
  doubleStalls?: number;
  handicapSpots?: number;
  arrows?: number;
  crosswalks?: number;
  pricePerLinearFoot?: number; // override
}

export interface EstimateInputs {
  serviceType: ServiceType;
  sealcoat?: SealcoatInputs;
  crackFill?: CrackFillInputs;
  patching?: PatchingInputs;
  striping?: StripingInputs; // parking lots only
  travel: TravelInfo;
  profitMarginPct?: number; // default 20
  overheadPct?: number; // default 10
}

export interface EstimateBreakdown {
  materials: Record<string, number>;
  laborHours: number;
  laborCost: number;
  equipmentFuelCost: number;
  travelFuelCost: number;
  mobilizationFee: number;
  subtotal: number;
  overhead: number;
  profit: number;
  total: number;
}

const sqFtPerGallonMixed = (porosity: Porosity) => (porosity === 'older' ? 70 : 82);

export class AsphaltEstimatorService {
  async estimate(inputs: EstimateInputs, persist: boolean = false): Promise<EstimateBreakdown> {
    const profile = await businessConfigService.getProfile();
    const blendedRate = profile.employees.blendedRatePerHour ?? 50;
    const laborCount = profile.employees.fullTime + profile.employees.partTime * 0.5;

    const materials: Record<string, number> = {};
    let laborHours = 0;
    let equipmentFuelCost = 0;
    let travelFuelCost = 0;
    let mobilizationFee = 200; // midpoint of typical range

    // Sealcoating
    if (inputs.sealcoat) {
      const { areaSqFt, porosity, oilSpotAreaSqFt = 0, includeFastDry = false } = inputs.sealcoat;
      const coverage = sqFtPerGallonMixed(porosity);
      const mixedGallons = areaSqFt / coverage;

      // Mix ratios: for 100 gal concentrate -> add 20% water + average 300 lbs sand (6 bags)
      const concentrateGallons = mixedGallons / 1.2; // remove 20% water
      const waterGallons = mixedGallons - concentrateGallons;
      const sandBags = (concentrateGallons / 100) * 6;

      materials.pmm_concentrate = Math.ceil(concentrateGallons);
      materials.sand_bag = Math.ceil(sandBags);
      materials.water_gallon = Math.ceil(waterGallons);

      if (oilSpotAreaSqFt && oilSpotAreaSqFt > 0) {
        const coveragePerBucket = 900; // 5-gal covers 750-1000 sq ft, average 900
        const buckets = Math.ceil(oilSpotAreaSqFt / coveragePerBucket);
        materials.prep_seal = buckets;
      }
      if (includeFastDry) {
        // 2 gallons per 125 gallons concentrate
        const fastDryGallons = (concentrateGallons / 125) * 2;
        materials.fast_dry = Math.ceil(fastDryGallons / 5); // store as buckets
      }

      // Labor heuristic: 1 hr per 1000 sq ft for 2-3 person crew baseline
      laborHours += areaSqFt / 1000;
      equipmentFuelCost += (areaSqFt / 1000) * 50; // $50/hour idle/operation guidance
    }

    // Crack filling
    if (inputs.crackFill) {
      const { linearFeet, deepCracksFraction = 0.2, pricePerFoot } = inputs.crackFill;
      // Material boxes: rule of thumb ~ 200-400 ft per 30lb box depending on width; assume 300 ft/box
      const boxes = Math.ceil(linearFeet / 300);
      materials.crack_filler_box = boxes;
      materials.propane_fill = Math.ceil(boxes / 4); // one tank per 4 boxes as heuristic

      // Labor: ~1 hr per 100 ft
      laborHours += linearFeet / 100;
      // Material sand for deep cracks
      const sandBagsForDeep = Math.ceil((linearFeet * deepCracksFraction) / 200);
      if (sandBagsForDeep > 0) materials.sand_bag = (materials.sand_bag || 0) + sandBagsForDeep;

      // If a per-foot price is specified, it can override to a revenue line (not used here)
    }

    // Patching
    if (inputs.patching) {
      const { areaSqFt, thicknessInches, hotMix } = inputs.patching;
      // Material volume in cubic feet
      const cubicFeet = areaSqFt * (thicknessInches / 12);
      // Convert to tons: asphalt ~ 145 lb/ft^3 -> 2000 lb per ton
      const tons = (cubicFeet * 145) / 2000;
      materials.asphalt_tons = Math.ceil(tons * 1.05); // 5% waste

      // Labor: 0.2 hr per sq yd at 2 in (heuristic)
      laborHours += (areaSqFt / 9) * 0.2;
      equipmentFuelCost += (areaSqFt / 500) * 50;

      // Cost ranges for pricing reference (not used directly): hot 2-5 $/sqft, cold 2-4 $/sqft
      if (!hotMix) {
        materials.cold_patch_bags = Math.ceil(areaSqFt / 8); // placeholder conversion
      }
    }

    // Striping (parking lots)
    if (inputs.serviceType === 'parking_lot' && inputs.striping) {
      const { standardStalls = 0, doubleStalls = 0, handicapSpots = 0, arrows = 0, crosswalks = 0 } = inputs.striping;
      const linearFeet = standardStalls * 20 + doubleStalls * 25 + arrows * 10 + crosswalks * 25;
      materials.paint_gallons = Math.ceil(linearFeet / 300); // ~300 lf/gal typical
      laborHours += (linearFeet / 200) * 0.5; // fast operation
      if (handicapSpots > 0) {
        materials.handicap_stencil_sets = handicapSpots;
        laborHours += handicapSpots * 0.2;
      }
    }

    // Travel fuel
    const mpg = inputs.travel.truckMpg ?? 17;
    const gallons = inputs.travel.milesRoundTrip / mpg;
    const fuel = await fuelPriceService.getPrice(inputs.travel.region, 'regular');
    travelFuelCost = gallons * fuel.pricePerGallon;

    // Convert materials quantities to cost using business profile pricing where available
    let materialsCost = 0;
    Object.entries(materials).forEach(([key, qty]) => {
      const price = profile.materialPrices[key as keyof typeof profile.materialPrices]?.price;
      if (price) materialsCost += qty * price;
    });

    const laborCost = laborHours * blendedRate * Math.max(1, laborCount);
    const subtotal = materialsCost + laborCost + equipmentFuelCost + travelFuelCost + mobilizationFee;
    const overhead = subtotal * ((inputs.overheadPct ?? 10) / 100);
    const profit = (subtotal + overhead) * ((inputs.profitMarginPct ?? 20) / 100);
    const total = subtotal + overhead + profit;

    const breakdown: EstimateBreakdown = {
      materials,
      laborHours,
      laborCost,
      equipmentFuelCost,
      travelFuelCost,
      mobilizationFee,
      subtotal,
      overhead,
      profit,
      total,
    };

    if (persist) {
      try {
        await supabase.from('estimates').insert({
          client_name: null,
          client_address: null,
          service_type: inputs.serviceType,
          inputs,
          breakdown,
        });
      } catch (_) {}
    }

    return breakdown;
  }
}

export const asphaltEstimator = new AsphaltEstimatorService();