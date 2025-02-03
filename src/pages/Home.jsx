import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <MainLayout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl font-bold mb-6 text-gray-900">
          Learn Smarter, Not Harder
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          SmartStudy+ helps you master your subjects with personalized learning paths, 
          interactive exercises, and smart study tools.
        </p>
        <div className="flex gap-4">
          <Link
            to="/signup"
            className="px-8 py-3 rounded-full bg-[#F4976C] text-white text-lg font-semibold hover:bg-[#f3855c] transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            to="/features"
            className="px-8 py-3 rounded-full border-2 border-gray-300 text-gray-700 text-lg font-semibold hover:border-gray-400 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home; 