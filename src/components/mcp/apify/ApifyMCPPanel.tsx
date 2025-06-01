
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import ApifyRequestForm from './ApifyRequestForm';
import ApifyResultDisplay from './ApifyResultDisplay';
import { useApifyMCP } from '@/hooks/mcp/useApifyMCP';

const ApifyMCPPanel: React.FC = () => {
  const { 
    result,
    isProcessing,
    setResult,
    handleSubmitRequest
  } = useApifyMCP();
  
  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">ApifyMCP Demo</CardTitle>
        <CardDescription className="text-sm">
          Interagissez avec le module ApifyMCP pour l'automatisation web
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-1 space-y-3">
        <ApifyRequestForm 
          onSubmit={handleSubmitRequest}
          isProcessing={isProcessing}
        />
        
        {result && (
          <ApifyResultDisplay 
            result={result}
          />
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button variant="outline" onClick={() => setResult(null)} size="sm">
          Effacer le résultat
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApifyMCPPanel;
