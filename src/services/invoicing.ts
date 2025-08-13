import { supabase } from '@/integrations/supabase/client';
import { asphaltEstimator, EstimateBreakdown, EstimateInputs } from '@/services/estimators/asphalt-estimator';
import { computeSalesTax } from '@/services/tax';

export interface InvoiceItem { description: string; amount: number; }
export interface InvoicePayload {
  id: string;
  clientName?: string;
  clientAddress?: string;
  projectName?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  total: number;
  createdAt: string;
  status?: 'unpaid' | 'partial' | 'paid';
  amountPaid?: number;
}

class InvoicingService {
  async createFromEstimate(inputs: EstimateInputs, client?: { name?: string; address?: string }, projectName?: string): Promise<InvoicePayload> {
    const breakdown: EstimateBreakdown = await asphaltEstimator.estimate(inputs);
    const items: InvoiceItem[] = [];
    items.push({ description: 'Materials', amount: breakdown.subtotal - breakdown.laborCost - breakdown.equipmentFuelCost - breakdown.travelFuelCost - breakdown.mobilizationFee });
    items.push({ description: 'Labor', amount: breakdown.laborCost });
    items.push({ description: 'Equipment & Fuel', amount: breakdown.equipmentFuelCost + breakdown.travelFuelCost });
    items.push({ description: 'Mobilization', amount: breakdown.mobilizationFee });
    items.push({ description: 'Overhead', amount: breakdown.overhead });
    items.push({ description: 'Profit', amount: breakdown.profit });

    const preTax = breakdown.subtotal + breakdown.overhead + breakdown.profit;
    const region = (inputs.travel.region === 'VA' || inputs.travel.region === 'NC') ? inputs.travel.region : 'VA';
    const shouldApplyTax = inputs.applySalesTax ?? true;
    const tax = shouldApplyTax ? await computeSalesTax(region, preTax) : 0;

    const payload: InvoicePayload = {
      id: crypto.randomUUID(),
      clientName: client?.name,
      clientAddress: client?.address,
      projectName,
      items,
      subtotal: preTax,
      tax: shouldApplyTax ? tax : undefined,
      total: preTax + tax,
      createdAt: new Date().toISOString(),
      status: 'unpaid',
      amountPaid: 0,
    };

    try {
      await supabase.from('invoices').insert({ id: payload.id, payload });
    } catch (_) {
      // ignore for now
    }

    return payload;
  }
}

export const invoicingService = new InvoicingService();