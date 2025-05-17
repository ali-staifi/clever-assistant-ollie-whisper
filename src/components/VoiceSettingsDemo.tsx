
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VoiceSettingsDialog from '@/components/dialogs/VoiceSettingsDialog';
import { Mic, Settings } from 'lucide-react';

const VoiceSettingsDemo = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="container max-w-md mx-auto p-6">
      <Card className="border shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Mic className="h-5 w-5 text-blue-500" />
            Voice Settings Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <p className="text-sm text-center text-muted-foreground">
            Configure your microphone sensitivity and test your voice input settings.
          </p>
          
          <Button 
            onClick={() => setDialogOpen(true)} 
            className="flex items-center gap-2"
            variant="outline"
          >
            <Settings className="h-4 w-4" />
            Open Voice Settings
          </Button>
        </CardContent>
      </Card>
      
      <VoiceSettingsDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </div>
  );
};

export default VoiceSettingsDemo;
