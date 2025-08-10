import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Download } from 'lucide-react';
import { getARAging } from '@/services/payments';

interface InvoiceRow { id: string; payload: any; created_at: string }

const Invoices: React.FC = () => {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [selected, setSelected] = useState<InvoiceRow | null>(null);
  const [aging, setAging] = useState<{ current: number; thirty: number; sixty: number; ninety: number }>({ current: 0, thirty: 0, sixty: 0, ninety: 0 });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
      setRows((data as any[]) || []);
      setAging(await getARAging());
    })();
  }, []);

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
              <div key={r.id} className={`p-2 rounded border cursor-pointer ${selected?.id===r.id?'border-primary':'border-glass-border'}`} onClick={() => setSelected(r)}>
                <div className="text-sm font-medium">{r.payload?.clientName || 'Client'}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                <div className="text-xs">Total: ${r.payload?.total?.toFixed?.(2)}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="glass-card p-6 lg:col-span-2">
          {!selected ? (
            <div className="text-muted-foreground">Select an invoice</div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="text-2xl font-bold">Invoice</div>
                  <div className="text-sm text-muted-foreground">ID: {selected.id}</div>
                </div>
                <Button variant="outline" onClick={() => window.print()}><Download className="w-4 h-4 mr-2" />Print/PDF</Button>
                <Button variant="outline" onClick={() => alert('Email sent (stub).')}>Email</Button>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="font-medium">Bill To</div>
                  <div>{selected.payload?.clientName || 'Client Name'}</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-line">{selected.payload?.clientAddress || ''}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">Total</div>
                  <div className="text-3xl font-bold">${selected.payload?.total?.toFixed?.(2)}</div>
                  <div className="text-sm">Paid: ${selected.payload?.amountPaid?.toFixed?.(2) || '0.00'}</div>
                  <div className="text-sm">Status: {selected.payload?.status || 'unpaid'}</div>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <input className="border rounded px-2 py-1 text-sm" placeholder="Payment amount" id="payamt" />
                <Button variant="outline" onClick={async () => {
                  const amt = parseFloat((document.getElementById('payamt') as HTMLInputElement).value || '0');
                  if (!amt || amt <= 0) return;
                  const mod = await import('@/services/payments');
                  await mod.recordPayment(selected.id, amt);
                  const { data } = await supabase.from('invoices').select('*').eq('id', selected.id).maybeSingle();
                  setSelected(data as any);
                }}>Record Payment</Button>
              </div>
              <table className="w-full text-sm">
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
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Invoices;