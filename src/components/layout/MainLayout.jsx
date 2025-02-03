import React from 'react';
import Header from './Header';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow w-full">
        <div className="max-w-[1440px] mx-auto px-6">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout; 