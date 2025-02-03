import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { icon: "📊", label: "Dashboard", path: "/dashboard" },
    { icon: "📝", label: "Practice", path: "/practice" },
    { icon: "✍️", label: "Test Mode", path: "/test-mode" },
    { icon: "❓", label: "Help", path: "/help" },
    { icon: "⚙️", label: "Settings", path: "/settings" },
  ];

  return (
    <div className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <Link to="/" className="text-2xl font-extrabold text-[#F4976C]">
          SmartStudy+
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 ${
              location.pathname === item.path
                ? 'bg-[#F4976C] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-4 py-3">
          <img
            src="https://ui-avatars.com/api/?name=John+Doe"
            alt="John Doe"
            className="w-8 h-8 rounded-full"
          />
          <div>
            <p className="font-medium text-gray-900">John Doe</p>
            <p className="text-sm text-gray-500">Premium User</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 