import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, Settings, ServerIcon } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="bg-jarvis-darkBlue/90 p-3 border-b border-gray-800">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-xl font-bold text-jarvis-blue mr-6">J.A.R.V.I.S</span>
          
          <div className="hidden md:flex space-x-1">
            <Button
              variant={isActive('/') ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/" className="flex items-center">
                <Home className="h-4 w-4 mr-2" />
                <span>Accueil</span>
              </Link>
            </Button>
            
            <Button
              variant={isActive('/chat') ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/chat" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span>Chat</span>
              </Link>
            </Button>
            
            <Button
              variant={isActive('/api') ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/api" className="flex items-center">
                <ServerIcon className="h-4 w-4 mr-2" />
                <span>API</span>
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="md:hidden flex justify-center fixed bottom-0 left-0 right-0 p-2 bg-jarvis-darkBlue/90 border-t border-gray-800">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className={isActive('/') ? "bg-jarvis-blue/20" : ""}
              asChild
            >
              <Link to="/">
                <Home className="h-5 w-5" />
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={isActive('/chat') ? "bg-jarvis-blue/20" : ""}
              asChild
            >
              <Link to="/chat">
                <MessageSquare className="h-5 w-5" />
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={isActive('/api') ? "bg-jarvis-blue/20" : ""}
              asChild
            >
              <Link to="/api">
                <ServerIcon className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
