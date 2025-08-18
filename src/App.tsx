import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

import IndexPage from './pages/Index';
import ApiPage from './pages/ApiPage';
import ChatPage from './pages/ChatPage';
import VisionPage from './pages/VisionPage';
import MCPPage from './pages/MCPPage';
import OpenACIPage from './pages/OpenACIPage';
import GitDatabasePage from './pages/GitDatabasePage';
import InnovationsPage from './pages/InnovationsPage';

import NotFound from './pages/NotFound';

import Navigation from './components/Navigation';
import './App.css';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/toaster';
import { WallpaperProvider } from './contexts/WallpaperContext';
import { MemoryProvider } from './contexts/MemoryContext';
import DynamicBackground from './components/wallpaper/DynamicBackground';
import { motion, AnimatePresence } from 'framer-motion';

// Layout component that includes Navigation and an outlet for route content
const Layout = () => {
  return (
    <DynamicBackground>
      <div className="flex min-h-screen">
        <Navigation />
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </DynamicBackground>
  );
};

// Define router with Layout as the root route
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <IndexPage />,
      },
      {
        path: 'api',
        element: <ApiPage />,
      },
      {
        path: 'chat',
        element: <ChatPage />,
      },
      {
        path: 'vision',
        element: <VisionPage />,
      },
      {
        path: 'mcp',
        element: <MCPPage />,
      },
      {
        path: 'openaci',
        element: <OpenACIPage />,
      },
      {
        path: 'git-database',
        element: <GitDatabasePage />,
      },
      {
        path: 'innovations',
        element: <InnovationsPage />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WallpaperProvider>
        <MemoryProvider>
          <RouterProvider router={router} />
          <Toaster />
        </MemoryProvider>
      </WallpaperProvider>
    </ThemeProvider>
  );
}

export default App;
