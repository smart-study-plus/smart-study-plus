import React from 'react';
import { Header } from './header';

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] flex flex-col">
    <Header />
    <main className="flex-1">
      {children}
    </main>
  </div>
);

export default AppLayout;
