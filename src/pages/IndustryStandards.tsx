import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const sections = [
  { id: 'osha-va', title: 'OSHA Compliance - Virginia', items: ['VA State Plan overview', 'PPE standards', 'Hazard communication', 'Recordkeeping'] },
  { id: 'osha-nc', title: 'OSHA Compliance - North Carolina', items: ['NC State Plan overview', 'Fall protection', 'Electrical safety', 'Reporting'] },
  { id: 'materials', title: 'Materials Policies & Best Practices', items: ['Asphalt mix specifications', 'Crack repair procedures', 'Patching standards', 'Sealcoating application', 'Line striping specs'] },
];

const IndustryStandards: React.FC = () => {
  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Industry Standards & Compliance</h1>
          <p className="text-muted-foreground">OSHA, state policies, materials specifications, and best practices</p>
        </div>
        <Badge variant="outline">Reference</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map(s => (
          <Card key={s.id} className="glass-card p-4">
            <div className="font-semibold mb-2">{s.title}</div>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {s.items.map((it, idx) => (<li key={idx}>{it}</li>))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IndustryStandards;