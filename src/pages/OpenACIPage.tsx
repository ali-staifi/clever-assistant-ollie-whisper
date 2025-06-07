import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useChatOllama } from "@/hooks/useChatOllama";
import { useMemoryContext } from '@/hooks/useMemoryContext';
import MemoryPanel from '@/components/memory/MemoryPanel';

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

  const memoryContext = useMemoryContext('OpenACI');

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

    // Store the query in memory
    await memoryContext.addContextualMemory(
      `Query Lumen: ${currentQuery.trim()} (Type: ${sessionType})`,
      'conversation',
      7,
      ['lumen', 'query', sessionType]
    );

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
      // Get relevant context from memory
      const relevantContext = await memoryContext.getPageContext(currentQuery);
      console.log('Contexte pertinent:', relevantContext);

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

        // Store the result in memory
        await memoryContext.addContextualMemory(
          `Réponse Lumen complétée avec confiance ${confidence}% pour: ${currentQuery}`,
          'knowledge',
          8,
          ['lumen', 'response', 'completed']
        );
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

      // Store error in memory
      await memoryContext.addContextualMemory(
        `Erreur Lumen: ${error} pour query: ${currentQuery}`,
        'context',
        6,
        ['lumen', 'error']
      );
    }

    setCurrentQuery('');
  };

  const addKnowledgeEntry = async () => {
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
    
    // Store knowledge in memory
    await memoryContext.addContextualMemory(
      `Nouveau concept ajouté: ${newConcept.trim()} - ${conceptDescription.trim()}`,
      'knowledge',
      9,
      ['knowledge-base', 'concept', newConcept.trim()]
    );
    
    setNewConcept('');
    setConceptDescription('');
    
    toast({
      title: "Concept ajouté",
      description: "Nouveau concept intégré à la base de connaissances Lumen",
    });
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    toast({
      title: "Session supprimée",
      description: "La session a été supprimée avec succès",
    });
  };

  return (
    <div className="container py-2 min-h-full">
      <LumenHeader 
        isLumenActive={isLumenActive}
        connectionStatus={connectionStatus}
      />

      <Tabs defaultValue="reasoning" className="space-y-2">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="reasoning">Raisonnement</TabsTrigger>
          <TabsTrigger value="knowledge">Connaissances</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytique</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="memory">Mémoire</TabsTrigger>
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
          <SessionManager 
            sessions={sessions} 
            onDeleteSession={deleteSession}
          />
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

        <TabsContent value="memory" className="space-y-2">
          <MemoryPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OpenACIPage;
