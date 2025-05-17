
import React from 'react';
import { X, FileImage, FileVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilePreviewProps {
  file: File | null;
  onClear: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onClear }) => {
  if (!file) return null;
  
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  
  // Create object URL for preview
  const fileUrl = URL.createObjectURL(file);
  
  return (
    <div className="relative mt-2 mb-2 p-2 border border-gray-700 rounded-md bg-gray-800/50">
      <div className="flex items-center">
        {isImage && (
          <div className="mr-2">
            <img 
              src={fileUrl} 
              alt={file.name}
              className="w-16 h-16 object-cover rounded"
            />
          </div>
        )}
        
        {isVideo && (
          <div className="mr-2 relative">
            <div className="w-16 h-16 bg-gray-700 flex items-center justify-center rounded">
              <FileVideo className="w-8 h-8 text-jarvis-blue" />
            </div>
          </div>
        )}
        
        <div className="flex-1">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-gray-400">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
          onClick={onClear}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default FilePreview;
