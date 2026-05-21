import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const AppShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-radsafe-bg text-radsafe-text">
    <div className="app-grid" aria-hidden />
    <Sidebar />
    <div className="ml-[260px] flex min-h-screen flex-col">
      <TopBar />
      <main className="flex-1 animate-fade-in">{children}</main>
    </div>
  </div>
);
