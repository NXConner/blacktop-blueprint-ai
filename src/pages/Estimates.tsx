import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Row { id: string; service_type: string; inputs: any; breakdown: any; created_at: string }

const Estimates: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('estimates').select('*').order('created_at', { ascending: false });
      setRows((data as any[]) || []);
    })();
  }, []);

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-4">Estimates</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card p-4">
          <div className="space-y-2">
            {rows.map(r => (
              <div key={r.id} className={`p-2 rounded border cursor-pointer ${selected?.id===r.id?'border-primary':'border-glass-border'}`} onClick={() => setSelected(r)}>
                <div className="text-sm font-medium capitalize">{r.service_type.replace('_',' ')}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="glass-card p-6 lg:col-span-2">
          {!selected ? (
            <div className="text-muted-foreground">Select an estimate</div>
          ) : (
            <div className="space-y-3">
              <div className="text-xl font-semibold">Estimate Detail</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Service Type:</span> <span className="capitalize">{selected.service_type.replace('_',' ')}</span></div>
                <div><span className="text-muted-foreground">Created:</span> {new Date(selected.created_at).toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="font-medium">Inputs</div>
                  <pre className="text-xs bg-muted/30 p-2 rounded max-h-72 overflow-auto">{JSON.stringify(selected.inputs, null, 2)}</pre>
                </div>
                <div>
                  <div className="font-medium">Breakdown</div>
                  <pre className="text-xs bg-muted/30 p-2 rounded max-h-72 overflow-auto">{JSON.stringify(selected.breakdown, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Estimates;