
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useChatOllama } from "@/hooks/useChatOllama";

import LumenHeader from './openaci/components/LumenHeader';
import LumenControl from './openaci/components/LumenControl';
import QueryInterface from './openaci/components/QueryInterface';
import ResponseDisplay from './openaci/components/ResponseDisplay';
import KnowledgeManager from './openaci/components/KnowledgeManager';
import SessionManager from './openaci/components/SessionManager';
import AnalyticsPanel from './openaci/components/AnalyticsPanel';
import ConfigPanel from './openaci/components/ConfigPanel';

import { LumenSession, KnowledgeEntry } from './openaci/types';
import { generateLumenReasoningSteps, generateLumenPrompt, getInitialKnowledge } from './openaci/utils/lumenUtils';

const OpenACIPage: React.FC = () => {
  const [isLumenActive, setIsLumenActive] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [sessionType, setSessionType] = useState<LumenSession['type']>('reasoning');
  const [sessions, setSessions] = useState<LumenSession[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeEntry[]>([]);
  const [newConcept, setNewConcept] = useState('');
  const [conceptDescription, setConceptDescription] = useState('');
  const { toast } = useToast();
  
  const {
    ollamaUrl,
    ollamaModel,
    connectionStatus,
    availableModels,
    messages,
    isGenerating,
    setOllamaUrl,
    setOllamaModel,
    checkConnection,
    sendMessage,
    clearMessages
  } = useChatOllama();

  useEffect(() => {
    setKnowledgeBase(getInitialKnowledge());
    checkConnection();
  }, []);

  const activateLumen = async () => {
    try {
      const connected = await checkConnection();
      if (!connected) {
        throw new Error("Impossible de se connecter au moteur LLM");
      }
      
      setIsLumenActive(true);
      toast({
        title: "Lumen activé",
        description: "Système de raisonnement et d'analyse avancé prêt",
      });
    } catch (error) {
      toast({
        title: "Erreur d'activation",
        description: "Impossible d'activer Lumen. Vérifiez la connexion LLM.",
        variant: "destructive",
      });
    }
  };

  const deactivateLumen = () => {
    setIsLumenActive(false);
    toast({
      title: "Lumen désactivé",
      description: "Système arrêté",
    });
  };

  const processLumenQuery = async () => {
    if (!isLumenActive || !currentQuery.trim()) return;

    const newSession: LumenSession = {
      id: Date.now().toString(),
      type: sessionType,
      query: currentQuery.trim(),
      response: '',
      reasoning_steps: [],
      confidence: 0,
      timestamp: new Date(),
      status: 'processing'
    };

    setSessions(prev => [newSession, ...prev]);

    try {
      const lumenPrompt = generateLumenPrompt(sessionType, currentQuery);

      if (connectionStatus === 'connected') {
        await sendMessage(lumenPrompt);
        
        const reasoningSteps = generateLumenReasoningSteps(sessionType, currentQuery);
        const confidence = Math.round(85 + Math.random() * 10);
        
        setSessions(prev => prev.map(s => 
          s.id === newSession.id ? { 
            ...s, 
            status: 'completed',
            reasoning_steps: reasoningSteps,
            confidence: confidence,
            response: 'Analyse complétée - voir réponse détaillée ci-dessous'
          } : s
        ));
      } else {
        throw new Error("Moteur LLM non connecté");
      }
      
    } catch (error) {
      setSessions(prev => prev.map(s => 
        s.id === newSession.id ? { 
          ...s, 
          status: 'error',
          response: `Erreur: ${error}`
        } : s
      ));
    }

    setCurrentQuery('');
  };

  const addKnowledgeEntry = () => {
    if (!newConcept.trim() || !conceptDescription.trim()) return;

    const newEntry: KnowledgeEntry = {
      id: Date.now().toString(),
      concept: newConcept.trim(),
      description: conceptDescription.trim(),
      relations: [],
      examples: [],
      timestamp: new Date()
    };

    setKnowledgeBase(prev => [newEntry, ...prev]);
    setNewConcept('');
    setConceptDescription('');
    
    toast({
      title: "Concept ajouté",
      description: "Nouveau concept intégré à la base de connaissances Lumen",
    });
  };

  return (
    <div className="container py-2 min-h-full">
      <LumenHeader 
        isLumenActive={isLumenActive}
        connectionStatus={connectionStatus}
      />

      <Tabs defaultValue="reasoning" className="space-y-2">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="reasoning">Raisonnement</TabsTrigger>
          <TabsTrigger value="knowledge">Connaissances</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytique</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="reasoning" className="space-y-2">
          <LumenControl
            isLumenActive={isLumenActive}
            onActivate={activateLumen}
            onDeactivate={deactivateLumen}
          />

          <QueryInterface
            sessionType={sessionType}
            currentQuery={currentQuery}
            isLumenActive={isLumenActive}
            isGenerating={isGenerating}
            onSessionTypeChange={setSessionType}
            onQueryChange={setCurrentQuery}
            onProcessQuery={processLumenQuery}
          />

          <ResponseDisplay messages={messages} />
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-2">
          <KnowledgeManager
            knowledgeBase={knowledgeBase}
            newConcept={newConcept}
            conceptDescription={conceptDescription}
            onNewConceptChange={setNewConcept}
            onConceptDescriptionChange={setConceptDescription}
            onAddKnowledge={addKnowledgeEntry}
          />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-2">
          <SessionManager sessions={sessions} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-2">
          <AnalyticsPanel sessions={sessions} knowledgeBase={knowledgeBase} />
        </TabsContent>

        <TabsContent value="config" className="space-y-2">
          <ConfigPanel
            ollamaUrl={ollamaUrl}
            ollamaModel={ollamaModel}
            availableModels={availableModels}
            onUrlChange={setOllamaUrl}
            onModelChange={setOllamaModel}
            onTestConnection={checkConnection}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OpenACIPage;
