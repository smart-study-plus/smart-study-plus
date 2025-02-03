import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/features',
    element: <NotFound />,
  },
  {
    path: '/topics',
    element: <NotFound />,
  },
  {
    path: '/practice',
    element: <NotFound />,
  },
  {
    path: '/test-mode',
    element: <NotFound />,
  },
  {
    path: '/help',
    element: <NotFound />,
  },
  {
    path: '/settings',
    element: <NotFound />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router; 