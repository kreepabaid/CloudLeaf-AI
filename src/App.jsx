import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ActionCenter from './pages/ActionCenter';
import ConnectWizard from './pages/ConnectWizard';
import Report from './pages/Report';
import './App.css'; // Left empty or removed, using tailwind now

function Header() {
  const location = useLocation();
  if (location.pathname === '/') return null; // No header in wizard

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-container/70 dark:bg-surface-container-low/70 backdrop-blur-xl border-b border-white/10 shadow-sm flex justify-between items-center px-4 h-16">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-xl">eco</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg text-primary tracking-tight leading-none mt-1">CloudLeaf</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">AWS Prod</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-primary">notifications</span>
        </button>
        <div className="w-8 h-8 rounded-full border border-primary/20 p-0.5">
          <div className="w-full h-full rounded-full bg-surface-container-highest flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-primary">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  const location = useLocation();
  if (location.pathname === '/') return null;

  const getNavClass = (path) => {
    return location.pathname === path
      ? "flex flex-col items-center justify-center text-primary-container bg-primary/10 rounded-xl px-4 py-1"
      : "flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors";
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-surface-container-low/80 dark:bg-surface-container-lowest/80 backdrop-blur-2xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] rounded-t-xl">
      <Link to="/dashboard" className={getNavClass('/dashboard')}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname === '/dashboard' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
        <span className="text-[10px] font-semibold mt-1">Dashboard</span>
      </Link>
      <Link to="/action-center" className={getNavClass('/action-center')}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname === '/action-center' ? "'FILL' 1" : "'FILL' 0" }}>bolt</span>
        <span className="text-[10px] font-semibold mt-1">Actions</span>
      </Link>
      <Link to="/report" className={getNavClass('/report')}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname === '/report' ? "'FILL' 1" : "'FILL' 0" }}>eco</span>
        <span className="text-[10px] font-semibold mt-1">Report</span>
      </Link>
    </nav>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const isWizard = location.pathname === '/';
  
  return (
    <div className="app-container min-h-screen pb-24">
      <Header />
      {children}
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ConnectWizard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/action-center" element={<ActionCenter />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
