import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LocalWhisperTranscriber } from '@/components/ai/LocalWhisperTranscriber';
import { PerplexitySearch } from '@/components/search/PerplexitySearch';
import { BackgroundRemover } from '@/components/vision/BackgroundRemover';
import { AudioVisualizer3D } from '@/components/three/AudioVisualizer3D';
import { ZapierWebhook } from '@/components/automation/ZapierWebhook';

const InnovationsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          🚀 Innovations Technologiques
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Découvrez les dernières technologies IA intégrées à votre assistant vocal : 
          WebGPU, transcription locale, recherche intelligente, traitement d'images et automatisation
        </p>
      </div>

      <Tabs defaultValue="whisper" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="whisper">🎤 Whisper Local</TabsTrigger>
          <TabsTrigger value="search">🔍 Recherche IA</TabsTrigger>
          <TabsTrigger value="vision">🖼️ Vision IA</TabsTrigger>
          <TabsTrigger value="3d">🎵 Audio 3D</TabsTrigger>
          <TabsTrigger value="zapier">⚡ Zapier</TabsTrigger>
        </TabsList>

        <TabsContent value="whisper" className="mt-6">
          <LocalWhisperTranscriber />
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          <PerplexitySearch />
        </TabsContent>

        <TabsContent value="vision" className="mt-6">
          <BackgroundRemover />
        </TabsContent>

        <TabsContent value="3d" className="mt-6">
          <AudioVisualizer3D />
        </TabsContent>

        <TabsContent value="zapier" className="mt-6">
          <ZapierWebhook />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InnovationsPage;