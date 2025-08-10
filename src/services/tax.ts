import { knowledgeBase } from '@/services/knowledge-base';

const DEFAULT_TAX: Record<string, number> = {
  VA: 0.053, // 5.3%
  NC: 0.0475, // 4.75%
};

export async function getSalesTaxRate(region: 'VA' | 'NC'): Promise<number> {
  const kb = await knowledgeBase.get<number>('taxes', `sales_${region}`);
  return typeof kb?.value === 'number' ? kb.value : (DEFAULT_TAX[region] ?? 0);
}

export async function computeSalesTax(region: 'VA' | 'NC', taxableAmount: number): Promise<number> {
  const rate = await getSalesTaxRate(region);
  return +(taxableAmount * rate).toFixed(2);
}