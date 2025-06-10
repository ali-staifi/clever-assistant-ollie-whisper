import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, Settings, ServerIcon, MessageSquareText, ImageIcon, NetworkIcon, Database, Monitor } from 'lucide-react';

const Navigation = () => {
  const [activeItem, setActiveItem] = useState('/');
  const location = useLocation();
  
  // Set the active item based on the current path
  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);
  
  const toggleJarvisSettings = () => {
    // Custom event to toggle Jarvis settings
    document.dispatchEvent(new CustomEvent('toggle-jarvis-settings'));
  };

  return (
    <div className="w-16 md:w-20 lg:w-24 backdrop-blur-lg bg-zinc-900/80 text-zinc-400 flex flex-col items-center py-6 shadow-lg border-r border-zinc-800 shrink-0">
      {/* Logo/Home */}
      <Link to="/" className="mb-8">
        <div className={`${activeItem === '/' ? 'text-blue-500' : 'hover:text-white'} p-2 rounded-lg transition-colors`}>
          <HomeIcon size={28} />
        </div>
      </Link>
      
      {/* Navigation Items */}
      <div className="flex flex-col items-center space-y-6">
        {/* Settings */}
        <div
          onClick={toggleJarvisSettings}
          className={`cursor-pointer p-2 rounded-lg transition-colors hover:text-white`}
        >
          <Settings size={24} />
        </div>
        
        {/* API */}
        <Link to="/api">
          <div className={`${activeItem === '/api' ? 'text-blue-500' : 'hover:text-white'} p-2 rounded-lg transition-colors`}>
            <ServerIcon size={24} />
          </div>
        </Link>
        
        {/* Chat */}
        <Link to="/chat">
          <div className={`${activeItem === '/chat' ? 'text-blue-500' : 'hover:text-white'} p-2 rounded-lg transition-colors`}>
            <MessageSquareText size={24} />
          </div>
        </Link>
        
        {/* Vision */}
        <Link to="/vision">
          <div className={`${activeItem === '/vision' ? 'text-blue-500' : 'hover:text-white'} p-2 rounded-lg transition-colors`}>
            <ImageIcon size={24} />
          </div>
        </Link>
        
        {/* MCP */}
        <Link to="/mcp">
          <div className={`${activeItem === '/mcp' ? 'text-blue-500' : 'hover:text-white'} p-2 rounded-lg transition-colors`}>
            <NetworkIcon size={24} />
          </div>
        </Link>
        
        {/* OpenACI */}
        <Link to="/openaci">
          <div className={`${activeItem === '/openaci' ? 'text-blue-500' : 'hover:text-white'} p-2 rounded-lg transition-colors`}>
            <Monitor size={24} />
          </div>
        </Link>
        
        {/* Git & Database */}
        <Link to="/git-database">
          <div className={`${activeItem === '/git-database' ? 'text-blue-500' : 'hover:text-white'} p-2 rounded-lg transition-colors`}>
            <Database size={24} />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Navigation;
