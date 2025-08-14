import React from 'react';
import Header from './Header';

const MainLayout = ({children}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
