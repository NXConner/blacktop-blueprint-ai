import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateMaterialPrice } from '@/services/materials-pricing';

const SupplierReceipts: React.FC = () => {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-4">Supplier Receipts</h1>
      <Card className="glass-card p-4">
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
    </div>
  );
};

export default SupplierReceipts;