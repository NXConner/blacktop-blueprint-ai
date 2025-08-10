import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { asphaltEstimator } from '@/services/estimators/asphalt-estimator';
import { businessConfigService } from '@/services/business-config';
import { fuelPriceService } from '@/services/fuel-price';
import { MapPin, Calculator, Fuel } from 'lucide-react';

const Estimator: React.FC = () => {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDriveway = async (form: HTMLFormElement) => {
    setLoading(true);
    const data = new FormData(form);
    const area = Number(data.get('area') || 0);
    const cracks = Number(data.get('cracks') || 0);
    const porosity = (data.get('porosity') as 'normal' | 'older') || 'normal';

    const profile = await businessConfigService.getProfile();
    const fuel = await fuelPriceService.getPrice('VA', 'regular');

    const estimate = await asphaltEstimator.estimate({
      serviceType: 'driveway',
      sealcoat: { areaSqFt: area, porosity },
      crackFill: { linearFeet: cracks },
      travel: { region: 'VA', milesRoundTrip: 0 },
    });

    setResult({ estimate, profile, fuel });
    setLoading(false);
  };

  const handleParkingLot = async (form: HTMLFormElement) => {
    setLoading(true);
    const data = new FormData(form);
    const area = Number(data.get('area') || 0);
    const porosity = (data.get('porosity') as 'normal' | 'older') || 'normal';
    const stalls = Number(data.get('stalls') || 0);
    const cracks = Number(data.get('cracks') || 0);

    const estimate = await asphaltEstimator.estimate({
      serviceType: 'parking_lot',
      sealcoat: { areaSqFt: area, porosity },
      crackFill: { linearFeet: cracks },
      striping: { standardStalls: stalls },
      travel: { region: 'VA', milesRoundTrip: 0 },
    });

    setResult({ estimate });
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estimator</h1>
          <p className="text-muted-foreground">Driveway and Parking Lot estimations using your business defaults</p>
        </div>
        <Badge variant="outline">Beta</Badge>
      </div>

      <Tabs defaultValue="driveway" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="driveway">Driveway</TabsTrigger>
          <TabsTrigger value="parking">Parking Lot</TabsTrigger>
        </TabsList>

        <TabsContent value="driveway">
          <Card className="glass-card p-6 max-w-2xl">
            <form action={handleDriveway as any} onSubmit={(e) => { e.preventDefault(); handleDriveway(e.currentTarget); }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="area">Sealcoat Area (sq ft)</Label>
                  <Input id="area" name="area" type="number" min={0} required />
                </div>
                <div>
                  <Label htmlFor="porosity">Porosity (normal/older)</Label>
                  <Input id="porosity" name="porosity" placeholder="normal" />
                </div>
                <div>
                  <Label htmlFor="cracks">Crack Filling (linear ft)</Label>
                  <Input id="cracks" name="cracks" type="number" min={0} />
                </div>
              </div>

              <Separator className="my-4" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" /> Job site address will be entered when generating the final proposal.
              </div>

              <div className="mt-4 flex gap-3">
                <Button type="submit" disabled={loading}>
                  <Calculator className="w-4 h-4 mr-2" /> Calculate
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="parking">
          <Card className="glass-card p-6 max-w-2xl">
            <form action={handleParkingLot as any} onSubmit={(e) => { e.preventDefault(); handleParkingLot(e.currentTarget); }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="area_pl">Sealcoat Area (sq ft)</Label>
                  <Input id="area_pl" name="area" type="number" min={0} required />
                </div>
                <div>
                  <Label htmlFor="porosity_pl">Porosity (normal/older)</Label>
                  <Input id="porosity_pl" name="porosity" placeholder="normal" />
                </div>
                <div>
                  <Label htmlFor="stalls">Standard Stalls</Label>
                  <Input id="stalls" name="stalls" type="number" min={0} />
                </div>
                <div>
                  <Label htmlFor="cracks_pl">Crack Filling (linear ft)</Label>
                  <Input id="cracks_pl" name="cracks" type="number" min={0} />
                </div>
              </div>

              <Separator className="my-4" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Fuel className="w-4 h-4" /> Fuel price fetched at calculation time for VA/NC.
              </div>

              <div className="mt-4 flex gap-3">
                <Button type="submit" disabled={loading}>
                  <Calculator className="w-4 h-4 mr-2" /> Calculate
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {result && (
        <Card className="glass-card mt-6 p-4">
          <pre className="text-xs overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>
        </Card>
      )}
    </div>
  );
};

export default Estimator;