import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Leaf, Bell, LayoutDashboard, Zap, FileText, Settings } from 'lucide-react';
import NotificationPanel from './NotificationPanel';

export default function Header({ notifications, onMarkAllRead, onMarkRead }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Action Center', path: '/action-center', icon: Zap },
    { label: 'Reports', path: '/report', icon: FileText },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/60 backdrop-blur-xl border-b border-outline-variant/15 shadow-sm shadow-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-primary/10 text-primary shadow-sm group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-primary group-hover:text-primary-container transition-colors">
                CloudLeaf
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-container/20 text-secondary border border-secondary/20 tracking-wide uppercase">
                AWS PROD
              </span>
            </div>
            <span className="text-[10px] text-on-surface-variant/70 font-medium block">Continuous Cloud Carbon & Cost Optimizer</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-container-low/60 p-1 rounded-xl border border-outline-variant/25">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-white text-primary border border-outline-variant/30 shadow-sm'
                      : 'text-on-surface-variant hover:text-primary hover:bg-white/40'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Right Header Controls: Notification Bell & User Avatar */}
        <div className="flex items-center gap-3 relative">
          {/* Notification Bell Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-primary-container/10 text-on-surface-variant hover:text-primary transition-all relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-secondary text-[10px] font-extrabold text-white flex items-center justify-center border border-white shadow-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <NotificationPanel
                notifications={notifications}
                onClose={() => setShowNotifications(false)}
                onMarkAllRead={onMarkAllRead}
                onMarkRead={onMarkRead}
              />
            )}
          </div>

          {/* User Avatar linking to /settings */}
          <Link
            to="/settings"
            className="flex items-center gap-2 p-1 rounded-full hover:bg-primary-container/10 transition-colors border border-outline-variant/20 overflow-hidden"
            title="Account Settings"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img 
                className="w-full h-full object-cover" 
                alt="Profile" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFStCGxmcPfQGCdTnRj5m0uCH0_nbnOKevx2d_0_chJpzTfWM0GemW_mQM0DmDbMnR6--UARNu51n5FXU8yzr7Coxlu9yF5zDyg_56U8YtJYTwwGMO8zSl9Z2Mnep-dISKPlPEBRyia3mX1MzU2U-duWgsAko-Mg1ilblh7z4pel2LGt68LdkmI8N_S2I4w8gPjIzchOMojWDBqcK51yyYT_Jj0BWf454hJ_Vwd2d4NF18zL1RXtvZ" 
              />
            </div>
          </Link>

        </div>
      </div>
    </header>
  );
}
