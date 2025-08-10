import { supabase } from '@/integrations/supabase/client';
import { offlineService } from '@/services/offline';

export type FuelType = 'gasoline' | 'diesel';

export interface MaterialPrice {
  name: string;
  unit: 'gallon' | 'bag' | 'box' | 'bucket';
  price: number;
  notes?: string;
}

export interface BusinessProfile {
  businessName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  employees: { fullTime: number; partTime: number; blendedRatePerHour?: number };
  supplier: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  vehicles: Array<{ make: string; model: string; year: number; description?: string }>;
  trailers: Array<{ lengthFeet: number; description?: string }>;
  equipment: Array<{ name: string; description?: string }>;
  materialPrices: Record<string, MaterialPrice>;
  estimatorDefaults?: { overheadPct: number; profitPct: number };
}

export const defaultBusinessProfile: BusinessProfile = {
  businessName: 'Blacktop Blackout',
  address: '337 Ayers Orchard Road',
  city: 'Stuart',
  state: 'VA',
  zip: '24171',
  employees: { fullTime: 2, partTime: 1, blendedRatePerHour: 50 },
  supplier: {
    name: 'SealMaster',
    address: '703 West Decatur Street',
    city: 'Madison',
    state: 'NC',
    zip: '27025',
  },
  vehicles: [
    { make: 'Chevrolet', model: 'C30 Custom Deluxe 350', year: 1978, description: '3-speed manual with granny low' },
    { make: 'Dodge', model: 'Dakota V6 Magnum', year: 1995, description: 'Automatic, utility trailer tow' }
  ],
  trailers: [
    { lengthFeet: 8, description: 'Black utility trailer' },
    { lengthFeet: 10, description: 'Black utility trailer' },
    { lengthFeet: 8, description: 'White trailer' },
    { lengthFeet: 10, description: 'Tilt back trailer' },
    { lengthFeet: 12, description: 'Heavy duty black trailer' }
  ],
  equipment: [
    { name: 'SealMaster SK 550 Tank Sealing Machine', description: 'Skid Unit, 550 gal' },
    { name: 'Hot pour crack machines', description: '4 units' },
    { name: 'Push behind blowers', description: '2 units' },
    { name: 'Little Wonder crack cleaner' }
  ],
  materialPrices: {
    pmm_concentrate: { name: 'SealMaster PMM concentrate', unit: 'gallon', price: 3.65 },
    sand_bag: { name: 'Sand (50 lb bag)', unit: 'bag', price: 10 },
    prep_seal: { name: 'Prep Seal (5-gal)', unit: 'bucket', price: 50 },
    fast_dry: { name: 'Fast Dry (5-gal)', unit: 'bucket', price: 50 },
    crack_filler_box: { name: 'CrackMaster Parking Lot LP (30 lb)', unit: 'box', price: 44.99 }
  },
  estimatorDefaults: { overheadPct: 10, profitPct: 20 }
};

class BusinessConfigService {
  private cache: BusinessProfile | null = null;

  async getProfile(): Promise<BusinessProfile> {
    if (this.cache) return this.cache;

    // Try Supabase if table exists
    try {
      const { data, error } = await supabase
        .from('business_profile')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        this.cache = { ...defaultBusinessProfile, ...(data.profile as BusinessProfile) };
        return this.cache;
      }
    } catch (_) {
      // ignore
    }

    // Try offline preference
    const stored = await offlineService.getPreference<BusinessProfile>('business.profile');
    if (stored) {
      this.cache = { ...defaultBusinessProfile, ...stored };
      return this.cache;
    }

    this.cache = defaultBusinessProfile;
    return this.cache;
  }

  async setProfile(profile: Partial<BusinessProfile>): Promise<BusinessProfile> {
    const merged: BusinessProfile = { ...(await this.getProfile()), ...profile } as BusinessProfile;

    // Persist offline
    await offlineService.setPreference('business.profile', merged);

    // Best-effort persist to Supabase
    try {
      await supabase.from('business_profile').upsert({ id: 'singleton', profile: merged });
    } catch (_) {
      // ignore failures
    }

    this.cache = merged;
    return merged;
  }
}

export const businessConfigService = new BusinessConfigService();