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
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserProfile;
  unreadCount: number;
  openIssuesCount: number;
  myIssuesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  unreadCount,
  openIssuesCount,
  myIssuesCount,
}) => {
  const isStaffOrAdmin =
    currentUser.role === 'Campus Staff' || currentUser.role === 'Admin';
  const isAdmin = currentUser.role === 'Admin';

  const navItems = [
    {
      id: 'feed',
      label: 'Home / Issue Feed',
      icon: Inbox,
      badge: openIssuesCount > 0 ? `${openIssuesCount}` : undefined,
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
      label: 'Events & Announcements',
      icon: CalendarDays,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? `${unreadCount}` : undefined,
      badgeColor: 'bg-teal-600 text-white',
    },
    {
      id: 'help-safety',
      label: 'Help & Safety Resources',
      icon: LifeBuoy,
      highlight: true,
    },
  ];

  const adminStaffItems = [
    ...(isStaffOrAdmin
      ? [
          {
            id: 'staff-dashboard',
            label: 'Staff Triage Dashboard',
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
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 bg-white min-h-[calc(100vh-4rem)] p-4 flex-shrink-0">
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
            Campus Portal
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : item.highlight
                    ? 'text-rose-700 hover:bg-rose-50/70'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-teal-400'
                        : item.highlight
                        ? 'text-rose-600'
                        : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.badgeColor
                        ? item.badgeColor
                        : isActive
                        ? 'bg-slate-800 text-slate-200'
                        : 'bg-slate-100 text-slate-600'
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
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-1">
            <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
              Operations & Triage
            </p>
            {adminStaffItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-slate-800 text-teal-300'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* User Card at bottom of sidebar */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></div>
              <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                Campus Status
              </p>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Apex Institute of Technology
            </p>
            <p className="text-[11px] text-slate-400">
              Active Session • Asia/Kolkata
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-elevated">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-slate-900 font-bold' : 'text-slate-500'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
              <span>{item.label.split('/')[0].trim()}</span>
            </button>
          );
        })}
        {isStaffOrAdmin && (
          <button
            onClick={() => onSelectTab('staff-dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'staff-dashboard' ? 'text-slate-900 font-bold' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 mb-0.5 ${activeTab === 'staff-dashboard' ? 'text-teal-600' : 'text-slate-400'}`} />
            <span>Staff</span>
          </button>
        )}
        <button
          onClick={() => onSelectTab('help-safety')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeTab === 'help-safety' ? 'text-rose-700 font-bold' : 'text-rose-500'
          }`}
        >
          <LifeBuoy className="w-5 h-5 mb-0.5 text-rose-500" />
          <span>Safety</span>
        </button>
      </nav>
    </>
  );
};
