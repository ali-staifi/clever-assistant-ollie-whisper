
import React from 'react';

interface ErrorDisplayProps {
  errorMessage: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errorMessage }) => {
  if (!errorMessage) return null;
  
  return (
    <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4 text-sm">
      <p className="font-bold">Error:</p>
      <p>{errorMessage}</p>
    </div>
  );
};

export default ErrorDisplay;
