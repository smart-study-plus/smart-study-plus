import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import Practice from '../pages/Practice';
import TestMode from '../pages/TestMode';
import TestQuestion from '../pages/TestQuestion';
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
    path: '/practice',
    element: <Practice />,
  },
  {
    path: '/test-mode',
    element: <TestMode />,
  },
  {
    path: '/test/:testId',
    element: <TestQuestion />,
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