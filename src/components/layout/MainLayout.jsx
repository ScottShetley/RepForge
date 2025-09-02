import React from 'react';
import Header from './Header';

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      <Header />
      {/* --- MODIFIED: Simplified to a direct padding model to solve overflow --- */}
      <main className="w-full flex-grow p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;