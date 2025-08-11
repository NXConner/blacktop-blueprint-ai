import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/services/api';

interface Props {
  vehicleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

const maintenanceChecklistTemplate = {
  fluids_checked: false,
  oil_changed: false,
  filters_replaced: false,
  brakes_inspected: false,
  tires_rotated: false,
  battery_tested: false,
  lights_checked: false,
  belts_hoses_inspected: false
};

const VehicleMaintenanceDialog: React.FC<Props> = ({ vehicleId, open, onOpenChange, onSaved }) => {
  const [performedBy, setPerformedBy] = useState('');
  const [performedDate, setPerformedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('Routine maintenance');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState<number | undefined>(undefined);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({ ...maintenanceChecklistTemplate });
  const [files, setFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);

  const toggle = (key: string) => setChecklist(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const urls: string[] = [];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const res = await api.vehicleDocuments.uploadFile(files[i], `vehicle-maintenance/${vehicleId}`);
          if (res.success && res.data) urls.push(res.data);
        }
      }
      await api.maintenance.addRecord({
        vehicle_id: vehicleId,
        maintenance_type: 'routine',
        description: `${description}\nChecklist: ${JSON.stringify(checklist)}`,
        cost,
        performed_by: performedBy,
        performed_date: performedDate,
        notes
      });
      // Also store any docs as vehicle documents tagged as receipts/other
      for (const url of urls) {
        await api.vehicleDocuments.addRecord({
          vehicle_id: vehicleId,
          document_type: 'receipt',
          document_name: `Maintenance Upload ${new Date().toLocaleString()}`,
          file_url: url,
          notes
        });
      }
      onSaved?.();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-elevated max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Maintenance Record</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div className="space-y-3">
            <div>
              <Label>Performed By</Label>
              <Input value={performedBy} onChange={(e) => setPerformedBy(e.target.value)} placeholder="Technician or vendor" />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={performedDate} onChange={(e) => setPerformedDate(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label>Cost</Label>
              <Input type="number" step="0.01" value={cost ?? ''} onChange={(e) => setCost(e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <Label>Checklist</Label>
              <div className="space-y-2 mt-1">
                {Object.entries(checklist).map(([k, v]) => (
                  <label key={k} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={v} onCheckedChange={() => toggle(k)} />
                    <span className="capitalize">{k.replaceAll('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Attach Docs (manuals, guides, parts, receipts)</Label>
              <Input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="glow-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleMaintenanceDialog;