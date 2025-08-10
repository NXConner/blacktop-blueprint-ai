import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { payrollService, PayPeriod } from '@/services/payroll';
import { Calculator } from 'lucide-react';

const Payroll: React.FC = () => {
  const [rows, setRows] = useState([{ name: '', hourlyRate: 20, hoursWorked: 40 }]);
  const [period, setPeriod] = useState<PayPeriod>('weekly');
  const [result, setResult] = useState<any | null>(null);

  const addRow = () => setRows([...rows, { name: '', hourlyRate: 20, hoursWorked: 40 }]);

  const calculate = () => {
    const employees = rows.map((r, idx) => ({ employeeId: String(idx), name: r.name, hourlyRate: r.hourlyRate, hoursWorked: r.hoursWorked }));
    const res = payrollService.runPayroll(employees, period);
    setResult(res);
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-4">Payroll</h1>
      <Card className="glass-card p-6 max-w-3xl">
        <div className="space-y-4">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-3 gap-3">
              <div>
                <Label>Name</Label>
                <Input value={r.name} onChange={e => { const v=[...rows]; v[i].name=e.target.value; setRows(v); }} />
              </div>
              <div>
                <Label>Hourly Rate</Label>
                <Input type="number" value={r.hourlyRate} onChange={e => { const v=[...rows]; v[i].hourlyRate=Number(e.target.value); setRows(v); }} />
              </div>
              <div>
                <Label>Hours</Label>
                <Input type="number" value={r.hoursWorked} onChange={e => { const v=[...rows]; v[i].hoursWorked=Number(e.target.value); setRows(v); }} />
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" onClick={addRow}>Add Employee</Button>
            <Button onClick={calculate}><Calculator className="w-4 h-4 mr-2" />Run Payroll</Button>
          </div>
        </div>
      </Card>

      {result && (
        <Card className="glass-card mt-6 p-4">
          <pre className="text-xs overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>
        </Card>
      )}
    </div>
  );
};

export default Payroll;