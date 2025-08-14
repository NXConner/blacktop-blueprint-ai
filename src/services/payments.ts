import { supabase } from '@/integrations/supabase/client';

export type PaymentMethod = 'cash' | 'check' | 'ach' | 'card';

export async function recordPayment(invoiceId: string, amount: number, method: PaymentMethod = 'cash', reference?: string): Promise<string | null> {
  const { data: pay, error } = await supabase.from('payments').insert({ invoice_id: invoiceId, amount, method }).select().single();
  if (error) throw error;
  // Update invoice amounts
  const { data: inv } = await supabase.from('invoices').select('*').eq('id', invoiceId).maybeSingle();
  if (!inv) return null;
  const payload = inv.payload || {};
  const newPaid = (payload.amountPaid || 0) + amount;
  const status = newPaid >= (payload.total || 0) ? 'paid' : 'partial';
  payload.amountPaid = newPaid;
  payload.status = status;
  const update: any = { payload };
  if (status === 'paid') update.paid_at = new Date().toISOString();
  await supabase.from('invoices').update(update).eq('id', invoiceId);
  // Add lifecycle entry
  await supabase.from('invoice_status_history').insert({ invoice_id: invoiceId, status: status === 'paid' ? 'paid' : 'partial', note: reference });
  // Create receipt record
  const receiptNumber = `RCPT-${Date.now().toString().slice(-6)}`;
  await supabase.from('payment_receipts').insert({ payment_id: pay.id, receipt_number: receiptNumber, payload: { method, reference, amount } });
  return receiptNumber;
}

export async function updateInvoiceLifecycle(invoiceId: string, next: 'sent'|'viewed'|'approved'|'archived'): Promise<void> {
  const patch: any = { lifecycle_status: next };
  if (next === 'sent') patch.sent_at = new Date().toISOString();
  if (next === 'viewed') patch.viewed_at = new Date().toISOString();
  if (next === 'approved') patch.approved_at = new Date().toISOString();
  if (next === 'archived') patch.archived_at = new Date().toISOString();
  await supabase.from('invoices').update(patch).eq('id', invoiceId);
  await supabase.from('invoice_status_history').insert({ invoice_id: invoiceId, status: next });
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