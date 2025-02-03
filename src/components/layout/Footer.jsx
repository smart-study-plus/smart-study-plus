import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="container mx-auto px-4 py-3 text-center">
        <p>© {new Date().getFullYear()} Your App Name. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 