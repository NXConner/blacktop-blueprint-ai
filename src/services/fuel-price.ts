import { offlineService } from '@/services/offline';

export type Region = 'VA' | 'NC';
export type FuelKind = 'regular' | 'midgrade' | 'premium' | 'diesel';

export interface FuelPrice {
  region: Region;
  kind: FuelKind;
  pricePerGallon: number;
  currency: 'USD';
  fetchedAt: string;
  source: string;
}

const EIA_API = 'https://api.eia.gov/series/?api_key=DEMO_KEY&series_id=';
const SERIES: Record<Region, Record<FuelKind, string>> = {
  VA: {
    regular: 'PET.EMM_EPMRR_PTE_VA_DPG.W',
    midgrade: 'PET.EMM_EPMRM_PTE_VA_DPG.W',
    premium: 'PET.EMM_EPMRP_PTE_VA_DPG.W',
    diesel: 'PET.EMD_EPD2D_PTE_VA_DPG.W'
  },
  NC: {
    regular: 'PET.EMM_EPMRR_PTE_NC_DPG.W',
    midgrade: 'PET.EMM_EPMRM_PTE_NC_DPG.W',
    premium: 'PET.EMM_EPMRP_PTE_NC_DPG.W',
    diesel: 'PET.EMD_EPD2D_PTE_NC_DPG.W'
  }
};

async function fetchEiaPrice(seriesId: string): Promise<number | null> {
  try {
    const res = await fetch(`${EIA_API}${seriesId}`);
    if (!res.ok) return null;
    const json = await res.json();
    const points = json?.series?.[0]?.data;
    if (!Array.isArray(points) || points.length === 0) return null;
    const latest = points[0][1];
    return typeof latest === 'number' ? latest : null;
  } catch {
    return null;
  }
}

class FuelPriceService {
  private cacheKey(region: Region, kind: FuelKind) {
    return `fuel.${region}.${kind}`;
  }

  async getPrice(region: Region, kind: FuelKind): Promise<FuelPrice> {
    const cached = await offlineService.getCachedData(this.cacheKey(region, kind));
    if (cached) return cached as FuelPrice;

    const seriesId = SERIES[region][kind];
    const price = await fetchEiaPrice(seriesId);
    const result: FuelPrice = {
      region,
      kind,
      pricePerGallon: price ?? 3.14, // fallback
      currency: 'USD',
      fetchedAt: new Date().toISOString(),
      source: 'EIA'
    };

    await offlineService.cacheData(this.cacheKey(region, kind), result, 240); // 4h
    return result;
  }
}

export const fuelPriceService = new FuelPriceService();