import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginModal from '../auth/LoginModal';
import SignupModal from '../auth/SignupModal';

const Header = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  return (
    <>
      <header className="w-full bg-white shadow">
        <div className="max-w-[1440px] mx-auto px-6 py-4">
          <nav className="flex justify-between items-center">
            <Link to="/" className="text-3xl font-extrabold text-[#F4976C]">
              SmartStudy+
            </Link>
            
            <div className="flex items-center space-x-8">
              <div className="space-x-8">
                <Link to="/" className="font-medium text-gray-600 hover:text-gray-900">Home</Link>
                <Link to="/features" className="font-medium text-gray-600 hover:text-gray-900">Features</Link>
                <Link to="/topics" className="font-medium text-gray-600 hover:text-gray-900">Topics</Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium"
                >
                  Login
                </button>
                <button 
                  onClick={() => setIsSignupOpen(true)}
                  className="px-4 py-2 rounded-full bg-[#F4976C] text-white hover:bg-[#f3855c] font-medium"
                >
                  Signup
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
      <SignupModal 
        isOpen={isSignupOpen} 
        onClose={() => setIsSignupOpen(false)} 
      />
    </>
  );
};

export default Header; 