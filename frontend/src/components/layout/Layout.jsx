import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 grid grid-cols-[64px_1fr]">
      {/* Sidebar */}
      <div className="bg-white border-r border-gray-200">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-col">
        {/* Header */}
        <div className="bg-white border-gray-200">
          <Header />
        </div>
        
        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;