
import React from 'react';
import MCPDemoPanel from '../components/mcp/MCPDemoPanel';

const MCPPage: React.FC = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Model Context Protocol (MCP)</h1>
      
      <div className="mb-6">
        <p className="text-lg mb-4">
          The Model Context Protocol (MCP) allows dynamic interaction between AI models and external services,
          enabling applications to leverage AI capabilities while maintaining context across multiple services.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">Key Features</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Dynamic AI model interaction with standardized request/response format</li>
          <li>Integration with external services and APIs</li>
          <li>Contextual processing across multiple requests</li>
          <li>Support for various AI tasks: text generation, code writing, image analysis</li>
          <li>Extensible architecture for custom workflows</li>
        </ul>
      </div>
      
      <MCPDemoPanel />
    </div>
  );
};

export default MCPPage;
