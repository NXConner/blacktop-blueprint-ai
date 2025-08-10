import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addFuelEntry, getFuelSummary } from '@/services/fleet-fuel';

const FleetFuel: React.FC = () => {
  const [summary, setSummary] = useState<{ totalGallons: number; totalCost: number; avgPrice: number }>({ totalGallons: 0, totalCost: 0, avgPrice: 0 });

  useEffect(() => { refresh(); }, []);

  const refresh = async () => setSummary(await getFuelSummary());

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-4">Fleet Fuel Logs</h1>
      <Card className="glass-card p-4 mb-4">
        <div className="grid grid-cols-4 gap-2 items-end">
          <div><div className="text-xs text-muted-foreground">Gallons</div><Input id="fg" type="number" step="0.01" /></div>
          <div><div className="text-xs text-muted-foreground">Price/gal</div><Input id="fp" type="number" step="0.01" /></div>
          <div><div className="text-xs text-muted-foreground">Odometer</div><Input id="fo" type="number" /></div>
          <Button onClick={async () => {
            const gallons = parseFloat((document.getElementById('fg') as HTMLInputElement).value || '0');
            const price = parseFloat((document.getElementById('fp') as HTMLInputElement).value || '0');
            const od = parseInt((document.getElementById('fo') as HTMLInputElement).value || '0');
            if (!gallons || !price) return;
            await addFuelEntry({ gallons, price_per_gallon: price, odometer: od });
            await refresh();
          }}>Add Entry</Button>
        </div>
      </Card>
      <Card className="glass-card p-4">
        <div className="grid grid-cols-3 text-center">
          <div>
            <div className="text-xs text-muted-foreground">Total Gallons</div>
            <div className="text-xl font-semibold">{summary.totalGallons.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Cost</div>
            <div className="text-xl font-semibold">${summary.totalCost.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Avg Price</div>
            <div className="text-xl font-semibold">${summary.avgPrice.toFixed(3)}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FleetFuel;