import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVeteranServices } from '@/services/veteran-services/veteran-certification';

const VeteransDashboard: React.FC = () => {
  const { certifications, opportunities, isLoading, loadCertifications, loadOpportunities } = useVeteranServices();
  React.useEffect(() => { void loadCertifications('demo_business'); void loadOpportunities('demo_business'); }, []);

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Veterans Dashboard</h1>
          <p className="text-muted-foreground">VOSB/SDVOSB status, matched contracts, and compliance</p>
        </div>
        <Badge variant="outline">Beta</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card p-4">
          <div className="text-sm text-muted-foreground">Active Certifications</div>
          <div className="text-4xl font-bold">{certifications.length}</div>
        </Card>
        <Card className="glass-card p-4">
          <div className="text-sm text-muted-foreground">Open Opportunities</div>
          <div className="text-4xl font-bold">{opportunities.length}</div>
        </Card>
        <Card className="glass-card p-4">
          <div className="text-sm text-muted-foreground">Interested</div>
          <div className="text-4xl font-bold">{opportunities.filter(o => o.interest_expressed).length}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card p-4">
          <div className="mb-3 font-semibold">Certifications</div>
          <div className="space-y-2 text-sm">
            {isLoading && <div>Loading...</div>}
            {!isLoading && certifications.map(c => (
              <div key={c.id} className="border rounded p-2 border-glass-border">
                <div className="font-medium">{c.certification_type.toUpperCase()}</div>
                <div className="text-xs text-muted-foreground">#{c.certification_number} • Status: {c.status}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="mb-3 font-semibold">Matched Opportunities</div>
          <div className="space-y-2 text-sm">
            {isLoading && <div>Loading...</div>}
            {!isLoading && opportunities.map(o => (
              <div key={o.id} className="border rounded p-2 border-glass-border">
                <div className="font-medium">{o.title}</div>
                <div className="text-xs text-muted-foreground">Agency: {o.agency} • Set-aside: {o.set_aside}</div>
                <Button size="sm" variant="outline" className="mt-2">Express Interest</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VeteransDashboard;