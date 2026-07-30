import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Bell, 
  Zap, 
  Palette, 
  Server, 
  RefreshCw, 
  Unlink, 
  Check, 
  Sparkles,
  HelpCircle,
  Copy
} from 'lucide-react';
import { mockAccountDetails } from '../data/mockData';

export default function Settings({ onShowToast }) {
  const [accountStatus, setAccountStatus] = useState(mockAccountDetails.status);
  const [autoApproveLowRisk, setAutoApproveLowRisk] = useState(true);
  
  // Notification preference toggles matching Task 4 alert types
  const [notifPrefs, setNotifPrefs] = useState({
    idleResource: true,
    potentialSaving: true,
    recommendationApplied: true,
    highCarbonUsage: true,
  });

  const [copiedRole, setCopiedRole] = useState(false);

  const toggleNotif = (key) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    if (onShowToast) {
      onShowToast({
        type: 'info',
        title: 'Notification Preferences Updated',
        message: 'Updated alert preferences for CloudLeaf notifications.',
      });
    }
  };

  const handleCopyRole = () => {
    navigator.clipboard.writeText(mockAccountDetails.iamRoleArn);
    setCopiedRole(true);
    setTimeout(() => setCopiedRole(false), 2000);

    if (onShowToast) {
      onShowToast({
        type: 'info',
        title: 'ARN Copied',
        message: 'AWS IAM Role ARN copied to clipboard.',
      });
    }
  };

  const handleToggleDisconnect = () => {
    if (accountStatus === 'Connected') {
      setAccountStatus('Disconnected');
      if (onShowToast) {
        onShowToast({
          type: 'warning',
          title: 'Account Disconnected',
          message: 'Paused active CloudWatch & Cost Explorer collector sync.',
        });
      }
    } else {
      setAccountStatus('Connected');
      if (onShowToast) {
        onShowToast({
          type: 'success',
          title: 'Account Reconnected',
          message: 'Resumed real-time cloud telemetry auditing.',
        });
      }
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary tracking-tight flex items-center gap-2.5">
          Settings & Account Governance
          <SettingsIcon className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant/80 mt-1">
          Manage connected AWS account IAM roles, notification alerts, and automated optimization safety rules.
        </p>
      </div>

      {/* Glass Card Section 1: Connected Cloud Account */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-outline-variant/15 space-y-6">
        <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">{mockAccountDetails.accountName}</h2>
              <span className="text-xs text-on-surface-variant/70">AWS Account ID: {mockAccountDetails.accountId}</span>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              accountStatus === 'Connected'
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-error-container/20 text-error border-error/20'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                accountStatus === 'Connected' ? 'bg-primary animate-ping' : 'bg-error'
              }`}
            />
            {accountStatus}
          </span>
        </div>

        {/* IAM Role details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/15">
          <div>
            <span className="text-[11px] font-semibold text-on-surface-variant/70 uppercase tracking-wider block mb-1">
              IAM Cross-Account Role ARN
            </span>
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-outline-variant/20">
              <span className="text-xs text-on-surface font-mono truncate mr-2">{mockAccountDetails.iamRoleArn}</span>
              <button
                onClick={handleCopyRole}
                className="p-1 rounded-lg text-on-surface-variant/70 hover:text-primary hover:bg-surface-container-low transition-colors shrink-0"
                title="Copy IAM Role ARN"
              >
                {copiedRole ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-on-surface-variant/70 uppercase tracking-wider block mb-1">
              Active Monitored AWS Regions
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {mockAccountDetails.regionsMonitored.map((r, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-white text-on-surface text-xs font-mono border border-outline-variant/20">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Connection Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-on-surface-variant/70">Collector engine: {mockAccountDetails.collectorVersion}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onShowToast) {
                  onShowToast({
                    type: 'info',
                    title: 'Collector Resynced',
                    message: 'Refreshed CloudWatch metrics and cost explorer tags.',
                  });
                }
              }}
              className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold border border-outline-variant/20 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-primary" />
              Resync Telemetry
            </button>

            <button
              onClick={handleToggleDisconnect}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                accountStatus === 'Connected'
                  ? 'bg-error-container/20 text-error border border-error/20 hover:bg-error-container/30'
                  : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
              }`}
            >
              <Unlink className="w-3.5 h-3.5" />
              {accountStatus === 'Connected' ? 'Disconnect Account' : 'Reconnect Account'}
            </button>
          </div>
        </div>
      </div>

      {/* Glass Card Section 2: Automation Safety Controls */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-outline-variant/15 space-y-6">
        <div className="flex items-center gap-3 border-b border-outline-variant/15 pb-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              Automated Optimization & Safety Rules
              <Sparkles className="w-4 h-4 text-primary" />
            </h2>
            <p className="text-xs text-on-surface-variant/80">Ties visually to Action Center auto-approval status chips.</p>
          </div>
        </div>

        {/* Master Auto-Approve Toggle */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/15 flex items-center justify-between">
          <div className="pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-on-surface">Auto-Approve Low-Risk Recommendations</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                ⚡ Auto-Approved Chip Active
              </span>
            </div>
            <p className="text-xs text-on-surface-variant/80 leading-relaxed">
              When enabled, CloudLeaf automatically executes low-risk actions (e.g. non-prod database sleeping, unattached EBS volume deletion, S3 lifecycle rules) without waiting for manual human queue approval.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={autoApproveLowRisk}
              onChange={(e) => {
                setAutoApproveLowRisk(e.target.checked);
                if (onShowToast) {
                  onShowToast({
                    type: 'info',
                    title: 'Auto-Approval Rule Updated',
                    message: e.target.checked
                      ? 'Enabled auto-approval for low-risk actions.'
                      : 'Disabled auto-approval. All recommendations will require manual approval.',
                  });
                }
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>

      {/* Glass Card Section 3: Notification Preferences */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-outline-variant/15 space-y-6">
        <div className="flex items-center gap-3 border-b border-outline-variant/15 pb-4">
          <div className="p-3 rounded-2xl bg-secondary-container/30 text-secondary">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface">Notification Alert Preferences</h2>
            <p className="text-xs text-on-surface-variant/80">Configure which alert types trigger notifications in top header bell.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/15 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-on-surface block">Idle Resource Found Alerts</span>
              <span className="text-[11px] text-on-surface-variant/70 block">Unattached EBS volumes, unassociated Elastic IPs</span>
            </div>
            <input
              type="checkbox"
              checked={notifPrefs.idleResource}
              onChange={() => toggleNotif('idleResource')}
              className="w-4 h-4 accent-primary rounded cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/15 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-on-surface block">Potential Saving Identified Alerts</span>
              <span className="text-[11px] text-on-surface-variant/70 block">Downsizing, Graviton migration opportunities</span>
            </div>
            <input
              type="checkbox"
              checked={notifPrefs.potentialSaving}
              onChange={() => toggleNotif('potentialSaving')}
              className="w-4 h-4 accent-primary rounded cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/15 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-on-surface block">Recommendation Applied Confirmations</span>
              <span className="text-[11px] text-on-surface-variant/70 block">Notifications when auto-approved actions execute</span>
            </div>
            <input
              type="checkbox"
              checked={notifPrefs.recommendationApplied}
              onChange={() => toggleNotif('recommendationApplied')}
              className="w-4 h-4 accent-primary rounded cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/15 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-on-surface block">High Carbon Grid Usage Alerts</span>
              <span className="text-[11px] text-on-surface-variant/70 block">Regional grid emission factor spikes</span>
            </div>
            <input
              type="checkbox"
              checked={notifPrefs.highCarbonUsage}
              onChange={() => toggleNotif('highCarbonUsage')}
              className="w-4 h-4 accent-primary rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Glass Card Section 4: Display & Visual Identity */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-outline-variant/15 space-y-4">
        <div className="flex items-center gap-3 border-b border-outline-variant/15 pb-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface">Visual Identity & Design Theme</h2>
            <p className="text-xs text-on-surface-variant/80">CloudLeaf Ivory Canopy Light Theme</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface block">Ivory Canopy Theme</span>
            <span className="text-[11px] text-primary">Light Mode Glassmorphism Active (#fcf9f2)</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
            Default Brand Identity
          </span>
        </div>
      </div>
    </div>
  );
}
