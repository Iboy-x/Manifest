import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {/* Main content */}
      <div className="lg:ml-16">
        <main className="-mt-16 pt-0 pb-4 px-4 lg:pb-8 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}