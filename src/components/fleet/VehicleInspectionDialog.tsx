import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { api } from '@/services/api';

interface VehicleInspectionDialogProps {
  vehicleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

const defaultChecklist = {
  exterior: {
    windshield_free_of_cracks: false,
    body_panel_colors_match: false,
    magnet_adheres_all_steel_panels: false,
    fresh_paint_job_flag: false,
    trunk_hood_seams_aligned: false,
    doors_fenders_seams_aligned: false,
    body_free_of_scratches: false,
    body_free_of_dents: false,
    wipers_blades_functional: false,
    lights_functional: false
  },
  tires: {
    reputable_brand: false,
    same_make: false,
    free_of_cuts_bubbles_cracks: false,
    tread_worn_evenly: false,
    spare_equipped_with_tools: false,
    spare_inflated: false
  },
  engine: {
    free_of_fluid_or_oil_leaks: false,
    filler_neck_clean: false,
    terminals_free_of_corrosion: false,
    oil_dipstick_clean: false,
    no_odors_running: false,
    exhaust_emissions_normal: false
  },
  suspension: {
    vehicle_rests_level: false,
    no_creaking_when_bouncing: false,
    uniform_bounce_response: false
  },
  interior: {
    seats_unworn: false,
    doors_open_close_freely: false,
    trunk_opens_closes_freely: false,
    no_heavy_air_freshener: false,
    gauges_work: false,
    no_warning_lights: false,
    stereo_works: false,
    heater_works: false
  }
};

export const VehicleInspectionDialog: React.FC<VehicleInspectionDialogProps> = ({ vehicleId, open, onOpenChange, onSaved }) => {
  const [inspectorName, setInspectorName] = useState('');
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState<any>(defaultChecklist);
  const [files, setFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);

  const toggle = (section: string, key: string) => {
    setChecklist((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [key]: !prev[section][key] }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upload files if any
      const urls: string[] = [];
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const res = await api.vehicleDocuments.uploadFile(files[i], `vehicle-inspections/${vehicleId}`);
          if (res.success && res.data) urls.push(res.data);
        }
      }
      const res = await api.inspections.create({
        vehicle_id: vehicleId,
        inspector_name: inspectorName,
        checklist,
        notes,
        attachment_urls: urls
      });
      if (res.success) {
        onOpenChange(false);
        onSaved?.();
      }
    } finally {
      setSaving(false);
    }
  };

  const renderSection = (sectionKey: keyof typeof defaultChecklist, title: string) => {
    const section = checklist[sectionKey] as Record<string, boolean>;
    return (
      <div className="space-y-2">
        <h4 className="font-medium mt-2">{title}</h4>
        {Object.entries(section).map(([k, v]) => (
          <label key={k} className="flex items-center gap-2 text-sm">
            <Checkbox checked={v} onCheckedChange={() => toggle(sectionKey as string, k)} />
            <span className="capitalize">{k.replaceAll('_', ' ')}</span>
          </label>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-elevated max-w-3xl">
        <DialogHeader>
          <DialogTitle>Vehicle Inspection Checklist</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2 max-h-[60vh] overflow-auto pr-2">
          <div className="space-y-3">
            <div>
              <Label>Inspector</Label>
              <Input value={inspectorName} onChange={(e) => setInspectorName(e.target.value)} placeholder="Name" />
            </div>
            {renderSection('exterior', 'Exterior')}
            {renderSection('tires', 'Tires')}
            {renderSection('engine', 'Engine')}
          </div>
          <div className="space-y-3">
            {renderSection('suspension', 'Suspension')}
            {renderSection('interior', 'Interior')}
            <div>
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes..." rows={8} />
            </div>
            <div>
              <Label>Attachments</Label>
              <Input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="glow-primary">{saving ? 'Saving...' : 'Save Inspection'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleInspectionDialog;