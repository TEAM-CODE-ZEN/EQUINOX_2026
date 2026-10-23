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
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserProfile;
  unreadCount: number;
  openIssuesCount: number;
  myIssuesCount: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  unreadCount,
  openIssuesCount,
  myIssuesCount,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const isStaffOrAdmin =
    currentUser.role === 'Campus Staff' || currentUser.role === 'Admin';
  const isAdmin = currentUser.role === 'Admin';

  const isStudent = currentUser.role === 'Student';

  const navItems = isStudent
    ? [
        {
          id: 'overview',
          label: 'Overview',
          shortLabel: 'Overview',
          icon: Layers,
        },
        {
          id: 'my-issues',
          label: 'Track My Issues',
          shortLabel: 'Track Issues',
          icon: BookmarkCheck,
          badge: myIssuesCount > 0 ? `${myIssuesCount}` : undefined,
        },
        {
          id: 'help-safety',
          label: 'Help & 24/7 Helplines',
          shortLabel: 'Helplines',
          icon: LifeBuoy,
          highlight: true,
        },
      ]
    : [
        {
          id: 'overview',
          label: 'Hostel Overview',
          shortLabel: 'Overview',
          icon: Layers,
        },
        {
          id: 'feed',
          label: 'Campus Issue Feed',
          shortLabel: 'Feed',
          icon: Inbox,
          badge: openIssuesCount > 0 ? `${openIssuesCount}` : undefined,
        },
        {
          id: 'my-issues',
          label: 'My Raised Issues',
          shortLabel: 'My Issues',
          icon: BookmarkCheck,
          badge: myIssuesCount > 0 ? `${myIssuesCount}` : undefined,
        },
        {
          id: 'communities',
          label: 'Communities & Wings',
          shortLabel: 'Community',
          icon: Users,
        },
        {
          id: 'events',
          label: 'Events & Notices',
          shortLabel: 'Notices',
          icon: CalendarDays,
        },
        {
          id: 'help-safety',
          label: 'Help & 24/7 Helplines',
          shortLabel: 'Helplines',
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
            shortLabel: 'Staff',
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
            shortLabel: 'Admin',
            icon: ShieldAlert,
            badge: 'Admin',
          },
        ]
      : []),
  ];

  return (
    <>
      {/* ==================================================================== */}
      {/* Desktop Collapsible Left Sidebar (Dark Burgundy Capsule as in Image)  */}
      {/* ==================================================================== */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out select-none relative z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div
          className={`h-full min-h-[calc(100vh-6.5rem)] rounded-[32px] bg-[#134229] text-latte-50 flex flex-col justify-between p-3.5 border border-emerald-800/60 shadow-[0_12px_36px_rgba(19,66,41,0.35)] transition-all`}
        >
          {/* Top Section */}
          <div className="space-y-4">
            {/* Top Header / Quick Action Button */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-2'} pt-1`}>
              {isCollapsed ? (
                <button
                  onClick={onToggleCollapse}
                  title="Expand sidebar"
                  className="w-11 h-11 rounded-2xl bg-burgundy-900/60 hover:bg-burgundy-900 text-mocha-300 hover:text-white flex items-center justify-center border border-burgundy-700/60 transition-all active:scale-95"
                >
                  <Layers className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-burgundy-900 flex items-center justify-center text-mocha-300 border border-burgundy-700/60">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold tracking-wider uppercase text-mocha-300 font-mono">
                      Equinox Portal
                    </span>
                  </div>

                  {onToggleCollapse && (
                    <button
                      onClick={onToggleCollapse}
                      title="Collapse sidebar"
                      className="w-7 h-7 rounded-lg bg-burgundy-950/80 hover:bg-burgundy-900 text-mocha-400 hover:text-latte-50 flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Navigation Items Stack */}
            <nav className="space-y-1.5 pt-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                if (isCollapsed) {
                  return (
                    <div key={item.id} className="relative group flex justify-center">
                      <button
                        onClick={() => onSelectTab(item.id)}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-95 relative ${
                          isActive
                            ? 'bg-white/15 text-white shadow-inner ring-1 ring-white/20'
                            : 'text-mocha-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {/* Status notification dot on collapsed icon */}
                        {item.badge && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#134229]"></span>
                        )}
                      </button>

                      {/* Tooltip on hover */}
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#134229] text-latte-50 text-xs font-semibold rounded-xl shadow-xl border border-emerald-600/50 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-mono font-bold bg-[#16A34A] text-white px-1.5 py-0.2 rounded-md">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 active:scale-95 ${
                      isActive
                        ? 'bg-white/15 text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)] ring-1 ring-white/20'
                        : 'text-mocha-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-burgundy-950/70 text-mocha-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="tracking-tight">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono ${
                          isActive
                            ? 'bg-burgundy-950 text-mocha-200'
                            : 'bg-burgundy-900 text-mocha-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Staff & Admin Section */}
            {adminStaffItems.length > 0 && (
              <div className="pt-3 border-t border-burgundy-900/80 space-y-1.5">
                {!isCollapsed && (
                  <div className="px-3 pb-1">
                    <span className="text-[10px] font-extrabold tracking-wider text-mocha-400 uppercase font-mono">
                      Management
                    </span>
                  </div>
                )}

                {adminStaffItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  if (isCollapsed) {
                    return (
                      <div key={item.id} className="relative group flex justify-center">
                        <button
                          onClick={() => onSelectTab(item.id)}
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
                            isActive
                              ? 'bg-white/15 text-white shadow-inner ring-1 ring-white/20'
                              : 'text-mocha-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </button>

                        {/* Tooltip */}
                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#134229] text-latte-50 text-xs font-semibold rounded-xl shadow-xl border border-emerald-600/50 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 flex items-center gap-2">
                          <span>{item.label}</span>
                          <span className="text-[10px] font-mono font-bold bg-[#16A34A] text-white px-1.5 py-0.2 rounded-md">
                            {item.badge}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 active:scale-95 ${
                        isActive
                          ? 'bg-white/15 text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)] ring-1 ring-white/20'
                          : 'text-mocha-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-burgundy-950/70 text-mocha-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="tracking-tight">{item.label}</span>
                      </div>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-burgundy-900 text-mocha-200">
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Section: Profile Avatar & Collapse Toggle */}
          <div className="pt-4 border-t border-burgundy-900/80 space-y-3">
            {!isCollapsed && (
              <div
                onClick={() => onSelectTab('help-safety')}
                className="p-3 bg-burgundy-950/80 rounded-2xl border border-burgundy-800/60 cursor-pointer group hover:border-burgundy-700 transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-bold text-mocha-200 uppercase tracking-wider font-mono">
                      24/7 Helplines
                    </span>
                  </div>
                  <PhoneCall className="w-3.5 h-3.5 text-mocha-300 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[11px] font-bold text-latte-50">
                  Campus Tele-MANAS
                </p>
                <p className="text-[10px] text-mocha-400 mt-0.5 line-clamp-1">
                  Anti-Ragging & Medical Care
                </p>
              </div>
            )}

            {/* User Profile Avatar Pill / Square */}
            <div
              className={`flex items-center ${
                isCollapsed ? 'flex-col gap-2 justify-center' : 'justify-between px-2'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative group">
                  <div className="w-10 h-10 rounded-full border-2 border-mocha-400/50 p-0.5 bg-burgundy-950 flex items-center justify-center overflow-hidden">
                    <img
                      src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                      alt={currentUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#134229]"></span>

                  {isCollapsed && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#134229] text-latte-50 text-xs font-semibold rounded-xl shadow-xl border border-emerald-600/50 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50">
                      {currentUser.name} ({currentUser.role})
                    </div>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-latte-50 truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-mocha-400 font-mono truncate">
                      {currentUser.role}
                    </p>
                  </div>
                )}
              </div>

              {/* Collapse/Expand Toggle Button */}
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  className="w-8 h-8 rounded-xl bg-burgundy-950 hover:bg-burgundy-900 text-mocha-300 hover:text-white flex items-center justify-center transition-all border border-burgundy-800/60 active:scale-95"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* Mobile Bottom Navigation Bar                                         */}
      {/* ==================================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#134229]/95 backdrop-blur-xl border-t border-emerald-800/80 px-2 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(19,66,41,0.4)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
                isActive ? 'text-latte-50 font-extrabold' : 'text-mocha-400 hover:text-latte-100'
              }`}
            >
              <div
                className={`p-1 rounded-lg mb-0.5 ${
                  isActive ? 'bg-white/15 text-latte-50' : 'text-mocha-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate max-w-[64px]">{item.shortLabel}</span>
            </button>
          );
        })}
        {isStaffOrAdmin && (
          <button
            onClick={() => onSelectTab('staff-dashboard')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
              activeTab === 'staff-dashboard'
                ? 'text-latte-50 font-extrabold'
                : 'text-mocha-400 hover:text-latte-100'
            }`}
          >
            <div
              className={`p-1 rounded-lg mb-0.5 ${
                activeTab === 'staff-dashboard'
                  ? 'bg-white/15 text-latte-50'
                  : 'text-mocha-400'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span>Staff</span>
          </button>
        )}
      </nav>
    </>
  );
};
