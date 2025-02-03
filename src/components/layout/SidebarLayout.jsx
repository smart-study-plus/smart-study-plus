import React from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';

const SidebarLayout = ({ children }) => {
  return (
    <div className="w-full min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-grow w-full bg-gray-50">
          <div className="max-w-[1440px] mx-auto px-6 py-8">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default SidebarLayout; 