import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalFilterBar } from '../filters/GlobalFilterBar';

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#202521] flex">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-72 flex-1 flex flex-col min-w-0">
        <Header />

        <main className="pt-20 px-8 pb-16 max-w-[1680px] w-full mx-auto flex flex-col gap-6">
          {/* Global Filter Bar persistent across all screens */}
          <GlobalFilterBar />

          {/* Screen Content Rendered via React Router */}
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

