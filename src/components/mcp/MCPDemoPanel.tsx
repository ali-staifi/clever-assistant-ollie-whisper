
import React, { useState } from 'react';
import { useMCP } from '@/hooks/useMCP';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2 } from 'lucide-react';

const MCPDemoPanel: React.FC = () => {
  const { isProcessing, processLocalRequest } = useMCP();
  const [activeTab, setActiveTab] = useState('text');
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [result, setResult] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  
  // Handle text generation
  const handleTextGeneration = async () => {
    if (!prompt.trim()) return;
    
    try {
      const response = await processLocalRequest('text_generation', { prompt });
      if (response.status === 'success') {
        setResult(response.content.text);
      }
    } catch (error) {
      console.error('Text generation error:', error);
    }
  };
  
  // Handle code generation
  const handleCodeGeneration = async () => {
    if (!prompt.trim()) return;
    
    try {
      const response = await processLocalRequest('code_generation', { prompt, language });
      if (response.status === 'success') {
        setResult(response.content.code);
      }
    } catch (error) {
      console.error('Code generation error:', error);
    }
  };
  
  // Handle image analysis
  const handleImageAnalysis = async () => {
    if (!imageData) return;
    
    try {
      const response = await processLocalRequest('image_analysis', { 
        imageBase64: imageData,
        prompt: prompt || 'Describe this image in detail' 
      });
      
      if (response.status === 'success') {
        setResult(response.content.description);
      }
    } catch (error) {
      console.error('Image analysis error:', error);
    }
  };
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      // Extract base64 data from the result
      const base64Data = reader.result?.toString().split(',')[1] || '';
      setImageData(base64Data);
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>MCP Demo</CardTitle>
        <CardDescription>
          Interact with the Model Context Protocol to generate text, code, or analyze images
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="text">Text Generation</TabsTrigger>
            <TabsTrigger value="code">Code Generation</TabsTrigger>
            <TabsTrigger value="image">Image Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text">
            <div className="space-y-4">
              <div>
                <Label htmlFor="text-prompt">Prompt</Label>
                <Textarea
                  id="text-prompt"
                  placeholder="Enter your prompt for text generation..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <Button 
                onClick={handleTextGeneration} 
                disabled={isProcessing || !prompt.trim()}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : 'Generate Text'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="code">
            <div className="space-y-4">
              <div>
                <Label htmlFor="code-prompt">Code Description</Label>
                <Textarea
                  id="code-prompt"
                  placeholder="Describe the code you want to generate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  placeholder="javascript"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleCodeGeneration} 
                disabled={isProcessing || !prompt.trim()}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : 'Generate Code'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="image">
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Upload Image</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1"
                />
              </div>
              
              {imageData && (
                <div className="border rounded-md p-2">
                  <img 
                    src={`data:image/jpeg;base64,${imageData}`} 
                    alt="Uploaded" 
                    className="max-h-[200px] mx-auto" 
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="image-prompt">Custom Prompt (Optional)</Label>
                <Input
                  id="image-prompt"
                  placeholder="Ask a question about the image..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleImageAnalysis} 
                disabled={isProcessing || !imageData}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : 'Analyze Image'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        {result && (
          <div className="mt-6">
            <Label>Result</Label>
            <div className="bg-muted p-4 rounded-md mt-1 whitespace-pre-wrap overflow-auto max-h-[300px]">
              {result}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setResult('')}>
          Clear Result
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MCPDemoPanel;
