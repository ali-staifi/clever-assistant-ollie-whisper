
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, MessageSquare, Lightbulb, BarChart3 } from 'lucide-react';
import { MCPAgentChat } from './agent/MCPAgentChat';
import { MCPAgentRecommendations } from './agent/MCPAgentRecommendations';
import { useJarvisServices } from '@/hooks/useJarvisServices';

const MCPAgentAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');
  
  const { 
    speechService, 
    globalVoiceSettings,
    isSpeaking 
  } = useJarvisServices();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Agent AI MCP - Assistant Intelligent
          </CardTitle>
          <CardDescription>
            Agent conversationnel avancé intégré avec Jarvis pour l'analyse, l'optimisation et l'amélioration continue du système MCP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Chat Intelligent</p>
                <p className="text-sm text-green-700">Interface conversationnelle active</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Recommandations</p>
                <p className="text-sm text-blue-700">Suggestions d'amélioration actives</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-900">Intégration Jarvis</p>
                <p className="text-sm text-purple-700">
                  {globalVoiceSettings ? 'Vocal synchronisé' : 'Vocal désactivé'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
