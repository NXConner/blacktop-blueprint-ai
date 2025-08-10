import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { businessConfigService, BusinessProfile } from '@/services/business-config';
import { updateMaterialPrice } from '@/services/materials-pricing';
import { Save } from 'lucide-react';

const MaterialsCatalog: React.FC = () => {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);

  useEffect(() => {
    businessConfigService.getProfile().then(setProfile);
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
    </div>
  );
};

export default MaterialsCatalog;