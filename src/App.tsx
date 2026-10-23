import React, { useState, useEffect, useRef } from 'react';
import {
  Header,
} from './components/Header';
import {
  Sidebar,
} from './components/Sidebar';
import {
  TicketCard,
} from './components/TicketCard';
import {
  TicketDetailModal,
} from './components/TicketDetailModal';
import {
  RaiseIssueModal,
} from './components/RaiseIssueModal';
import {
  CommunitiesView,
} from './components/CommunitiesView';
import {
  AnnouncementsEventsView,
} from './components/AnnouncementsEventsView';
import {
  StaffDashboard,
} from './components/StaffDashboard';
import {
  HelpSafetyView,
} from './components/HelpSafetyView';
import {
  AdminGovernanceView,
} from './components/AdminGovernanceView';
import {
  ApplyGatePassModal,
} from './components/ApplyGatePassModal';
import {
  GatePassView,
} from './components/GatePassView';
import {
  ExecutiveDashboardView,
} from './components/ExecutiveDashboardView';
import { DEMO_USERS } from './services/mockData';
import {
  Ticket,
  UserProfile,
  TicketStatus,
  TicketPriority,
  Community,
  CommitteeMembership,
  Announcement,
  CampusEvent,
  NotificationItem,
  GatePass,
} from './types';
import { dataStore } from './services/dataStore';
import { firestoreService } from './services/firestoreService';
import { isDemoMode } from './services/firebase';
import {
  Plus,
  Search,
  CheckCircle,
  Inbox,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  Layers,
  Wrench,
  Utensils,
  Shield,
  Wifi,
  PartyPopper,
} from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning';
  message: string;
}

