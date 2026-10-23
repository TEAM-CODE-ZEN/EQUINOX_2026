import React, { useState } from 'react';
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
  Ticket,
  UserProfile,
  TicketStatus,
  TicketPriority,
  Community,
  CommitteeMembership,
  Announcement,
  CampusEvent,
  NotificationItem,
} from './types';
import { dataStore } from './services/dataStore';
import {
  Plus,
  Search,
  CheckCircle,
  Inbox,
} from 'lucide-react';

export const App: React.FC = () => {
  // State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    dataStore.getCurrentUser()
  );
  const [activeTab, setActiveTab] = useState<string>('feed');
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

  // Active Modals
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showRaiseModal, setShowRaiseModal] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'affected' | 'priority'>('recent');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state whenever currentUser changes
  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    dataStore.setCurrentUser(user);
    setNotifications(dataStore.getNotifications(user.uid));
    showToast(`Switched active profile to ${user.name} (${user.role})`);
  };

  // Refresh data from store
  const refreshData = () => {
    setTickets([...dataStore.getTickets()]);
    setCommunities([...dataStore.getCommunities()]);
    setMemberships([...dataStore.getMemberships()]);
    setAnnouncements([...dataStore.getAnnouncements()]);
    setEvents([...dataStore.getEvents()]);
    setNotifications([...dataStore.getNotifications(currentUser.uid)]);
  };

  // Reset demo
  const handleResetDemo = () => {
    if (confirm('Reset demo data to initial campus state?')) {
      dataStore.resetDemoData();
      refreshData();
      showToast('Demo data reset to default seed state.');
    }
  };

  // Toggle Endorsement (+1)
  const handleToggleEndorse = (ticketId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const result = dataStore.toggleEndorsement(ticketId, currentUser.uid);
    if (result.success) {
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
      showToast('Ticket marked as Reopened');
    }
  };

  // Comments
  const handleAddComment = (
    ticketId: string,
    content: string,
    isInternal: boolean
  ) => {
    dataStore.addComment({
      id: `cmt-${Date.now()}`,
      ticketId,
      authorUid: currentUser.uid,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorDesignation: currentUser.designation,
      content,
      isInternal,
      createdAt: new Date().toISOString(),
    });
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
    refreshData();
    showToast('Campus announcement broadcasted');
  };

  const handleAddEvent = (evt: CampusEvent) => {
    dataStore.addEvent(evt);
    refreshData();
    showToast('Campus event added to calendar');
  };

  // Notification controls
  const handleMarkNotificationAsRead = (id: string) => {
    dataStore.markNotificationAsRead(id);
    setNotifications([...dataStore.getNotifications(currentUser.uid)]);
  };

  const handleMarkAllNotificationsAsRead = () => {
    dataStore.markAllNotificationsAsRead(currentUser.uid);
    setNotifications([...dataStore.getNotifications(currentUser.uid)]);
    showToast('All notifications marked as read');
  };

  // Filtered & Sorted Tickets
  const openCount = tickets.filter((t) => t.status !== 'Resolved').length;
  const myIssuesCount = tickets.filter(
    (t) => t.reporterUid === currentUser.uid
  ).length;

  const displayedTickets = tickets
    .filter((ticket) => {
      // Sensitive filter: if sensitive, show ONLY if reporter is current user OR current user is staff/admin
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
      // default: recent
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans pb-16 md:pb-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-elevated border border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex gap-6 py-6">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          currentUser={currentUser}
          unreadCount={notifications.filter((n) => !n.read).length}
          openIssuesCount={openCount}
          myIssuesCount={myIssuesCount}
        />

        {/* Dynamic Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Tab 1 & Tab 2: Issue Feed / My Issues */}
          {(activeTab === 'feed' || activeTab === 'my-issues') && (
            <div className="space-y-4">
              {/* Header Title & Quick Search Bar */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-lg font-bold text-slate-900">
                      {activeTab === 'my-issues'
                        ? 'My Raised Issues'
                        : 'Campus Issue Feed'}
                    </h1>
                    <p className="text-xs text-slate-500">
                      {activeTab === 'my-issues'
                        ? 'Track progress and status updates on your submitted complaints.'
                        : 'Verified student reports, shared facility problems, and maintenance requests.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {displayedTickets.length} Issues Shown
                    </span>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                  {/* Search */}
                  <div className="sm:col-span-3 relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search ticket #, title, or room..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/80 focus:bg-white focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="sm:col-span-3">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full py-2 px-2.5 border border-slate-200 rounded-xl bg-slate-50/80 focus:bg-white"
                    >
                      <option value="All">All Categories</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Mess">Mess & Dining</option>
                      <option value="Security">Security</option>
                      <option value="Internet / Connectivity">Internet / Wi-Fi</option>
                      <option value="Events / Clubs">Events & Clubs</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="sm:col-span-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full py-2 px-2.5 border border-slate-200 rounded-xl bg-slate-50/80 focus:bg-white"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Open">Open</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Reopened">Reopened</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div className="sm:col-span-2">
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full py-2 px-2.5 border border-slate-200 rounded-xl bg-slate-50/80 focus:bg-white"
                    >
                      <option value="All">All Priorities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="sm:col-span-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full py-2 px-2.5 border border-slate-200 rounded-xl bg-slate-50/80 focus:bg-white"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="affected">Most +1s</option>
                      <option value="priority">Priority</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-3">
                {displayedTickets.length === 0 ? (
                  <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
                    <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        No Matching Issues Found
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Try adjusting your search criteria or raise a new concern.
                      </p>
                    </div>
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-5 space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Notifications Inbox
                  </h2>
                  <p className="text-xs text-slate-500">
                    Updates on ticket assignments, status changes, and campus notices.
                  </p>
                </div>
                {notifications.some((n) => !n.read) && (
                  <button
                    onClick={handleMarkAllNotificationsAsRead}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">
                    No notifications
                  </p>
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
                      className={`py-3.5 px-3 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 ${
                        !notif.read ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
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
        </main>
      </div>

      {/* Floating Prominent "Raise Issue" Action Button (Bottom Right) */}
      <div className="fixed bottom-16 md:bottom-6 right-6 z-40">
        <button
          onClick={() => setShowRaiseModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-elevated hover:shadow-xl font-bold text-xs tracking-wide transition-all transform hover:-translate-y-0.5 ring-2 ring-slate-700/50"
        >
          <Plus className="w-4 h-4 text-teal-400" />
          <span>Raise Issue</span>
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
