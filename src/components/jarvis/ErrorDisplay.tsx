
import React from 'react';

interface ErrorDisplayProps {
  errorMessage: string;
  onDismiss?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errorMessage, onDismiss }) => {
  if (!errorMessage) return null;
  
  return (
    <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4 text-sm relative">
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="absolute top-2 right-2 text-xs text-white/70 hover:text-white"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
      <p className="font-bold">Error:</p>
      <p className="whitespace-pre-line">{errorMessage}</p>
      {errorMessage.includes('microphone') && (
        <div className="mt-2 text-xs">
          <p>Please check that:</p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Your browser has permission to access the microphone</li>
            <li>Your microphone is properly connected and not muted</li>
            <li>No other application is using the microphone</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;
