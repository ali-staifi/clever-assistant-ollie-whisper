
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import IndexPage from './pages/Index';
import ApiPage from './pages/ApiPage';
import ChatPage from './pages/ChatPage';
import NotFound from './pages/NotFound';
import VisionPage from './pages/VisionPage';

import Navigation from './components/Navigation';
import './App.css';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/toaster';

const router = createBrowserRouter([
  {
    path: '/',
    element: <IndexPage />,
  },
  {
    path: '/api',
    element: <ApiPage />,
  },
  {
    path: '/chat',
    element: <ChatPage />,
  },
  {
    path: '/vision',
    element: <VisionPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

function App() {
  return (
    <ThemeProvider attribute="class">
      <div className="flex min-h-screen bg-background">
        <Navigation />
        <main className="flex-1 overflow-auto">
          <RouterProvider router={router} />
        </main>
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
