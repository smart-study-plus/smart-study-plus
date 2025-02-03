import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

const NotFound = () => {
  return (
    <MainLayout>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-lg mb-4">The page you're looking for doesn't exist.</p>
        <Link to="/" className="text-blue-500 hover:text-blue-700">
          Go back home
        </Link>
      </div>
    </MainLayout>
  );
};

export default NotFound; 