export const App: React.FC = () => {
  // State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    dataStore.getCurrentUser()
  );
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };
  const [tickets, setTickets] = useState<Ticket[]>(() => dataStore.getTickets());
  const [communities, setCommunities] = useState<Community[]>(() =>
    dataStore.getCommunities()
  );
  const [memberships, setMemberships] = useState<CommitteeMembership[]>(() =>
    dataStore.getMemberships()
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    dataStore.getAnnouncements()
  );
  const [events, setEvents] = useState<CampusEvent[]>(() =>
    dataStore.getEvents()
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    dataStore.getNotifications(dataStore.getCurrentUser().uid)
  );
  const [gatePasses, setGatePasses] = useState<GatePass[]>(() =>
    dataStore.getGatePasses()
  );

  // Active Modals
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [showGatePassModal, setShowGatePassModal] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'affected' | 'priority'>('recent');

  // Sonner-style Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-2), { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        if (showRaiseModal) setShowRaiseModal(false);
        if (selectedTicket) setSelectedTicket(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showRaiseModal, selectedTicket]);

  // Real-time Firestore sync when live Firebase is configured
  useEffect(() => {
    if (!isDemoMode) {
      firestoreService.initFirestoreCollections();
      const unsubscribe = firestoreService.subscribeTickets((liveTickets) => {
        if (liveTickets && liveTickets.length > 0) {
          setTickets(liveTickets);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Sync state whenever currentUser changes
  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    dataStore.setCurrentUser(user);
    setNotifications(dataStore.getNotifications(user.uid));
    showToast(`Switched active profile to ${user.name} (${user.role})`, 'info');
  };

  // Refresh data from store
  const refreshData = () => {
    setTickets([...dataStore.getTickets()]);
    setCommunities([...dataStore.getCommunities()]);
    setMemberships([...dataStore.getMemberships()]);
    setAnnouncements([...dataStore.getAnnouncements()]);
    setEvents([...dataStore.getEvents()]);
    setNotifications([...dataStore.getNotifications(currentUser.uid)]);
    setGatePasses([...dataStore.getGatePasses()]);
  };

  // Reset demo
  const handleResetDemo = () => {
    if (confirm('Reset demo data to initial campus state?')) {
      dataStore.resetDemoData();
      refreshData();
      showToast('Demo data reset to default seed state.', 'info');
    }
  };

  // Toggle Endorsement (+1)
  const handleToggleEndorse = (ticketId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const result = dataStore.toggleEndorsement(ticketId, currentUser.uid);
    if (result.success) {
      if (!isDemoMode) {
        firestoreService.toggleEndorsement(ticketId, currentUser.uid, currentUser.name);
      }
      refreshData();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(dataStore.getTicketById(ticketId) || null);
      }
      showToast(
        result.endorsed
          ? 'Endorsed issue (+1 affected count added)'
          : 'Endorsement withdrawn'
      );
    }
  };

  // Ticket Created
  const handleTicketCreated = (newTicket: Ticket) => {
    dataStore.saveTicket(newTicket);
    if (!isDemoMode) {
      firestoreService.saveTicket(newTicket);
    }
    refreshData();
    setSelectedTicket(newTicket);
    showToast(`Ticket ${newTicket.ticketNumber} created successfully!`);
  };

  // Status Update
  const handleUpdateStatus = (
    ticketId: string,
    status: TicketStatus,
    notes?: string
  ) => {
    const ok = dataStore.updateTicketStatus(ticketId, status, currentUser, notes);
    if (ok) {
      if (!isDemoMode) {
        firestoreService.updateTicketStatus(ticketId, status, currentUser, notes);
      }
      refreshData();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(dataStore.getTicketById(ticketId) || null);
      }
      showToast(`Status updated to "${status}"`);
    }
  };

  // Assign Staff
  const handleAssignStaff = (
    ticketId: string,
    staffUid: string,
    staffName: string
  ) => {
    const ok = dataStore.assignTicket(ticketId, staffUid, staffName, currentUser);
    if (ok) {
      if (!isDemoMode) {
        firestoreService.assignTicket(ticketId, staffUid, staffName, currentUser);
      }
      refreshData();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(dataStore.getTicketById(ticketId) || null);
      }
      showToast(`Assigned ticket to ${staffName}`);
    }
  };

  // Reopen Ticket
  const handleReopenTicket = (ticketId: string, reason: string) => {
    const ok = dataStore.updateTicketStatus(
      ticketId,
      'Reopened',
      currentUser,
      `Reopened by ${currentUser.name}. Reason: ${reason}`
    );
    if (ok) {
      refreshData();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(dataStore.getTicketById(ticketId) || null);
      }
      showToast('Ticket marked as Reopened', 'warning');
    }
  };

  // Comments
  const handleAddComment = (
    ticketId: string,
    content: string,
    isInternal: boolean
  ) => {
    const newComment = {
      id: `cmt-${Date.now()}`,
      ticketId,
      authorUid: currentUser.uid,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorDesignation: currentUser.designation,
      content,
      isInternal,
      createdAt: new Date().toISOString(),
    };
    dataStore.addComment(newComment);
    if (!isDemoMode) {
      firestoreService.addComment(newComment);
    }
    refreshData();
    showToast(isInternal ? 'Internal staff note added' : 'Comment posted');
  };

  // Committee Actions
  const handleProposeMembership = (membership: CommitteeMembership) => {
    dataStore.proposeMembership(membership);
    refreshData();
    showToast(`Proposed ${membership.userName} for ${membership.communityName}`);
  };

  const handleReviewMembership = (
    membershipId: string,
    decision: 'Approved' | 'Rejected',
    reason?: string
  ) => {
    dataStore.reviewMembership(membershipId, decision, currentUser, reason);
    refreshData();
    showToast(`Membership ${decision.toLowerCase()}`);
  };

  // Announcements & Events
  const handleAddAnnouncement = (ann: Announcement) => {
    dataStore.addAnnouncement(ann);
    if (!isDemoMode) {
      firestoreService.addAnnouncement(ann);
    }
    refreshData();
    showToast('Campus announcement broadcasted');
  };

  const handleAddEvent = (evt: CampusEvent) => {
    dataStore.addEvent(evt);
    if (!isDemoMode) {
      firestoreService.addEvent(evt);
    }
    refreshData();
    showToast('Campus event added to calendar');
  };

  // Gate Pass Actions
  const handleApplyGatePass = (newPass: GatePass) => {
    dataStore.applyGatePass(newPass);
    refreshData();
    showToast(`Gate Pass #${newPass.passNumber} submitted for Chief Warden review!`, 'success');
    setActiveTab('gate-pass');
  };

  const handleReviewGatePass = (passId: string, status: 'Approved' | 'Rejected', reason?: string) => {
    dataStore.reviewGatePass(passId, status, currentUser, reason);
    refreshData();
    showToast(`Gate Pass marked as ${status}. Student notified.`, status === 'Approved' ? 'success' : 'warning');
  };

  const handleRecordSecurityStatus = (passId: string, action: 'checkout' | 'checkin') => {
    dataStore.recordGatePassSecurity(passId, action);
    refreshData();
    showToast(action === 'checkout' ? 'Security gate exit check-out logged.' : 'Security gate safe return recorded.', 'info');
  };

  // Notification controls
  const handleMarkNotificationAsRead = (id: string) => {
    dataStore.markNotificationAsRead(id);
    setNotifications([...dataStore.getNotifications(currentUser.uid)]);
  };

  const handleMarkAllNotificationsAsRead = () => {
    dataStore.markAllNotificationsAsRead(currentUser.uid);
    setNotifications([...dataStore.getNotifications(currentUser.uid)]);
    showToast('All notifications marked as read', 'info');
  };

  // Calculations for Campus Pulse Hero
  const totalTicketsCount = tickets.length;
  const openCount = tickets.filter((t) => t.status !== 'Resolved').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;
  const resolutionRate = totalTicketsCount > 0 ? Math.round((resolvedCount / totalTicketsCount) * 100) : 0;
  const myIssuesCount = tickets.filter((t) => t.reporterUid === currentUser.uid).length;

  const categoryChips = [
    { label: 'All', icon: Layers },
    { label: 'Maintenance', icon: Wrench },
    { label: 'Mess', icon: Utensils },
    { label: 'Security', icon: Shield },
    { label: 'Internet / Connectivity', icon: Wifi },
    { label: 'Events / Clubs', icon: PartyPopper },
  ];

  const displayedTickets = tickets
    .filter((ticket) => {
      // Sensitive filter
      if (
        ticket.isSensitive &&
        ticket.reporterUid !== currentUser.uid &&
        currentUser.role === 'Student'
      ) {
        return false;
      }

      // My Issues tab filter
      if (activeTab === 'my-issues' && ticket.reporterUid !== currentUser.uid) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'All' && ticket.category !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'All' && ticket.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'All' && ticket.priority !== priorityFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ticket.title.toLowerCase().includes(q);
        const matchesSummary = ticket.summary.toLowerCase().includes(q);
        const matchesLoc = ticket.location.toLowerCase().includes(q);
        const matchesNum = ticket.ticketNumber.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesLoc && !matchesNum) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'affected') {
        return (b.affectedCount || 1) - (a.affectedCount || 1);
      }
      if (sortBy === 'priority') {
        const rank: Record<TicketPriority, number> = {
          Critical: 4,
          High: 3,
          Medium: 2,
          Low: 1,
        };
        return rank[b.priority] - rank[a.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-slate-800 flex flex-col font-sans pb-20 md:pb-6 selection:bg-burgundy-900/20 selection:text-burgundy-950">
      {/* Emil Kowalski / Sonner-Style Stacked Toast System */}
      <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-burgundy-950/95 backdrop-blur-xl text-latte-50 px-4 py-3 rounded-2xl shadow-[0_16px_36px_-6px_rgba(37,3,9,0.4)] border border-burgundy-800/80 flex items-center justify-between gap-3 animate-sonner transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
              {toast.type === 'info' && <Sparkles className="w-4 h-4 text-mocha-300 flex-shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
              <span className="text-xs font-semibold tracking-tight truncate">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-mocha-300 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <Header
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onOpenTicket={(ticketId) => {
          const t = dataStore.getTicketById(ticketId);
          if (t) setSelectedTicket(t);
        }}
        onNavigateTab={(tab) => setActiveTab(tab)}
        upcomingEvents={events}
        onResetDemo={handleResetDemo}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex gap-5 sm:gap-6 pt-5">
        {/* Left Sidebar (Collapsible Dark Burgundy Rail/Panel) */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          currentUser={currentUser}
          unreadCount={notifications.filter((n) => !n.read).length}
          openIssuesCount={openCount}
          myIssuesCount={myIssuesCount}
          onApplyGatePass={() => setShowGatePassModal(true)}
          gatePassCount={gatePasses.filter((g) => g.status === 'Pending Warden Approval' || g.status === 'Approved').length}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Dynamic Main Content Area */}
        <main className="flex-1 min-w-0 pb-12">
          {/* Tab 0: Executive Overview Dashboard (Matching Image UI Layout) */}
          {activeTab === 'overview' && (
            <ExecutiveDashboardView
              tickets={tickets}
              gatePasses={gatePasses}
              currentUser={currentUser}
              onApplyGatePass={() => setShowGatePassModal(true)}
              onReportConcern={() => setShowRaiseModal(true)}
              onSelectTicket={(t) => setSelectedTicket(t)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              openIssuesCount={openCount}
              gatePassCount={gatePasses.filter((g) => g.status === 'Pending Warden Approval' || g.status === 'Approved').length}
              onToggleEndorse={(id, e) => handleToggleEndorse(id, e)}
              onOpenSettings={() => {
                const nextUser = currentUser.role === 'Student'
                  ? DEMO_USERS[1]
                  : currentUser.role === 'Campus Staff'
                  ? DEMO_USERS[2]
                  : DEMO_USERS[0];
                setCurrentUser(nextUser);
                dataStore.setCurrentUser(nextUser);
                showToast(`Switched active profile to ${nextUser.name} (${nextUser.role})`, 'info');
              }}
            />
          )}
          {/* Tab 1 & Tab 2: Issue Feed / My Issues */}
          {(activeTab === 'feed' || activeTab === 'my-issues') && (
            <div className="space-y-4">
              {/* Campus Pulse Hero Statistics Banner */}
              {activeTab === 'feed' && (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#14532D] via-[#16A34A] to-[#22C55E] text-white p-5 sm:p-6 shadow-[0_12px_36px_-6px_rgba(22,163,74,0.35)] border border-emerald-400/40">
                  {/* Subtle Background Glow Elements */}
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-mocha-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-burgundy-500/15 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-burgundy-900/80 border border-burgundy-600/60 text-mocha-200 text-[11px] font-bold tracking-wide uppercase mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-mocha-300" />
                        AI Triage & Facilities Network
                      </div>
                      <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                        Apex Campus Coordination Hub
                      </h1>
                      <p className="text-xs sm:text-sm text-mocha-100/90 mt-1 max-w-xl font-medium leading-relaxed">
                        Automated Gemini issue classification, duplicate clustering, and cross-department resolution workflows.
                      </p>
                    </div>

                    {/* Action Trigger */}
                    <button
                      onClick={() => setShowRaiseModal(true)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-latte-100 hover:bg-white text-burgundy-950 font-extrabold text-xs tracking-tight shadow-[0_4px_20px_rgba(37,3,9,0.35)] transition-all transform active:scale-95 duration-150 self-start md:self-auto"
                    >
                      <Plus className="w-4 h-4 text-burgundy-800 stroke-[2.5]" />
                      <span>Report Concern</span>
                    </button>
                  </div>

                  {/* Real-time KPI Metric Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
                    <div className="bg-burgundy-950/40 backdrop-blur-sm rounded-2xl p-3 border border-burgundy-800/60">
                      <div className="flex items-center gap-1.5 text-mocha-300 text-[11px] font-semibold">
                        <Inbox className="w-3.5 h-3.5 text-mocha-300" />
                        <span>Active Tickets</span>
                      </div>
                      <div className="text-lg sm:text-xl font-extrabold font-mono text-latte-50 mt-0.5">
                        {openCount}
                      </div>
                    </div>

                    <div className="bg-burgundy-950/40 backdrop-blur-sm rounded-2xl p-3 border border-burgundy-800/60">
                      <div className="flex items-center gap-1.5 text-mocha-300 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Resolved</span>
                      </div>
                      <div className="text-lg sm:text-xl font-extrabold font-mono text-emerald-300 mt-0.5">
                        {resolvedCount}
                      </div>
                    </div>

                    <div className="bg-burgundy-950/40 backdrop-blur-sm rounded-2xl p-3 border border-burgundy-800/60">
                      <div className="flex items-center gap-1.5 text-mocha-300 text-[11px] font-semibold">
                        <TrendingUp className="w-3.5 h-3.5 text-mocha-200" />
                        <span>Resolution Rate</span>
                      </div>
                      <div className="text-lg sm:text-xl font-extrabold font-mono text-latte-50 mt-0.5">
                        {resolutionRate}%
                      </div>
                    </div>

                    <div className="bg-burgundy-950/40 backdrop-blur-sm rounded-2xl p-3 border border-burgundy-800/60">
                      <div className="flex items-center gap-1.5 text-mocha-300 text-[11px] font-semibold">
                        <Clock className="w-3.5 h-3.5 text-amber-300" />
                        <span>Avg Triage Time</span>
                      </div>
                      <div className="text-lg sm:text-xl font-extrabold font-mono text-latte-50 mt-0.5">
                        &lt; 2.4h
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Search, Segmented Chips & Filter Controls */}
              <div className="p-4 sm:p-5 bg-white/95 rounded-3xl border border-mocha-200/90 shadow-subtle space-y-3.5">
                {/* Search Bar + Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-mocha-400 absolute left-3.5 top-3" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tickets by title, room, ID, or keywords..."
                      className="w-full pl-10 pr-12 py-2.5 border border-mocha-200/90 rounded-2xl bg-mocha-50/60 focus:bg-white focus:ring-2 focus:ring-burgundy-600/20 focus:border-burgundy-700 transition-all text-xs font-medium placeholder:text-mocha-400 text-slate-800"
                    />
                    <div className="absolute right-3 top-2.5 flex items-center gap-1">
                      {searchQuery ? (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="p-1 text-mocha-400 hover:text-mocha-700 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <kbd className="hidden sm:inline-block font-mono text-[10px] text-mocha-500 bg-mocha-100 border border-mocha-200 px-1.5 py-0.5 rounded">
                          ⌘K
                        </kbd>
                      )}
                    </div>
                  </div>

                  {/* Sort By Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-mocha-500 uppercase tracking-wider font-mono">
                      Sort:
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="py-2 px-3 border border-mocha-200/90 rounded-xl bg-mocha-50 hover:bg-white text-xs font-bold text-mocha-800 cursor-pointer transition-colors"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="affected">Most Endorsed (+1s)</option>
                      <option value="priority">Highest Priority</option>
                    </select>
                  </div>
                </div>

                {/* Segmented Category Chips (Hick's Law) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
                  {categoryChips.map((chip) => {
                    const isSelected = categoryFilter === chip.label;
                    const count =
                      chip.label === 'All'
                        ? tickets.length
                        : tickets.filter((t) => t.category === chip.label).length;
                    const Icon = chip.icon;

                    return (
                      <button
                        key={chip.label}
                        onClick={() => setCategoryFilter(chip.label)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 flex-shrink-0 active:scale-95 ${
                          isSelected
                            ? 'bg-burgundy-900 text-latte-50 shadow-sm'
                            : 'bg-mocha-100/80 hover:bg-mocha-200/70 text-mocha-800'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-mocha-300' : 'text-mocha-500'}`} />
                        <span>{chip.label}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                            isSelected ? 'bg-burgundy-950 text-mocha-200' : 'bg-mocha-200 text-mocha-800'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Secondary Filters: Status & Priority */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-mocha-100 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-mocha-500 uppercase tracking-wider font-mono">
                      Filters:
                    </span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="py-1 px-2.5 border border-mocha-200 rounded-lg bg-mocha-50 text-mocha-800 text-xs font-medium cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Open">Open</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Reopened">Reopened</option>
                    </select>

                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="py-1 px-2.5 border border-mocha-200 rounded-lg bg-mocha-50 text-mocha-800 text-xs font-medium cursor-pointer"
                    >
                      <option value="All">All Priorities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>

                    {(categoryFilter !== 'All' || statusFilter !== 'All' || priorityFilter !== 'All' || searchQuery) && (
                      <button
                        onClick={() => {
                          setCategoryFilter('All');
                          setStatusFilter('All');
                          setPriorityFilter('All');
                          setSearchQuery('');
                        }}
                        className="text-xs font-bold text-burgundy-700 hover:text-burgundy-900 ml-1 transition-colors"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>

                  <span className="text-xs font-bold text-mocha-600 font-mono">
                    Showing {displayedTickets.length} of {tickets.length} tickets
                  </span>
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-3">
                {displayedTickets.length === 0 ? (
                  <div className="p-12 bg-white rounded-3xl border border-mocha-200 text-center space-y-3.5 shadow-subtle">
                    <div className="w-12 h-12 rounded-2xl bg-mocha-100 flex items-center justify-center mx-auto text-mocha-500">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-burgundy-950">
                        No Matching Issues Found
                      </h3>
                      <p className="text-xs text-mocha-700 mt-1 max-w-sm mx-auto">
                        No tickets match your active filter criteria. Try clearing filters or create a new campus report.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setCategoryFilter('All');
                        setStatusFilter('All');
                        setPriorityFilter('All');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 bg-burgundy-900 text-latte-50 rounded-xl text-xs font-bold hover:bg-burgundy-800 transition-colors shadow-sm"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  displayedTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      currentUserUid={currentUser.uid}
                      onSelect={(t) => setSelectedTicket(t)}
                      onToggleEndorse={(id, e) => handleToggleEndorse(id, e)}
                      commentCount={dataStore.getComments(ticket.id).length}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Communities & Committees */}
          {activeTab === 'communities' && (
            <CommunitiesView
              communities={communities}
              memberships={memberships}
              currentUser={currentUser}
              onProposeMembership={handleProposeMembership}
              onReviewMembership={handleReviewMembership}
            />
          )}

          {/* Tab 4: Announcements & Events */}
          {activeTab === 'events' && (
            <AnnouncementsEventsView
              announcements={announcements}
              events={events}
              currentUser={currentUser}
              onAddAnnouncement={handleAddAnnouncement}
              onAddEvent={handleAddEvent}
            />
          )}

          {/* Tab 5: Notifications Center */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl border border-mocha-200/90 shadow-subtle p-5 sm:p-6 space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-mocha-100 pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-burgundy-950 tracking-tight">
                    Notifications Inbox
                  </h2>
                  <p className="text-xs text-mocha-600 font-medium mt-0.5">
                    Real-time activity on your reports, assignments, and campus notices.
                  </p>
                </div>
                {notifications.some((n) => !n.read) && (
                  <button
                    onClick={handleMarkAllNotificationsAsRead}
                    className="text-xs font-bold text-burgundy-800 hover:text-burgundy-950 transition-colors"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>

              <div className="divide-y divide-mocha-100">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-mocha-400 text-xs font-medium">
                    No notifications yet. You are completely up to date!
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        handleMarkNotificationAsRead(notif.id);
                        if (notif.linkTicketId) {
                          const t = dataStore.getTicketById(notif.linkTicketId);
                          if (t) setSelectedTicket(t);
                        } else if (notif.linkTab) {
                          setActiveTab(notif.linkTab);
                        }
                      }}
                      className={`py-3.5 px-3.5 rounded-2xl cursor-pointer hover:bg-latte-50/70 transition-colors flex items-start justify-between gap-3 ${
                        !notif.read ? 'bg-burgundy-50/40' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-burgundy-950">
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-burgundy-600 shadow-sm"></span>
                          )}
                        </div>
                        <p className="text-xs text-mocha-700 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-mocha-400 mt-1.5 block font-mono">
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 6: Help & Safety */}
          {activeTab === 'help-safety' && <HelpSafetyView />}

          {/* Tab 7: Staff Dashboard */}
          {activeTab === 'staff-dashboard' && (
            <StaffDashboard
              tickets={tickets}
              currentUser={currentUser}
              onOpenTicket={(t) => setSelectedTicket(t)}
              onUpdateStatus={(id, status, notes) =>
                handleUpdateStatus(id, status, notes)
              }
              onAssignStaff={(id, sUid, sName) =>
                handleAssignStaff(id, sUid, sName)
              }
            />
          )}

          {/* Tab 8: Admin Governance */}
          {activeTab === 'admin-management' && (
            <AdminGovernanceView currentUser={currentUser} />
          )}

          {/* Tab 9: Gate Pass Clearance */}
          {activeTab === 'gate-pass' && (
            <GatePassView
              gatePasses={gatePasses}
              currentUser={currentUser}
              onOpenApplyModal={() => setShowGatePassModal(true)}
              onReviewGatePass={handleReviewGatePass}
              onRecordSecurityStatus={handleRecordSecurityStatus}
            />
          )}
        </main>
      </div>

      {/* Floating Prominent "Raise Issue" Action Button (Bottom Right) */}
      <div className="fixed bottom-20 md:bottom-8 right-6 z-40">
        <button
          onClick={() => setShowRaiseModal(true)}
          className="flex items-center gap-2 px-5 py-3.5 bg-[#16A34A] hover:bg-[#22C55E] text-white rounded-2xl shadow-[0_12px_28px_rgba(22,163,74,0.35)] hover:shadow-[0_16px_36px_rgba(22,163,74,0.45)] font-bold text-xs tracking-wide transition-all transform hover:-translate-y-1 active:scale-95 ring-2 ring-emerald-300/40"
        >
          <div className="w-5 h-5 rounded-lg bg-emerald-950/50 flex items-center justify-center">
            <Plus className="w-4 h-4 text-emerald-200 stroke-[2.5]" />
          </div>
          <span>Raise Campus Concern</span>
        </button>
      </div>

      {/* Raise Issue Modal */}
      {showRaiseModal && (
        <RaiseIssueModal
          onClose={() => setShowRaiseModal(false)}
          currentUser={currentUser}
          activeTickets={tickets}
          onTicketCreated={handleTicketCreated}
          onEndorseExisting={(existingId) => {
            handleToggleEndorse(existingId);
            const t = dataStore.getTicketById(existingId);
            if (t) setSelectedTicket(t);
          }}
        />
      )}

      {/* Apply Gate Pass Modal */}
      {showGatePassModal && (
        <ApplyGatePassModal
          currentUser={currentUser}
          onClose={() => setShowGatePassModal(false)}
          onSubmitGatePass={handleApplyGatePass}
        />
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          currentUser={currentUser}
          comments={dataStore.getComments(selectedTicket.id)}
          history={dataStore.getHistory(selectedTicket.id)}
          onAddComment={(content, isInternal) =>
            handleAddComment(selectedTicket.id, content, isInternal)
          }
          onUpdateStatus={(status, resolutionNotes) =>
            handleUpdateStatus(selectedTicket.id, status, resolutionNotes)
          }
          onAssignStaff={(staffUid, staffName) =>
            handleAssignStaff(selectedTicket.id, staffUid, staffName)
          }
          onToggleEndorse={(id) => handleToggleEndorse(id)}
          onReopenTicket={(reason) => handleReopenTicket(selectedTicket.id, reason)}
        />
      )}
    </div>
  );
};
export default App;
