
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Globe, CircleUser, CircleUserRound } from "lucide-react";
import VoiceList from './VoiceList';

interface VoiceFiltersProps {
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
}

const VoiceFilters: React.FC<VoiceFiltersProps> = ({
  availableVoices,
  selectedVoice,
  setSelectedVoice
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Filter voices by gender and language
  const filterVoices = (voices: SpeechSynthesisVoice[], genderFilter?: string): SpeechSynthesisVoice[] => {
    let filteredVoices = [...voices];
    
    // Apply search term filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filteredVoices = filteredVoices.filter(voice => 
        voice.name.toLowerCase().includes(searchTermLower) || 
        voice.lang.toLowerCase().includes(searchTermLower)
      );
    }
    
    // Apply gender filter if specified
    if (genderFilter === 'male') {
      return filteredVoices.filter(voice => {
        // Heuristic to identify male voices
        const maleName = voice.name.toLowerCase().includes('male') || 
                       voice.name.includes('David') || 
                       voice.name.includes('Thomas') || 
                       voice.name.includes('Daniel') || 
                       voice.name.includes('George') || 
                       voice.name.includes('Eric') || 
                       voice.name.includes('Roger') ||
                       voice.name.includes('Paul') ||
                       voice.name.includes('Ismael');
                       
        return maleName;
      });
    } else if (genderFilter === 'female') {
      return filteredVoices.filter(voice => {
        // Heuristic to identify female voices
        const femaleName = voice.name.toLowerCase().includes('female') || 
                         voice.name.includes('Lisa') || 
                         voice.name.includes('Sarah') || 
                         voice.name.includes('Alice') || 
                         voice.name.includes('Victoria') || 
                         voice.name.includes('Samantha') ||
                         voice.name.includes('Amélie') ||
                         voice.name.includes('Marie') ||
                         voice.name.includes('Amina') ||
                         voice.name.includes('Hoda');
                         
        return femaleName;
      });
    }
    
    return filteredVoices;
  };
  
  const maleVoices = filterVoices(availableVoices, 'male');
  const femaleVoices = filterVoices(availableVoices, 'female');
  const allVoices = filterVoices(availableVoices);
  const otherVoices = allVoices.filter(voice => 
    !maleVoices.includes(voice) && !femaleVoices.includes(voice)
  );

  return (
    <>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Rechercher une voix ou une langue..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            <span>Toutes</span>
          </TabsTrigger>
          <TabsTrigger value="male" className="flex items-center gap-1">
            <CircleUser className="h-4 w-4" />
            <span>Hommes</span>
          </TabsTrigger>
          <TabsTrigger value="female" className="flex items-center gap-1">
            <CircleUserRound className="h-4 w-4" />
            <span>Femmes</span>
          </TabsTrigger>
          <TabsTrigger value="other">Autres</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <VoiceList 
            voices={allVoices} 
            selectedVoice={selectedVoice} 
            setSelectedVoice={setSelectedVoice} 
          />
        </TabsContent>
        
        <TabsContent value="male" className="mt-4">
          <VoiceList 
            voices={maleVoices} 
            selectedVoice={selectedVoice} 
            setSelectedVoice={setSelectedVoice} 
          />
        </TabsContent>
        
        <TabsContent value="female" className="mt-4">
          <VoiceList 
            voices={femaleVoices} 
            selectedVoice={selectedVoice} 
            setSelectedVoice={setSelectedVoice} 
          />
        </TabsContent>
        
        <TabsContent value="other" className="mt-4">
          <VoiceList 
            voices={otherVoices} 
            selectedVoice={selectedVoice} 
            setSelectedVoice={setSelectedVoice} 
          />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default VoiceFilters;
