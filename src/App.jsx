import React, { useState, useEffect, useCallback } from 'react';
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
import './App.css';

function deriveNotifications(insightsList, readIds) {
  if (!Array.isArray(insightsList) || insightsList.length === 0) {
    return [];
  }

  const notifs = [];

  insightsList.forEach((item, index) => {
    const ins = item.insight || item;
    const val = item.validation || {};
    const autoRes = item.automation_result || {};

    const instanceId = ins.instance_id || ins.id || `resource-${index + 1}`;
    const awsService = ins.awsService || 'EC2';
    const isExecuted = autoRes.status === 'success' || autoRes.success === true || ins.status === 'executed';
    const isCritical = ins.tags?.critical === true || ins.risk === 'high' || val.decision === 'rejected';
    const isNeedsApprove = val.decision === 'needs_approval';
    const savings = ins.estimated_savings_usd ? `$${ins.estimated_savings_usd}/mo` : '$25/mo';

    if (isExecuted) {
      const id = `notif-exec-${instanceId}`;
      notifs.push({
        id,
        title: `Automation Executed: ${awsService}`,
        message: `Successfully executed optimization for ${instanceId}. Saved ${savings}.`,
        timestamp: `${(index + 1) * 15} mins ago`,
        type: 'action_executed',
        unread: !readIds.has(id),
        severity: 'success',
      });
    } else if (isCritical) {
      const id = `notif-critical-${instanceId}`;
      notifs.push({
        id,
        title: `High Risk Workload Locked: ${instanceId}`,
        message: `${val.reason || 'Instance is tagged as critical or CPU is high. Automated action blocked.'}`,
        timestamp: `${(index + 1) * 10} mins ago`,
        type: 'idle_resource',
        unread: !readIds.has(id),
        severity: 'warning',
      });
    } else if (isNeedsApprove) {
      const id = `notif-awaiting-${instanceId}`;
      notifs.push({
        id,
        title: `Action Awaiting Approval: ${instanceId}`,
        message: `Production workload ${instanceId} requires manual human queue sign-off.`,
        timestamp: `${(index + 1) * 12} mins ago`,
        type: 'saving_found',
        unread: !readIds.has(id),
        severity: 'info',
      });
    } else {
      const id = `notif-pending-${instanceId}`;
      notifs.push({
        id,
        title: `New Recommendation Review: ${instanceId}`,
        message: `Optimization identified for ${instanceId}. Potential savings: ${savings}.`,
        timestamp: `${(index + 1) * 8} mins ago`,
        type: 'saving_found',
        unread: !readIds.has(id),
        severity: 'info',
      });
    }
  });

  return notifs;
}

export default function App() {
  const [rawInsights, setRawInsights] = useState([]);
  const [readNotifIds, setReadNotifIds] = useState(new Set());
  const [toast, setToast] = useState(null);

  const fetchInsightsData = useCallback(async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/insights');
      if (res.ok) {
        const data = await res.json();
        setRawInsights(data.insights || []);
      }
    } catch (err) {
      console.error('Error syncing notifications with backend:', err);
    }
  }, []);

  useEffect(() => {
    fetchInsightsData();
    const interval = setInterval(fetchInsightsData, 8000);
    return () => clearInterval(interval);
  }, [fetchInsightsData]);

  const notifications = deriveNotifications(rawInsights, readNotifIds);

  // Notification handlers
  const handleMarkAllRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadNotifIds(allIds);
  };

  const handleMarkRead = (id) => {
    setReadNotifIds((prev) => new Set([...prev, id]));
  };

  const showToast = (toastObj) => {
    setToast(toastObj);
    // Refresh live notifications whenever a toast action (e.g. approve/dismiss) occurs
    fetchInsightsData();
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

        {/* Floating Chatbot Assistant Shell */}
        <ChatbotShell />

        {/* Mobile Bottom Navigation */}
        <BottomNav />

        {/* System Toast Feedback */}
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </BrowserRouter>
  );
}
