import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateMaterialPrice, importReceiptCSV } from '@/services/materials-pricing';
import { Label } from '@/components/ui/label';

const SupplierReceipts: React.FC = () => {
  const [csvName, setCsvName] = useState("");
  const [summary, setSummary] = useState<{ updated: number; skipped: number; errors: string[] } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleCSV = async (file: File) => {
    setIsUploading(true);
    try {
      const text = await file.text();
      const result = await importReceiptCSV(text);
      setSummary(result);
      setCsvName(file.name);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <h1 className="text-3xl font-bold">Supplier Receipts</h1>

      <Card className="glass-card p-4 space-y-4">
        <div className="text-lg font-semibold">Manual Update</div>
        <div className="grid grid-cols-4 gap-2 items-end">
          <div>
            <div className="text-xs text-muted-foreground">Material Key</div>
            <Input id="mk" placeholder="pmm_concentrate" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">New Price</div>
            <Input id="mp" type="number" step="0.01" />
          </div>
          <div className="col-span-2">
            <Button onClick={async () => {
              const key = (document.getElementById('mk') as HTMLInputElement).value.trim();
              const price = parseFloat((document.getElementById('mp') as HTMLInputElement).value || '0');
              if (!key || !price) return;
              await updateMaterialPrice(key, price);
              alert('Updated');
            }}>Update Price</Button>
          </div>
        </div>
      </Card>

      <Card className="glass-card p-4 space-y-4">
        <div className="text-lg font-semibold">Bulk Import (CSV)</div>
        <div className="text-sm text-muted-foreground">CSV columns: key, price[, name, unit]. Header optional.</div>
        <div className="flex items-center gap-3">
          <Label htmlFor="csv" className="sr-only">CSV File</Label>
          <Input id="csv" type="file" accept=".csv,text/csv" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleCSV(f);
          }} />
          {csvName && <span className="text-xs text-muted-foreground">{csvName}</span>}
          <Button disabled={isUploading}>{isUploading ? 'Processing...' : 'Process CSV'}</Button>
        </div>
        {summary && (
          <div className="text-sm">
            <div>Updated: <span className="font-semibold">{summary.updated}</span></div>
            <div>Skipped: <span className="font-semibold">{summary.skipped}</span></div>
            {summary.errors.length > 0 && (
              <div className="mt-2">
                <div className="font-semibold">Errors</div>
                <ul className="list-disc pl-6 space-y-1">
                  {summary.errors.map((e, i) => (
                    <li key={i} className="text-red-500">{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SupplierReceipts;