import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { businessConfigService, BusinessProfile } from '@/services/business-config';
import { updateMaterialPrice } from '@/services/materials-pricing';
import { supabase } from '@/integrations/supabase/client';
import { Save } from 'lucide-react';

const MaterialsCatalog: React.FC = () => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    businessConfigService.getProfile().then(setProfile);
    (async () => {
      const { data } = await supabase.from('material_price_history').select('*').order('changed_at', { ascending: false }).limit(10);
      setHistory((data as any[]) || []);
    })();
  }, []);

  const updatePrice = (key: string, price: number) => {
    if (!profile) return;
    const next = { ...profile, materialPrices: { ...profile.materialPrices, [key]: { ...profile.materialPrices[key], price } } } as BusinessProfile;
    setProfile(next);
  };

  const save = async () => {
    if (!profile) return;
    await businessConfigService.setProfile({ materialPrices: profile.materialPrices });
    await Promise.all(Object.entries(profile.materialPrices).map(([k, v]) => updateMaterialPrice(k, v.price)));
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-4">Materials & Pricing</h1>
      <Card className="glass-card p-6 max-w-3xl">
        <div className="space-y-3">
          {Object.entries(profile.materialPrices).map(([key, item]) => (
            <div key={key} className="grid grid-cols-3 gap-3 items-end">
              <div>
                <Label>{item.name}</Label>
                <div className="text-xs text-muted-foreground">per {item.unit}</div>
              </div>
              <div>
                <Label>Price</Label>
                <Input type="number" value={item.price} onChange={e => updatePrice(key, Number(e.target.value))} />
              </div>
              <div className="text-sm">{key}</div>
            </div>
          ))}
          <div className="pt-4">
            <Button onClick={save}><Save className="w-4 h-4 mr-2" />Save</Button>
          </div>
        </div>
      </Card>
      <Card className="glass-card p-6 max-w-3xl mt-4">
        <div className="font-semibold mb-2">Recent Price Changes</div>
        <div className="space-y-1 text-sm">
          {history.map(h => (
            <div key={h.id} className="flex justify-between">
              <div>{h.key} — {h.name}</div>
              <div>${Number(h.price).toFixed(2)} on {new Date(h.changed_at).toLocaleDateString()}</div>
            </div>
          ))}
          {history.length === 0 && <div className="text-muted-foreground">No history yet.</div>}
        </div>
      </Card>
    </div>
  );
};

export default MaterialsCatalog;