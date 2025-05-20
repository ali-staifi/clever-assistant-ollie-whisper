
import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

import IndexPage from './pages/Index';
import ApiPage from './pages/ApiPage';
import ChatPage from './pages/ChatPage';
import VisionPage from './pages/VisionPage';
import NotFound from './pages/NotFound';

import Navigation from './components/Navigation';
import './App.css';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/toaster';

// Layout component that includes Navigation and an outlet for route content
const Layout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
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
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider attribute="class">
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
