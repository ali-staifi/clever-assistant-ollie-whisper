
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Lightbulb } from 'lucide-react';
import { MCPAgentChat } from './agent/MCPAgentChat';
import { MCPAgentRecommendations } from './agent/MCPAgentRecommendations';

const MCPAgentAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full md:w-[400px]">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat Intelligent
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recommandations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <MCPAgentChat />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <MCPAgentRecommendations />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MCPAgentAssistant;
