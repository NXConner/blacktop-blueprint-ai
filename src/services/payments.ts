import { supabase } from '@/integrations/supabase/client';

export async function recordPayment(invoiceId: string, amount: number, method?: string): Promise<void> {
  await supabase.from('payments').insert({ invoice_id: invoiceId, amount, method });
  const { data } = await supabase.from('invoices').select('payload').eq('id', invoiceId).maybeSingle();
  if (!data) return;
  const payload = data.payload || {};
  const newPaid = (payload.amountPaid || 0) + amount;
  const status = newPaid >= (payload.total || 0) ? 'paid' : 'partial';
  payload.amountPaid = newPaid;
  payload.status = status;
  await supabase.from('invoices').update({ payload }).eq('id', invoiceId);
}

export async function getARAging(): Promise<{ current: number; thirty: number; sixty: number; ninety: number }> {
  const { data } = await supabase.from('invoices').select('*');
  const now = Date.now();
  const buckets = { current: 0, thirty: 0, sixty: 0, ninety: 0 };
  (data || []).forEach((row: any) => {
    const total = row.payload?.total || 0;
    const paid = row.payload?.amountPaid || 0;
    const due = total - paid;
    if (due <= 0) return;
    const ageDays = Math.floor((now - new Date(row.created_at).getTime()) / (1000 * 60 * 60 * 24));
    if (ageDays <= 30) buckets.current += due;
    else if (ageDays <= 60) buckets.thirty += due;
    else if (ageDays <= 90) buckets.sixty += due;
    else buckets.ninety += due;
  });
  return buckets;
}