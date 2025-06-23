
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessages } from './chat/ChatMessages';
import { QuickActions } from './chat/QuickActions';
import { ChatInput } from './chat/ChatInput';
import { useMCPAgentChat } from '../../hooks/mcp/useMCPAgentChat';

export const MCPAgentChat: React.FC = () => {
  const {
    messages,
    currentMessage,
    setCurrentMessage,
    isProcessing,
    sendMessage,
    speechService,
    globalVoiceSettings,
    isSpeaking,
    toggleSpeaking
  } = useMCPAgentChat();

  return (
    <Card className="h-[600px] flex flex-col">
      <ChatHeader
        isSpeaking={isSpeaking}
        globalVoiceSettings={globalVoiceSettings}
        toggleSpeaking={toggleSpeaking}
      />

      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        <ChatMessages
          messages={messages}
          isProcessing={isProcessing}
        />

        <Separator />

        <div className="space-y-2">
          <QuickActions
            onActionSelect={setCurrentMessage}
            isProcessing={isProcessing}
          />

          <ChatInput
            currentMessage={currentMessage}
            setCurrentMessage={setCurrentMessage}
            onSendMessage={sendMessage}
            isProcessing={isProcessing}
          />
        </div>
      </CardContent>
    </Card>
  );
};
