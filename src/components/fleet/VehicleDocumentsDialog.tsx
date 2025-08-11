import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/services/api';

interface Props {
  vehicleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VehicleDocumentsDialog: React.FC<Props> = ({ vehicleId, open, onOpenChange }) => {
  const [docType, setDocType] = useState('manual');
  const [docName, setDocName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [listing, setListing] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const res = await api.vehicleDocuments.list(vehicleId);
    if (res.success) setListing(res.data);
  };

  useEffect(() => { if (open) void load(); }, [open]);

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const urlRes = await api.vehicleDocuments.uploadFile(file, `vehicle-documents/${vehicleId}`);
      if (!urlRes.success) return;
      await api.vehicleDocuments.addRecord({
        vehicle_id: vehicleId,
        document_type: docType,
        document_name: docName || file.name,
        file_url: urlRes.data,
      });
      setDocName('');
      setFile(null);
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-elevated max-w-3xl">
        <DialogHeader>
          <DialogTitle>Vehicle Documents</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <Label>Type</Label>
              <select className="w-full border rounded h-10 px-3 bg-background" value={docType} onChange={e => setDocType(e.target.value)}>
                <option value="manual">Manual</option>
                <option value="repair_guide">Repair Guide</option>
                <option value="parts_list">Parts List</option>
                <option value="receipt">Receipt</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label>Name</Label>
              <Input value={docName} onChange={e => setDocName(e.target.value)} placeholder="Document name" />
            </div>
            <div>
              <Label>File</Label>
              <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={upload} disabled={!file || busy} className="glow-primary">{busy ? 'Uploading...' : 'Upload'}</Button>
          </div>
          <div>
            <h4 className="font-medium mb-2">Existing Documents</h4>
            <div className="space-y-2 max-h-64 overflow-auto pr-1">
              {listing.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm p-2 rounded border border-glass-border">
                  <div>
                    <div className="font-medium">{d.document_name}</div>
                    <div className="text-muted-foreground">{d.document_type}</div>
                  </div>
                  <a className="text-primary underline" href={d.file_url} target="_blank" rel="noreferrer">Open</a>
                </div>
              ))}
              {listing.length === 0 && <div className="text-sm text-muted-foreground">No documents uploaded yet.</div>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDocumentsDialog;