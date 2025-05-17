
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import VoiceSettingsDialog from '@/components/dialogs/VoiceSettingsDialog';
import { Mic } from 'lucide-react';

const VoiceSettingsDemo = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="p-6 flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Voice Settings Demo</h1>
      
      <Button 
        onClick={() => setDialogOpen(true)} 
        className="flex items-center gap-2"
      >
        <Mic className="h-4 w-4" />
        Open Voice Settings
      </Button>
      
      <VoiceSettingsDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </div>
  );
};

export default VoiceSettingsDemo;
