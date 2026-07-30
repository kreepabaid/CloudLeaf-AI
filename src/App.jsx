import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ChatbotShell from './components/ChatbotShell';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import ActionCenter from './pages/ActionCenter';
import Report from './pages/Report';
import Settings from './pages/Settings';
import ConnectWizard from './pages/ConnectWizard';
import { mockNotifications } from './data/mockData';
import './App.css';

export default function App() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [toast, setToast] = useState(null);

  // Notification handlers
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const showToast = (toastObj) => {
    setToast(toastObj);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
        {/* Top Sticky Header */}
        <Header
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          onMarkRead={handleMarkRead}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16 md:mb-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/action-center" element={<ActionCenter onShowToast={showToast} />} />
            <Route path="/report" element={<Report onShowToast={showToast} />} />
            <Route path="/settings" element={<Settings onShowToast={showToast} />} />
            <Route path="/connect" element={<ConnectWizard onShowToast={showToast} />} />
          </Routes>
        </main>

        {/* Floating Chatbot Assistant Shell (Task 7) */}
        <ChatbotShell />

        {/* Mobile Bottom Navigation (Task 8) */}
        <BottomNav />

        {/* System Toast Feedback (Task 9) */}
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </BrowserRouter>
  );
}
