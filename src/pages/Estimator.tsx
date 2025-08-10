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
import { geocodeAddress, haversineMiles, detectRegionFromAddress } from '@/services/geocoding';
import { Slider } from '@/components/ui/slider';
import { invoicingService } from '@/services/invoicing';
import { postInvoiceToGL } from '@/services/accounting/invoice-posting';
import { C30_1978, computeSk550Load, checkVehicleLoad } from '@/services/transport';

const Estimator: React.FC = () => {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [overhead, setOverhead] = useState(10);
  const [profit, setProfit] = useState(20);

  const handleDriveway = async (form: HTMLFormElement) => {
    setLoading(true);
    const data = new FormData(form);
    const area = Number(data.get('area') || 0);
    const cracks = Number(data.get('cracks') || 0);
    const porosity = (data.get('porosity') as 'normal' | 'older') || 'normal';
    const address = String(data.get('address') || '');

    const profile = await businessConfigService.getProfile();
    const businessAddress = `${profile.address}, ${profile.city}, ${profile.state} ${profile.zip}`;
    let milesRT = 0;
    let region: any = 'VA';
    if (address) {
      const supplierAddress = `${profile.supplier.address}, ${profile.supplier.city}, ${profile.supplier.state} ${profile.supplier.zip}`;
      const [biz, sup, job] = await Promise.all([geocodeAddress(businessAddress), geocodeAddress(supplierAddress), geocodeAddress(address)]);
      if (biz && sup && job) {
        const leg1 = haversineMiles(biz, sup);
        const leg2 = haversineMiles(sup, biz);
        const leg3 = haversineMiles(biz, job);
        const leg4 = haversineMiles(job, biz);
        milesRT = Math.round(leg1 + leg2 + leg3 + leg4);
      }
      const regionDetected = detectRegionFromAddress(address);
      if (regionDetected !== 'OTHER') region = regionDetected;
    }
    const fuel = await fuelPriceService.getPrice(region, 'regular');

    const inputPayload = {
      serviceType: 'driveway',
      sealcoat: { areaSqFt: area, porosity },
      crackFill: { linearFeet: cracks },
      travel: { region, milesRoundTrip: milesRT },
      overheadPct: overhead,
      profitMarginPct: profit,
    } as const;
    const estimate = await asphaltEstimator.estimate(inputPayload, true);

    const load = computeSk550Load(Math.min(550, Math.max(0, area / 100))); // rough gallons heuristic
    const gvwr = checkVehicleLoad(C30_1978, [load]);
    setResult({ estimate, profile, fuel, transport: gvwr });
    setLoading(false);
  };

  const handleParkingLot = async (form: HTMLFormElement) => {
    setLoading(true);
    const data = new FormData(form);
    const area = Number(data.get('area') || 0);
    const porosity = (data.get('porosity') as 'normal' | 'older') || 'normal';
    const stalls = Number(data.get('stalls') || 0);
    const arrows = Number(data.get('arrows') || 0);
    const crosswalks = Number(data.get('crosswalks') || 0);
    const handicap = Number(data.get('handicap') || 0);
    const colors = Number(data.get('colors') || 1);
    const cracks = Number(data.get('cracks') || 0);
    const address = String(data.get('address') || '');

    const profile = await businessConfigService.getProfile();
    const businessAddress = `${profile.address}, ${profile.city}, ${profile.state} ${profile.zip}`;
    let milesRT = 0;
    let region: any = 'VA';
    if (address) {
      const supplierAddress = `${profile.supplier.address}, ${profile.supplier.city}, ${profile.supplier.state} ${profile.supplier.zip}`;
      const [biz, sup, job] = await Promise.all([geocodeAddress(businessAddress), geocodeAddress(supplierAddress), geocodeAddress(address)]);
      if (biz && sup && job) {
        const leg1 = haversineMiles(biz, sup);
        const leg2 = haversineMiles(sup, biz);
        const leg3 = haversineMiles(biz, job);
        const leg4 = haversineMiles(job, biz);
        milesRT = Math.round(leg1 + leg2 + leg3 + leg4);
      }
      const regionDetected = detectRegionFromAddress(address);
      if (regionDetected !== 'OTHER') region = regionDetected;
    }

    const inputPayload = {
      serviceType: 'parking_lot',
      sealcoat: { areaSqFt: area, porosity },
      crackFill: { linearFeet: cracks },
      striping: { standardStalls: stalls, arrows, crosswalks, handicapSpots: handicap, paintColors: colors },
      travel: { region, milesRoundTrip: milesRT },
      overheadPct: overhead,
      profitMarginPct: profit,
    } as const;
    const estimate = await asphaltEstimator.estimate(inputPayload, true);

    const load = computeSk550Load(Math.min(550, Math.max(0, area / 100)));
    const gvwr = checkVehicleLoad(C30_1978, [load]);
    setResult({ estimate, transport: gvwr });
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
                <div>
                  <Label htmlFor="oil">Oil spot area (sq ft)</Label>
                  <Input id="oil" name="oil" type="number" min={0} />
                </div>
                <div>
                  <Label htmlFor="fastdry">Fast dry buckets (0 for auto)</Label>
                  <Input id="fastdry" name="fastdry" type="number" min={0} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="addr">Job Address (optional)</Label>
                  <Input id="addr" name="address" placeholder="Street, City, ST ZIP" />
                </div>
              </div>

              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="mb-2 text-sm">Overhead: {overhead}%</div>
                  <Slider value={[overhead]} min={0} max={30} step={1} onValueChange={v => setOverhead(v[0])} />
                </div>
                <div>
                  <div className="mb-2 text-sm">Profit: {profit}%</div>
                  <Slider value={[profit]} min={0} max={40} step={1} onValueChange={v => setProfit(v[0])} />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <Button type="submit" disabled={loading}>
                  <Calculator className="w-4 h-4 mr-2" /> Calculate
                </Button>
                <Button type="button" variant="outline" onClick={() => window.print()}>Export PDF</Button>
                <Button type="button" variant="outline" onClick={async () => {
                  if (!result) return;
                  const iv = await invoicingService.createFromEstimate(result.inputs || {}, { name: '', address: '' }, 'Estimate');
                  const jeId = await postInvoiceToGL(iv);
                  alert('Invoice created and posted. JE: ' + (jeId || 'n/a'));
                }}>Create Invoice</Button>
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
                  <Label htmlFor="arrows">Arrows</Label>
                  <Input id="arrows" name="arrows" type="number" min={0} />
                </div>
                <div>
                  <Label htmlFor="crosswalks">Crosswalks</Label>
                  <Input id="crosswalks" name="crosswalks" type="number" min={0} />
                </div>
                <div>
                  <Label htmlFor="cracks_pl">Crack Filling (linear ft)</Label>
                  <Input id="cracks_pl" name="cracks" type="number" min={0} />
                </div>
                <div>
                  <Label htmlFor="handicap">Handicap Spots</Label>
                  <Input id="handicap" name="handicap" type="number" min={0} />
                </div>
                <div>
                  <Label htmlFor="colors">Paint Colors</Label>
                  <Input id="colors" name="colors" type="number" min={1} defaultValue={1} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="addr_pl">Job Address (optional)</Label>
                  <Input id="addr_pl" name="address" placeholder="Street, City, ST ZIP" />
                </div>
              </div>

              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="mb-2 text-sm">Overhead: {overhead}%</div>
                  <Slider value={[overhead]} min={0} max={30} step={1} onValueChange={v => setOverhead(v[0])} />
                </div>
                <div>
                  <div className="mb-2 text-sm">Profit: {profit}%</div>
                  <Slider value={[profit]} min={0} max={40} step={1} onValueChange={v => setProfit(v[0])} />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <Button type="submit" disabled={loading}>
                  <Calculator className="w-4 h-4 mr-2" /> Calculate
                </Button>
                <Button type="button" variant="outline" onClick={() => window.print()}>Export PDF</Button>
                <Button type="button" variant="outline" onClick={async () => {
                  if (!result) return;
                  const iv = await invoicingService.createFromEstimate(result.inputs || {}, { name: '', address: '' }, 'Estimate');
                  const jeId = await postInvoiceToGL(iv);
                  alert('Invoice created and posted. JE: ' + (jeId || 'n/a'));
                }}>Create Invoice</Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {result && (
        <Card className="glass-card mt-6 p-4">
          <div className="grid grid-cols-2 gap-4">
            <pre className="text-xs overflow-auto max-h-96 bg-muted/30 p-2 rounded">{JSON.stringify(result, null, 2)}</pre>
            {result.transport && (
              <div className="text-sm">
                <div className="font-medium mb-1">Transport Load Check</div>
                <div>Total Weight: {Math.round(result.transport.total).toLocaleString()} lbs</div>
                <div>Within GVWR: {result.transport.within ? 'Yes' : 'No'}</div>
                <div>Usage: {(result.transport.pct*100).toFixed(1)}%</div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Estimator;