import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  Layers,
  LogOut,
} from 'lucide-react';
import { UserProfile, NotificationItem } from '../types';
import { DEMO_USERS } from '../services/mockData';
import { isDemoMode } from '../services/firebase';

import { CampusAccordEmblem } from './CampusAccordLogo';

interface HeaderProps {
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  notifications: NotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onOpenTicket: (ticketId: string) => void;
  onNavigateTab: (tab: string) => void;
  onResetDemo: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSelectUser,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onOpenTicket,
  onNavigateTab,
  onResetDemo,
  onLogout,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6EE]/90 backdrop-blur-xl border-b border-mocha-200/80 shadow-[0_1px_3px_0_rgba(61,6,16,0.03)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Tagline with light green & white theme */}
        <div className="flex items-center gap-3.5">
          <div
            className="relative group cursor-pointer"
            onClick={() => onNavigateTab(currentUser.role === 'Student' ? 'overview' : 'staff-dashboard')}
            title="CampusAccord Home"
          >
            <div className="w-10 h-10 sm:w-10.5 sm:h-10.5 rounded-full bg-white border border-emerald-200/90 shadow-[0_4px_14px_rgba(16,185,129,0.18)] ring-1 ring-emerald-500/20 flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_6px_20px_rgba(16,185,129,0.25)] group-hover:border-emerald-300 active:scale-95 overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-50/80 via-white to-emerald-100/50 pointer-events-none" />
              <div className="relative z-10 flex items-center justify-center">
                <CampusAccordEmblem size={38} />
              </div>
            </div>
            <span
              className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs ring-1 ring-emerald-400/30"
              title="CampusAccord Active"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                onClick={() => onNavigateTab(currentUser.role === 'Student' ? 'overview' : 'staff-dashboard')}
                className="font-extrabold text-[17px] sm:text-[18px] text-emerald-950 tracking-tight font-sans cursor-pointer hover:opacity-90 transition-opacity"
              >
                Campus<span className="text-emerald-600">Accord</span>
              </span>
              <button
                onClick={() => onNavigateTab(currentUser.role === 'Admin' ? 'admin-management' : 'staff-dashboard')}
                title="Click to view Cloud APIs, Firebase Firestore & AI Engine status"
                className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-xs transition-all cursor-pointer active:scale-95 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200/90"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>{isDemoMode ? 'Sandbox Resilient' : 'Live Cloud & AI'}</span>
              </button>
            </div>
            <p className="hidden md:block text-[11px] text-emerald-900/70 font-medium tracking-normal -mt-0.5">
              Every concern heard. Every action tracked.
            </p>
          </div>
        </div>

        {/* Right Section: Notifications, Reset & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Cloud Database Sync & Health Check */}
          <button
            onClick={onResetDemo}
            title="Sync with Cloud Firestore Database and verify connectivity"
            className="group hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all duration-200 border border-emerald-200 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-700 group-hover:rotate-180 transition-transform duration-500" />
            <span>Sync Cloud DB</span>
          </button>

          {/* Notifications Dropdown with Sonner-style design */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2.5 text-mocha-800 hover:text-burgundy-950 bg-mocha-50 hover:bg-mocha-100 rounded-xl transition-all border border-mocha-200/90 shadow-subtle active:scale-95"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-burgundy-700 text-[10px] font-extrabold text-latte-50 ring-2 ring-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_20px_40px_-8px_rgba(37,3,9,0.18)] border border-mocha-200/90 z-50 overflow-hidden animate-sonner">
                <div className="flex items-center justify-between px-4 py-3 bg-mocha-50/90 border-b border-mocha-100">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-burgundy-950 uppercase tracking-wider">
                      Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-burgundy-100 text-burgundy-900 font-extrabold px-2 py-0.5 rounded-full border border-burgundy-200/70">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllNotificationsAsRead}
                      className="text-xs text-burgundy-700 hover:text-burgundy-900 font-bold transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-mocha-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-mocha-500 text-xs font-medium">
                      All caught up! No unread notifications.
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
                        className={`p-3.5 text-left cursor-pointer transition-all hover:bg-mocha-50/60 ${
                          !item.read ? 'bg-burgundy-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-burgundy-950">{item.title}</p>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-burgundy-600 flex-shrink-0 mt-1 shadow-sm"></span>
                          )}
                        </div>
                        <p className="text-xs text-mocha-800 mt-1 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                        <span className="text-[10px] text-mocha-500 mt-1.5 block font-mono">
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Demo Role Switcher (Apple-grade tactile pill) */}
          <div className="relative" ref={roleMenuRef}>
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-mocha-200/90 hover:border-mocha-300 bg-white hover:bg-mocha-50 shadow-subtle transition-all duration-200 text-left active:scale-95"
            >
              <img
                src={
                  currentUser.avatarUrl ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                }
                alt={currentUser.name}
                className="w-8 h-8 rounded-xl object-cover ring-1 ring-mocha-200 shadow-sm"
              />
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-burgundy-950">{currentUser.name}</span>
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${
                      currentUser.role === 'Admin'
                        ? 'bg-burgundy-100 text-burgundy-900 border border-burgundy-200/70'
                        : currentUser.role === 'Campus Staff'
                        ? 'bg-mocha-200 text-mocha-900 border border-mocha-300/70'
                        : 'bg-latte-200 text-mocha-900 border border-latte-300'
                    }`}
                  >
                    {currentUser.role === 'Campus Staff'
                      ? currentUser.designation
                      : currentUser.role}
                  </span>
                </div>
                <p className="text-[11px] text-mocha-700 font-medium">
                  {currentUser.role === 'Student'
                    ? currentUser.roomNumber
                    : currentUser.email}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-mocha-400 ml-0.5" />
            </button>

            {/* Quick Role Switcher Dropdown */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-76 bg-white rounded-2xl shadow-[0_20px_40px_-8px_rgba(37,3,9,0.18)] border border-mocha-200/90 p-2 z-50 animate-sonner">
                <div className="px-3 py-2.5 border-b border-mocha-100 mb-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-burgundy-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-burgundy-700" />
                      Role Switcher
                    </span>
                    <span className="text-[10px] bg-burgundy-50 text-burgundy-800 font-extrabold px-2 py-0.5 rounded-full border border-burgundy-200/60">
                      1-Tap Switch
                    </span>
                  </div>
                  <p className="text-[11px] text-mocha-700 mt-1 leading-snug">
                    Seamlessly test workflows for different campus personas:
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
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all duration-150 ${
                          isSelected
                            ? 'bg-burgundy-900 text-latte-50 shadow-md'
                            : 'hover:bg-mocha-50 text-mocha-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-mocha-200"
                          />
                          <div>
                            <p
                              className={`font-bold ${
                                isSelected ? 'text-latte-50' : 'text-burgundy-950'
                              }`}
                            >
                              {user.name}
                            </p>
                            <p
                              className={`text-[10px] font-medium ${
                                isSelected ? 'text-mocha-200' : 'text-mocha-600'
                              }`}
                            >
                              {user.role} {user.designation ? `• ${user.designation}` : ''} •{' '}
                              {user.roomNumber || 'Admin'}
                            </p>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-mocha-300" />}
                      </button>
                    );
                  })}
                </div>

                {onLogout && (
                  <div className="pt-2 border-t border-mocha-100 mt-1.5 px-1">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
