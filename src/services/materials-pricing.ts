import { businessConfigService } from '@/services/business-config';
import { supabase } from '@/integrations/supabase/client';

export async function updateMaterialPrice(key: string, price: number): Promise<void> {
  const profile = await businessConfigService.getProfile();
  if (!profile.materialPrices[key]) return;
  profile.materialPrices[key].price = price;
  await businessConfigService.setProfile({ materialPrices: profile.materialPrices });
  await supabase.from('material_price_history').insert({ key, name: profile.materialPrices[key].name, unit: profile.materialPrices[key].unit, price });
}

export interface ReceiptRow {
  key: string;
  price: number;
  name?: string;
  unit?: string;
}

export async function importReceiptCSV(csvText: string): Promise<{ updated: number; skipped: number; errors: string[] }> {
  const lines = csvText.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { updated: 0, skipped: 0, errors: ["Empty CSV"] };

  // Try to detect header
  const [headerLine, ...dataLines] = lines;
  const header = headerLine.toLowerCase();
  const hasHeader = header.includes('key') || header.includes('material') || header.includes('price');
  const rows = (hasHeader ? dataLines : lines).map((line) => line.split(',').map((s) => s.trim())) as string[][];

  const profile = await businessConfigService.getProfile();
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const cols of rows) {
    if (cols.length < 2) { skipped++; errors.push(`Invalid row: ${cols.join(',')}`); continue; }
    const key = cols[0];
    const price = Number(cols[1]);
    if (!key || Number.isNaN(price) || price <= 0) { skipped++; errors.push(`Invalid key/price: ${cols.join(',')}`); continue; }

    if (!profile.materialPrices[key]) {
      skipped++;
      errors.push(`Unknown material key '${key}'`);
      continue;
    }

    try {
      await updateMaterialPrice(key, price);
      updated++;
    } catch (e) {
      skipped++;
      errors.push(`Failed to update '${key}': ${(e as Error).message}`);
    }
  }

  return { updated, skipped, errors };
}