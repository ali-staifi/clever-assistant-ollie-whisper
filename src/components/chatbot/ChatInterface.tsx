
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useChatOllama, ChatMessage } from '@/hooks/useChatOllama';
import OllamaConnectionSetup from './OllamaConnectionSetup';
import ChatHeader from './chat/ChatHeader';
import ChatMessages from './chat/ChatMessages';
import ChatInput from './chat/ChatInput';

interface FileAttachment {
  type: 'image' | 'video';
  url: string;
  name: string;
}

interface MessageWithAttachment extends ChatMessage {
  attachment?: FileAttachment;
}

const ChatInterface = () => {
  const {
    ollamaUrl,
    ollamaModel,
    connectionStatus,
    availableModels,
    messages: ollamaMessages,
    isGenerating,
    partialResponse,
    setOllamaUrl,
    setOllamaModel,
    checkConnection,
    sendMessage,
    clearMessages
  } = useChatOllama();

  const [isUploading, setIsUploading] = useState(false);
  const [showConnectionSetup, setShowConnectionSetup] = useState(true); // Montrer par défaut
  const { toast } = useToast();
  
  // Convert Ollama messages to UI messages with attachments
  const [localMessages, setLocalMessages] = useState<MessageWithAttachment[]>([]);

  // Update local messages when Ollama messages change
  useEffect(() => {
    // Preserve attachments when updating messages
    const updatedMessages = ollamaMessages.map(ollamaMsg => {
      // Find existing message with attachment if any
      const existingMsg = localMessages.find(m => m.id === ollamaMsg.id);
      
      return {
        ...ollamaMsg,
        attachment: existingMsg?.attachment,
      };
    });
    
    setLocalMessages(updatedMessages);
  }, [ollamaMessages]);

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (!file) return;

    setIsUploading(true);

    // Check file type
    const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
    
    if (!fileType) {
      toast({
        title: "Fichier invalide",
        description: "Veuillez télécharger une image ou une vidéo.",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    // Create object URL for preview
    const fileUrl = URL.createObjectURL(file);
    
    // Create a local message with attachment
    const localMsgWithAttachment: MessageWithAttachment = {
      id: Date.now().toString(),
      content: `Envoyé ${fileType}: ${file.name}`,
      role: 'user',
      attachment: {
        type: fileType as 'image' | 'video',
        url: fileUrl,
        name: file.name
      }
    };
    
    setLocalMessages((prev) => [...prev, localMsgWithAttachment]);
    
    // Send message to Ollama with file description
    sendMessage(`[Je vous ai envoyé un fichier ${fileType} nommé "${file.name}"]`);
    
    setIsUploading(false);
  };

  return (
    <div className="flex flex-col h-full bg-jarvis-darkBlue/10 rounded-lg overflow-hidden">
      {/* Connection header */}
      <ChatHeader 
        connectionStatus={connectionStatus}
        ollamaModel={ollamaModel}
        showConnectionSetup={showConnectionSetup}
        onToggleConnectionSetup={() => setShowConnectionSetup(!showConnectionSetup)}
      />

      {/* Connection settings panel */}
      {showConnectionSetup && (
        <OllamaConnectionSetup
          ollamaUrl={ollamaUrl}
          ollamaModel={ollamaModel}
          connectionStatus={connectionStatus}
          availableModels={availableModels}
          onOllamaUrlChange={setOllamaUrl}
          onOllamaModelChange={setOllamaModel}
          onCheckConnection={checkConnection}
          onClearChat={clearMessages}
        />
      )}

      {/* Chat Messages */}
      <ChatMessages 
        messages={localMessages}
        connectionStatus={connectionStatus}
        onShowConnectionSetup={() => setShowConnectionSetup(true)}
        onCheckConnection={checkConnection}
      />

      {/* Chat Input */}
      <ChatInput 
        onSendMessage={sendMessage}
        onFileUpload={handleFileUpload}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default ChatInterface;
