import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Save, Mic, FileAudio } from 'lucide-react';

interface Note {
  id: string;
  text: string;
  createdAt: string;
}

const AINotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState('');

  const addNote = () => {
    if (!text.trim()) return;
    setNotes([{ id: crypto.randomUUID(), text, createdAt: new Date().toISOString() }, ...notes]);
    setText('');
  };

  return (
    <Card className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">AI Notes</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Mic className="w-4 h-4 mr-1" /> Record</Button>
          <Button variant="outline" size="sm"><FileAudio className="w-4 h-4 mr-1" /> Upload Audio</Button>
        </div>
      </div>
      <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="Type your notes..." />
      <div className="mt-2">
        <Button onClick={addNote}><Save className="w-4 h-4 mr-2" />Save Note</Button>
      </div>
      <div className="mt-4 space-y-2 max-h-72 overflow-auto">
        {notes.map(n => (
          <div key={n.id} className="p-2 rounded border border-glass-border">
            <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
            <div className="whitespace-pre-wrap text-sm">{n.text}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AINotes;