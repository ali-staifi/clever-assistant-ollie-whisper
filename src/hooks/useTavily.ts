
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface TavilySearchParams {
  query: string;
  include_domains?: string[];
  exclude_domains?: string[];
  search_depth?: "basic" | "advanced";
  max_results?: number;
}

interface TavilySearchResult {
  url: string;
  title: string;
  content: string;
  score: number;
  published_date?: string;
}

interface TavilyResponse {
  results: TavilySearchResult[];
  query: string;
  timing: number;
}

export const useTavily = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TavilySearchResult[]>([]);
  const { toast } = useToast();

  const searchWeb = async (params: TavilySearchParams) => {
    const apiKey = localStorage.getItem('tavily-api-key');
    
    if (!apiKey) {
      toast({
        title: "Clé API Tavily manquante",
        description: "Veuillez configurer une clé API Tavily dans les paramètres API",
        variant: "destructive",
      });
      return null;
    }
    
    setIsSearching(true);
    
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          api_key: apiKey,
          query: params.query,
          include_domains: params.include_domains,
          exclude_domains: params.exclude_domains,
          search_depth: params.search_depth || "basic",
          max_results: params.max_results || 5
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tavily API error: ${response.status} ${errorText}`);
      }
      
      const data: TavilyResponse = await response.json();
      setSearchResults(data.results);
      return data;
    } catch (error) {
      console.error("Error fetching from Tavily:", error);
      toast({
        title: "Erreur de recherche",
        description: error instanceof Error ? error.message : "Erreur de connexion à Tavily",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchWeb,
    isSearching,
    searchResults
  };
};
