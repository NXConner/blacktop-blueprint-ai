import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Download } from 'lucide-react';
import { getARAging, recordPayment, updateInvoiceLifecycle, type PaymentMethod } from '@/services/payments';
import { useToast } from '@/components/ui/use-toast';

interface InvoiceRow { id: string; payload: any; created_at: string; lifecycle_status?: string }

const Invoices: React.FC = () => {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [selected, setSelected] = useState<InvoiceRow | null>(null);
  const [aging, setAging] = useState<{ current: number; thirty: number; sixty: number; ninety: number }>({ current: 0, thirty: 0, sixty: 0, ninety: 0 });
  const { toast } = useToast();

  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [payRef, setPayRef] = useState<string>('');
  const [history, setHistory] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
      setRows((data as any[]) || []);
      setAging(await getARAging());
    })();
  }, []);

  const refreshSelected = async (id: string) => {
    const { data } = await supabase.from('invoices').select('*').eq('id', id).maybeSingle();
    setSelected(data as any);
    setAging(await getARAging());
    const { data: hist } = await supabase.from('invoice_status_history').select('*').eq('invoice_id', id).order('created_at', { ascending: false });
    setHistory(hist || []);
    const { data: pays } = await supabase.from('payments').select('id, amount, method, received_at, payment_receipts(*)').eq('invoice_id', id).order('received_at', { ascending: false });
    setReceipts((pays || []).flatMap((p: any) => p.payment_receipts?.map((r: any) => ({ ...r, amount: p.amount, method: p.method })) || []));
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-4">Invoices</h1>
      <Card className="glass-card p-3 mb-4">
        <div className="grid grid-cols-4 text-center text-sm">
          <div>Current: ${aging.current.toFixed(2)}</div>
          <div>30: ${aging.thirty.toFixed(2)}</div>
          <div>60: ${aging.sixty.toFixed(2)}</div>
          <div>90+: ${aging.ninety.toFixed(2)}</div>
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card p-4">
          <div className="space-y-2">
            {rows.map(r => (
              <div key={r.id} className={`p-2 rounded border cursor-pointer ${selected?.id===r.id?'border-primary':'border-glass-border'}`} onClick={() => { setSelected(r); void refreshSelected(r.id); }}>
                <div className="text-sm font-medium">{r.payload?.clientName || 'Client'}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                <div className="text-xs">Total: ${r.payload?.total?.toFixed?.(2)}</div>
                <div className="text-xs">Status: {r.lifecycle_status || 'draft'}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="glass-card p-6 lg:col-span-2">
          {!selected ? (
            <div className="text-muted-foreground">Select an invoice</div>
          ) : (
            <div>
              <div className="flex flex-wrap gap-2 justify-between items-center mb-6">
                <div>
                  <div className="text-2xl font-bold">Invoice</div>
                  <div className="text-sm text-muted-foreground">ID: {selected.id}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => window.print()}><Download className="w-4 h-4 mr-2" />Print/PDF</Button>
                  <Button variant="outline" onClick={async () => {
                    await updateInvoiceLifecycle(selected.id, 'sent');
                    await refreshSelected(selected.id);
                    toast({ title: 'Invoice sent', description: 'Email delivery record created' });
                  }}>Send</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-2">
                <div>
                  <div className="font-medium">Bill To</div>
                  <div>{selected.payload?.clientName || 'Client Name'}</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-line">{selected.payload?.clientAddress || ''}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">Total</div>
                  <div className="text-3xl font-bold">${selected.payload?.total?.toFixed?.(2)}</div>
                  <div className="text-sm">Paid: ${selected.payload?.amountPaid?.toFixed?.(2) || '0.00'}</div>
                  <div className="text-sm">Lifecycle: {selected.lifecycle_status || 'draft'}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 items-center mb-4">
                <input className="border rounded px-2 py-1 text-sm" placeholder="Payment amount" id="payamt" />
                <select className="border rounded px-2 py-1 text-sm" value={payMethod} onChange={e => setPayMethod(e.target.value as PaymentMethod)}>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="ach">ACH</option>
                  <option value="card">Card</option>
                </select>
                <input className="border rounded px-2 py-1 text-sm" placeholder="Reference (optional)" value={payRef} onChange={e => setPayRef(e.target.value)} />
                <Button variant="outline" onClick={async () => {
                  const amt = parseFloat((document.getElementById('payamt') as HTMLInputElement).value || '0');
                  if (!amt || amt <= 0) { toast({ title: 'Invalid amount', variant: 'destructive' }); return; }
                  const receipt = await recordPayment(selected.id, amt, payMethod, payRef);
                  await refreshSelected(selected.id);
                  toast({ title: 'Payment recorded', description: receipt ? `Receipt ${receipt}` : undefined });
                }}>Record Payment</Button>
                {selected.payload?.status !== 'paid' && (
                  <Button variant="outline" onClick={async () => {
                    const due = Math.max(0, (selected.payload?.total || 0) - (selected.payload?.amountPaid || 0));
                    const receipt = await recordPayment(selected.id, due, payMethod, 'mark paid');
                    await refreshSelected(selected.id);
                    toast({ title: 'Invoice marked paid', description: receipt ? `Receipt ${receipt}` : undefined });
                  }}>Mark Paid</Button>
                )}
                <Button variant="outline" onClick={async () => { await updateInvoiceLifecycle(selected.id, 'viewed'); await refreshSelected(selected.id); }}>Viewed</Button>
                <Button variant="outline" onClick={async () => { await updateInvoiceLifecycle(selected.id, 'approved'); await refreshSelected(selected.id); }}>Approve</Button>
                <Button variant="outline" onClick={async () => { await updateInvoiceLifecycle(selected.id, 'archived'); await refreshSelected(selected.id); }}>Archive</Button>
              </div>
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="text-left border-b border-glass-border">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.payload?.items?.map((it: any, idx: number) => (
                    <tr key={idx} className="border-b border-glass-border">
                      <td className="py-2">{it.description}</td>
                      <td className="py-2 text-right">${it.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="py-2 font-medium">Subtotal</td>
                    <td className="py-2 text-right">${selected.payload?.subtotal?.toFixed?.(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Tax</td>
                    <td className="py-2 text-right">${selected.payload?.tax?.toFixed?.(2) || '0.00'}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-lg">Total</td>
                    <td className="py-2 text-right font-bold text-lg">${selected.payload?.total?.toFixed?.(2)}</td>
                  </tr>
                </tfoot>
              </table>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="glass-card p-3">
                  <div className="font-medium mb-2">Status History</div>
                  <div className="space-y-1 text-xs">
                    {history.map(h => (
                      <div key={h.id} className="flex justify-between"><span>{h.status}</span><span>{new Date(h.created_at).toLocaleString()}</span></div>
                    ))}
                  </div>
                </Card>
                <Card className="glass-card p-3">
                  <div className="font-medium mb-2">Receipts</div>
                  <div className="space-y-1 text-xs">
                    {receipts.map(r => (
                      <div key={r.id} className="flex justify-between"><span>{r.receipt_number}</span><span>${Number(r.amount).toFixed(2)} {r.method}</span></div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Invoices;