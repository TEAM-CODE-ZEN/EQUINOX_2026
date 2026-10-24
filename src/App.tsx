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
  StaffDashboard,
} from './components/StaffDashboard';
import {
  HelpSafetyView,
} from './components/HelpSafetyView';
import {
  AdminGovernanceView,
} from './components/AdminGovernanceView';
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
  NotificationItem,
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
  const [activeTab, setActiveTab] = useState<string>(() => {
    const user = dataStore.getCurrentUser();
    return user.role === 'Student' ? 'overview' : 'staff-dashboard';
  });
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
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    dataStore.getNotifications(dataStore.getCurrentUser().uid)
  );
  // Active Modals
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showRaiseModal, setShowRaiseModal] = useState(false);

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
    // Purge lingering demo tickets in production mode
    dataStore.purgeDemoTickets();
    refreshData();

    if (!isDemoMode) {
      firestoreService.initFirestoreCollections();
      firestoreService.purgeDemoTicketsFromFirestore();
      const unsubscribe = firestoreService.subscribeTickets((liveTickets) => {
        if (liveTickets) {
          setTickets(liveTickets);
          dataStore.setTickets(liveTickets);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Redirect admin/staff away from student-only help-safety tab
  useEffect(() => {
    if (currentUser.role !== 'Student' && activeTab === 'help-safety') {
      setActiveTab('staff-dashboard');
    }
  }, [currentUser.role, activeTab]);

  // Sync state whenever currentUser changes
  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    dataStore.setCurrentUser(user);
    setNotifications(dataStore.getNotifications(user.uid));
    if (user.role === 'Student') {
      setActiveTab('overview');
    } else {
      setActiveTab('staff-dashboard');
    }
    showToast(`Switched active profile to ${user.name} (${user.role})`, 'info');
  };

  // Refresh data from store
  const refreshData = () => {
    setTickets([...dataStore.getTickets()]);
    setCommunities([...dataStore.getCommunities()]);
    setMemberships([...dataStore.getMemberships()]);
    setNotifications([...dataStore.getNotifications(currentUser.uid)]);
  };

  // Production DB Sync
  const handleSyncCloudDb = async () => {
    if (!isDemoMode) {
      showToast('Pinging Cloud Firestore...', 'info');
      const test = await firestoreService.testConnection();
      if (test.success) {
        showToast(test.message, 'success');
      } else {
        showToast(test.message, 'warning');
      }
    } else {
      dataStore.purgeDemoTickets();
      refreshData();
      showToast('Production database active (clean ticket ledger).', 'info');
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

  // Full ticket update (used by AI Investigator, Root Cause & Verification)
  const handleUpdateFullTicket = (updatedTicket: Ticket) => {
    dataStore.saveTicket(updatedTicket);
    if (!isDemoMode) {
      firestoreService.saveTicket(updatedTicket);
    }
    // Log AI action in history if investigation was run
    if (updatedTicket.investigation?.report && !selectedTicket?.investigation?.report) {
      dataStore.addHistoryEvent({
        id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ticketId: updatedTicket.id,
        eventType: 'INVESTIGATION_RUN',
        actorUid: 'ai-system',
        actorName: 'AI',
        description: `AI Investigation conducted. Department: ${updatedTicket.investigation.report.suggested_department}`,
        timestamp: new Date().toISOString(),
      });
    }
    // Log AI action if priority was updated by AI
    if (selectedTicket && updatedTicket.priority !== selectedTicket.priority) {
      dataStore.addHistoryEvent({
        id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ticketId: updatedTicket.id,
        eventType: 'STATUS_CHANGED',
        actorUid: 'ai-system',
        actorName: 'AI',
        description: `Priority updated to ${updatedTicket.priority} based on AI investigation`,
        previousValue: selectedTicket.priority,
        newValue: updatedTicket.priority,
        timestamp: new Date().toISOString(),
      });
      showToast(`Priority updated to ${updatedTicket.priority} by AI`, 'info');
    }
    refreshData();
    setSelectedTicket(updatedTicket);
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
      if (activeTab === 'my-issues') {
        if (ticket.reporterUid !== currentUser.uid) return false;
        if (statusFilter === 'In Progress' && ticket.status === 'Resolved') return false;
        if (statusFilter === 'Resolved' && ticket.status !== 'Resolved') return false;
      }

      // Feed tab filters
      if (activeTab === 'feed') {
        if (categoryFilter !== 'All' && ticket.category !== categoryFilter) {
          return false;
        }

        if (statusFilter !== 'All' && ticket.status !== statusFilter) {
          return false;
        }

        if (priorityFilter !== 'All' && ticket.priority !== priorityFilter) {
          return false;
        }
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
        onResetDemo={handleSyncCloudDb}
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
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          onRaiseIssue={() => setShowRaiseModal(true)}
        />

        {/* Dynamic Main Content Area */}
        <main className="flex-1 min-w-0 pb-12">
          {/* Tab 0: Overview Dashboard (Student Minimal View or Staff Operations Hub) */}
          {activeTab === 'overview' && (
            currentUser.role === 'Student' ? (
              <ExecutiveDashboardView
                tickets={tickets}
                currentUser={currentUser}
                onReportConcern={() => setShowRaiseModal(true)}
                onSelectTicket={(t) => setSelectedTicket(t)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                openIssuesCount={openCount}
                onToggleEndorse={(id, e) => handleToggleEndorse(id, e)}
                onOpenSettings={() => {
                  const nextUser = DEMO_USERS[1];
                  handleSelectUser(nextUser);
                }}
              />
            ) : (
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
            )
          )}
          {/* Tab 1: Campus Issue Feed (Staff / Admin full feed) */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              {/* Campus Pulse Hero Statistics Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#14532D] via-[#16A34A] to-[#22C55E] text-white p-5 sm:p-6 shadow-[0_12px_36px_-6px_rgba(22,163,74,0.35)] border border-emerald-400/40">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-burgundy-900/80 border border-burgundy-600/60 text-mocha-200 text-[11px] font-bold tracking-wide uppercase mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-mocha-300" />
                      Hostel Triage Network
                    </div>
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                      Campus Coordination Hub
                    </h1>
                  </div>
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-3">
                {displayedTickets.length === 0 ? (
                  <div className="p-12 bg-white rounded-3xl border border-mocha-200/90 text-center space-y-3 shadow-subtle">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200/60">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-extrabold text-burgundy-950">
                      No Campus Issues Active
                    </h3>
                    <p className="text-xs text-mocha-600 max-w-sm mx-auto leading-relaxed">
                      All campus blocks, facilities, mess halls, and IT networks are currently operating normally without any open complaints.
                    </p>
                    {currentUser.role === 'Student' && (
                      <button
                        onClick={() => setShowRaiseModal(true)}
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-extrabold rounded-xl shadow-sm transition-all active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Report First Incident</span>
                      </button>
                    )}
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

          {/* Tab 2: Track My Issues (Students Only) */}
          {activeTab === 'my-issues' && currentUser.role === 'Student' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {/* Header */}
              <div className="bg-white p-5 rounded-3xl border border-mocha-200/90 shadow-subtle">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                  Track My Issues
                </h1>
                <p className="text-xs text-mocha-600 mt-0.5">
                  Complaints and concerns reported by you • Room {currentUser.roomNumber || '304'}
                </p>
              </div>

              {/* Minimal Search & 3 Clean Status Pills */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-mocha-200/90 shadow-subtle">
                {/* 3 Status Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setStatusFilter('All')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      statusFilter === 'All'
                        ? 'bg-[#16A34A] text-white shadow-sm'
                        : 'bg-mocha-100/80 text-mocha-800 hover:bg-mocha-200/70'
                    }`}
                  >
                    All ({tickets.filter((t) => t.reporterUid === currentUser.uid).length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('In Progress')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      statusFilter === 'In Progress'
                        ? 'bg-[#16A34A] text-white shadow-sm'
                        : 'bg-mocha-100/80 text-mocha-800 hover:bg-mocha-200/70'
                    }`}
                  >
                    Active ({tickets.filter((t) => t.reporterUid === currentUser.uid && t.status !== 'Resolved').length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('Resolved')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      statusFilter === 'Resolved'
                        ? 'bg-[#16A34A] text-white shadow-sm'
                        : 'bg-mocha-100/80 text-mocha-800 hover:bg-mocha-200/70'
                    }`}
                  >
                    Solved ({tickets.filter((t) => t.reporterUid === currentUser.uid && t.status === 'Resolved').length})
                  </button>
                </div>

                {/* Clean Search Input */}
                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-mocha-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search my issues..."
                    className="w-full pl-9 pr-8 py-1.5 border border-mocha-200 rounded-xl bg-mocha-50/60 focus:bg-white text-xs font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-mocha-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-mocha-400 hover:text-mocha-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-3">
                {displayedTickets.length === 0 ? (
                  <div className="p-10 bg-white rounded-3xl border border-mocha-200 text-center space-y-3 shadow-subtle">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">
                      No Issues Found
                    </h3>
                    <p className="text-xs text-mocha-600 max-w-sm mx-auto">
                      {searchQuery
                        ? 'No complaints match your search query.'
                        : 'You do not have any issues in this category.'}
                    </p>
                    <button
                      onClick={() => setShowRaiseModal(true)}
                      className="px-4 py-2 bg-[#16A34A] text-white rounded-xl text-xs font-bold hover:bg-[#22C55E] transition-colors shadow-sm"
                    >
                      Report a Problem
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
              tickets={tickets}
              onOpenTicket={(t) => setSelectedTicket(t)}
              onProposeMembership={handleProposeMembership}
              onReviewMembership={handleReviewMembership}
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

          {/* Tab 6: Help & Safety (Students Only) */}
          {activeTab === 'help-safety' && currentUser.role === 'Student' && <HelpSafetyView />}

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
        </main>
      </div>

      {/* Raise Issue Modal (Students Only) */}
      {showRaiseModal && currentUser.role === 'Student' && (
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
          allTickets={tickets}
          onUpdateTicket={handleUpdateFullTicket}
          onSelectSimilarTicket={(simId) => {
            const t = dataStore.getTicketById(simId);
            if (t) setSelectedTicket(t);
          }}
        />
      )}
    </div>
  );
};
export default App;
