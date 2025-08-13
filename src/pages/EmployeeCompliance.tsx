import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const EmployeeCompliance: React.FC = () => {
  const achievements = [
    { id: 'safe-driving', name: 'Safe Driving Streak', value: '30 days', tier: 'Gold' },
    { id: 'on-time', name: 'On-Time Attendance', value: '95%', tier: 'Silver' },
    { id: 'training', name: 'Training Complete', value: 'OSHA 10', tier: 'Bronze' },
  ];

  const checklists = [
    { id: 'osha', title: 'OSHA Daily Checklist', items: ['PPE worn', 'Equipment inspected', 'Site hazards noted'] },
    { id: 'dot', title: 'DOT Vehicle Pre-Trip', items: ['Lights', 'Brakes', 'Tires', 'Fluids'] },
  ];

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employee Compliance</h1>
          <p className="text-muted-foreground">Compliance status, achievements, and safety checklists</p>
        </div>
        <Badge variant="outline">Beta</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card p-4 lg:col-span-2">
          <div className="mb-3 text-lg font-semibold">Achievements</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map(a => (
              <Card key={a.id} className="p-4 space-y-2 border-glass-border">
                <div className="text-sm text-muted-foreground">{a.tier} Tier</div>
                <div className="text-xl font-bold">{a.name}</div>
                <div className="text-sm">{a.value}</div>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="glass-card p-4">
          <div className="mb-3 text-lg font-semibold">Compliance Score</div>
          <div className="text-4xl font-bold">93%</div>
          <div className="text-sm text-muted-foreground">Based on training, checklists, and incident-free days</div>
          <Button variant="outline" className="mt-4">Export Report</Button>
        </Card>
      </div>

      <Card className="glass-card p-4">
        <div className="mb-3 text-lg font-semibold">Daily Checklists</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checklists.map(c => (
            <Card key={c.id} className="p-4">
              <div className="font-medium mb-2">{c.title}</div>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {c.items.map((it, idx) => (<li key={idx}>{it}</li>))}
              </ul>
              <Button variant="outline" className="mt-3">Open</Button>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default EmployeeCompliance;