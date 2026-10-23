import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { UserProfile, NotificationItem, CampusEvent } from '../types';
import { DEMO_USERS } from '../services/mockData';

interface HeaderProps {
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  notifications: NotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onOpenTicket: (ticketId: string) => void;
  onNavigateTab: (tab: string) => void;
  upcomingEvents: CampusEvent[];
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSelectUser,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onOpenTicket,
  onNavigateTab,
  upcomingEvents,
  onResetDemo,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showEventMenu, setShowEventMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const nextEvent = upcomingEvents[0];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-subtle backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm ring-1 ring-slate-800">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">CampusAccord</span>
              <span className="hidden sm:inline-block text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                AIT Campus
              </span>
            </div>
            <p className="hidden md:block text-xs text-slate-500 font-medium">
              Every concern heard. Every action tracked.
            </p>
          </div>
        </div>

        {/* Right Section: Events, Notifications, Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Reset Button */}
          <button
            onClick={onResetDemo}
            title="Reset Demo Data to Initial State"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo</span>
          </button>

          {/* Upcoming Event Preview Pill */}
          {nextEvent && (
            <div className="relative">
              <button
                onClick={() => setShowEventMenu(!showEventMenu)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100/90 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span className="max-w-[150px] truncate">{nextEvent.title}</span>
                <span className="text-[11px] text-slate-500 font-normal">{nextEvent.dateTime.split(',')[0]}</span>
              </button>

              {showEventMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-elevated border border-slate-200 p-4 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Upcoming Campus Events</h4>
                    <button
                      onClick={() => {
                        setShowEventMenu(false);
                        onNavigateTab('events');
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                      View All <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 3).map((evt) => (
                      <div key={evt.id} className="text-left p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                        <p className="text-xs font-semibold text-slate-900 line-clamp-1">{evt.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{evt.dateTime} • {evt.location}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-elevated border border-slate-200 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-[11px] bg-teal-100 text-teal-800 font-medium px-2 py-0.5 rounded-full">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllNotificationsAsRead}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onMarkNotificationAsRead(item.id);
                          setShowNotifMenu(false);
                          if (item.linkTicketId) {
                            onOpenTicket(item.linkTicketId);
                          } else if (item.linkTab) {
                            onNavigateTab(item.linkTab);
                          }
                        }}
                        className={`p-3.5 text-left cursor-pointer transition-colors hover:bg-slate-50 ${
                          !item.read ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                          {!item.read && <span className="w-2 h-2 rounded-full bg-teal-600 flex-shrink-0 mt-1"></span>}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200/90 hover:bg-slate-100/70 transition-all text-left bg-white"
            >
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
              />
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-900">{currentUser.name}</span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      currentUser.role === 'Admin'
                        ? 'bg-purple-100 text-purple-700'
                        : currentUser.role === 'Campus Staff'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {currentUser.role === 'Campus Staff'
                      ? currentUser.designation
                      : currentUser.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  {currentUser.role === 'Student'
                    ? currentUser.roomNumber
                    : currentUser.email}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Quick Role Switcher Dropdown for Evaluators */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-elevated border border-slate-200 p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Switch Role (Demo)
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      Instant Access
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select a profile to test role-specific workflows:
                  </p>
                </div>

                <div className="space-y-1">
                  {DEMO_USERS.map((user) => {
                    const isSelected = user.uid === currentUser.uid;
                    return (
                      <button
                        key={user.uid}
                        onClick={() => {
                          onSelectUser(user);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-slate-900 text-white'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-7 h-7 rounded-md object-cover"
                          />
                          <div>
                            <p className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                              {user.name}
                            </p>
                            <p className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                              {user.role} {user.designation ? `(${user.designation})` : ''} • {user.roomNumber || 'Admin'}
                            </p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
