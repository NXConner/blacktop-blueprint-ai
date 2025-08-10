import { businessConfigService } from '@/services/business-config';
import { supabase } from '@/integrations/supabase/client';

export async function updateMaterialPrice(key: string, price: number): Promise<void> {
  const profile = await businessConfigService.getProfile();
  if (!profile.materialPrices[key]) return;
  profile.materialPrices[key].price = price;
  await businessConfigService.setProfile({ materialPrices: profile.materialPrices });
  await supabase.from('material_price_history').insert({ key, name: profile.materialPrices[key].name, unit: profile.materialPrices[key].unit, price });
}