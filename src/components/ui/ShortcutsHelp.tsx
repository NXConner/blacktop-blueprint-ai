import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ShortcutsHelp() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-elevated">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between glass-card p-3 rounded">
            <span>Command Menu</span>
            <kbd className="glass-card px-2 py-1 rounded">Ctrl/⌘ + K</kbd>
          </div>
          <div className="flex items-center justify-between glass-card p-3 rounded">
            <span>Shortcuts Help</span>
            <kbd className="glass-card px-2 py-1 rounded">Shift + ?</kbd>
          </div>
          <div className="flex items-center justify-between glass-card p-3 rounded">
            <span>Open Settings</span>
            <kbd className="glass-card px-2 py-1 rounded">G then S</kbd>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

