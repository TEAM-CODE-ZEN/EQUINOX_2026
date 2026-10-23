import React from 'react';
import {
  Inbox,
  Users,
  CalendarDays,
  Bell,
  LifeBuoy,
  LayoutDashboard,
  ShieldAlert,
  BookmarkCheck,
  PhoneCall,
  QrCode,
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserProfile;
  unreadCount: number;
  openIssuesCount: number;
  myIssuesCount: number;
  onApplyGatePass?: () => void;
  gatePassCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  unreadCount,
  openIssuesCount,
  myIssuesCount,
  onApplyGatePass,
  gatePassCount,
}) => {
  const isStaffOrAdmin =
    currentUser.role === 'Campus Staff' || currentUser.role === 'Admin';
  const isAdmin = currentUser.role === 'Admin';

  const navItems = [
    {
      id: 'feed',
      label: 'Campus Issue Feed',
      icon: Inbox,
      badge: openIssuesCount > 0 ? `${openIssuesCount}` : undefined,
    },
    {
      id: 'gate-pass',
      label: 'Apply for Gate Pass',
      icon: QrCode,
      badge: gatePassCount !== undefined && gatePassCount > 0 ? `${gatePassCount}` : 'Pass',
      badgeColor: 'bg-burgundy-900 text-latte-50 font-bold',
      isAction: true,
    },
    {
      id: 'my-issues',
      label: 'My Raised Issues',
      icon: BookmarkCheck,
      badge: myIssuesCount > 0 ? `${myIssuesCount}` : undefined,
    },
    {
      id: 'communities',
      label: 'Communities & Committees',
      icon: Users,
    },
    {
      id: 'events',
      label: 'Events & Notices',
      icon: CalendarDays,
    },
    {
      id: 'notifications',
      label: 'Notifications Inbox',
      icon: Bell,
      badge: unreadCount > 0 ? `${unreadCount}` : undefined,
      badgeColor: 'bg-burgundy-700 text-latte-50 shadow-sm',
    },
    {
      id: 'help-safety',
      label: 'Help & 24/7 Helplines',
      icon: LifeBuoy,
      highlight: true,
    },
  ];

  const adminStaffItems = [
    ...(isStaffOrAdmin
      ? [
          {
            id: 'staff-dashboard',
            label: 'Staff Triage Board',
            icon: LayoutDashboard,
            badge: 'Staff',
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            id: 'admin-management',
            label: 'Admin Governance',
            icon: ShieldAlert,
            badge: 'Admin',
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden md:flex flex-col w-64 bg-transparent min-h-[calc(100vh-5rem)] py-2 flex-shrink-0 select-none">
        <div className="space-y-1">
          <div className="px-3 pb-2 pt-1 flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-wider text-mocha-500 uppercase font-mono">
              Main Menu
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (item.id === 'gate-pass') {
                    onApplyGatePass?.();
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-burgundy-900 text-latte-50 shadow-[0_4px_16px_rgba(37,3,9,0.25)]'
                    : item.highlight
                    ? 'text-burgundy-800 hover:bg-burgundy-50/80'
                    : 'text-mocha-800 hover:bg-white hover:text-burgundy-950 hover:shadow-subtle'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-burgundy-950 text-mocha-300'
                        : item.highlight
                        ? 'bg-burgundy-100 text-burgundy-700'
                        : 'bg-mocha-100/80 text-mocha-600 group-hover:text-mocha-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="tracking-tight">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono ${
                      item.badgeColor
                        ? item.badgeColor
                        : isActive
                        ? 'bg-burgundy-950 text-mocha-300'
                        : 'bg-mocha-100 text-mocha-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Staff & Admin Section */}
        {adminStaffItems.length > 0 && (
          <div className="mt-6 pt-4 border-t border-mocha-200/60 space-y-1">
            <div className="px-3 pb-2 flex items-center justify-between">
              <span className="text-[10px] font-extrabold tracking-wider text-mocha-500 uppercase font-mono">
                Management
              </span>
            </div>
            {adminStaffItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-burgundy-900 text-latte-50 shadow-[0_4px_16px_rgba(37,3,9,0.25)]'
                      : 'text-mocha-800 hover:bg-white hover:text-burgundy-950 hover:shadow-subtle'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-burgundy-950 text-mocha-300'
                          : 'bg-mocha-100 text-mocha-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="tracking-tight">{item.label}</span>
                  </div>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isActive
                        ? 'bg-burgundy-950 text-mocha-300'
                        : 'bg-mocha-200 text-mocha-900'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 24/7 Official Helplines Widget at bottom of sidebar */}
        <div className="mt-auto pt-4">
          <div
            onClick={() => onSelectTab('help-safety')}
            className="p-3.5 bg-gradient-to-br from-white to-burgundy-50/40 rounded-2xl border border-burgundy-100/90 shadow-subtle hover:shadow-card transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-burgundy-600 animate-pulse"></span>
                <span className="text-[10px] font-extrabold text-burgundy-900 uppercase tracking-wider font-mono">
                  24/7 Helplines
                </span>
              </div>
              <PhoneCall className="w-3.5 h-3.5 text-burgundy-700 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-xs font-bold text-burgundy-950">
              Anti-Ragging & Tele-MANAS
            </p>
            <p className="text-[11px] text-mocha-700 mt-0.5">
              Toll-free emergency numbers & campus safety.
            </p>
          </div>

          <div className="mt-3 px-3 py-2 flex items-center justify-between text-[11px] text-mocha-500 font-mono">
            <span>v1.0 • Equinox 2026</span>
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Online
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Glassmorphic) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-mocha-200/90 px-2 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(37,3,9,0.06)]">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                if (item.id === 'gate-pass') {
                  onApplyGatePass?.();
                }
              }}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
                isActive ? 'text-burgundy-800 font-extrabold' : 'text-mocha-600 hover:text-mocha-900'
              }`}
            >
              <div
                className={`p-1 rounded-lg mb-0.5 ${
                  isActive ? 'bg-burgundy-50 text-burgundy-700' : 'text-mocha-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate max-w-[64px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
        {isStaffOrAdmin && (
          <button
            onClick={() => onSelectTab('staff-dashboard')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
              activeTab === 'staff-dashboard'
                ? 'text-burgundy-800 font-extrabold'
                : 'text-mocha-600 hover:text-mocha-900'
            }`}
          >
            <div
              className={`p-1 rounded-lg mb-0.5 ${
                activeTab === 'staff-dashboard'
                  ? 'bg-burgundy-50 text-burgundy-700'
                  : 'text-mocha-400'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span>Staff</span>
          </button>
        )}
        <button
          onClick={() => onSelectTab('help-safety')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
            activeTab === 'help-safety'
              ? 'text-burgundy-800 font-extrabold'
              : 'text-burgundy-700 hover:text-burgundy-900'
          }`}
        >
          <div
            className={`p-1 rounded-lg mb-0.5 ${
              activeTab === 'help-safety'
                ? 'bg-burgundy-50 text-burgundy-700'
                : 'text-burgundy-600'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
          </div>
          <span>Safety</span>
        </button>
      </nav>
    </>
  );
};
