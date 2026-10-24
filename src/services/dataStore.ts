import {
  Ticket,
  TicketComment,
  TicketHistoryEvent,
  Community,
  CommitteeMembership,
  NotificationItem,
  UserProfile,
  TicketStatus,
} from '../types';
import {
  DEMO_USERS,
  DEMO_COMMUNITIES,
  INITIAL_DEMO_TICKETS,
  INITIAL_MEMBERSHIPS,
  INITIAL_NOTIFICATIONS,
} from './mockData';

const STORAGE_KEYS = {
  CURRENT_USER: 'campusaccord_current_user',
  TICKETS: 'campusaccord_tickets',
  COMMENTS: 'campusaccord_comments',
  HISTORY: 'campusaccord_history',
  COMMUNITIES: 'campusaccord_communities_v5',
  MEMBERSHIPS: 'campusaccord_memberships',
  NOTIFICATIONS: 'campusaccord_notifications',
};

const PRODUCTION_CLEAN_KEY = 'campusaccord_production_clean';

export const isProductionClean = (): boolean => {
  if (typeof window !== 'undefined') {
    const val = localStorage.getItem(PRODUCTION_CLEAN_KEY);
    if (val !== null) return val === 'true';
  }
  return true; // Default to true for clean production database
};

export const setProductionClean = (clean: boolean): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PRODUCTION_CLEAN_KEY, String(clean));
  }
};

// Initial comments for demo tickets
const INITIAL_COMMENTS: TicketComment[] = [
  {
    id: 'cmt-1',
    ticketId: 'tkt-1041',
    authorUid: 'user-staff-maint-1',
    authorName: 'Rajesh Kumar',
    authorRole: 'Campus Staff',
    authorDesignation: 'Maintenance Worker',
    content: 'Inspected the cooler unit at 02:30 PM. The internal condenser fan is seized and the overflow drain hose is cracked. Sourcing replacement pipe from central store.',
    isInternal: false,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'cmt-2',
    ticketId: 'tkt-1041',
    authorUid: 'user-warden-1',
    authorName: 'Dr. Radhika Iyer',
    authorRole: 'Campus Staff',
    authorDesignation: 'Warden',
    content: 'Internal Note: Spoke with plumber supervisor to expedite replacement before evening study hours.',
    isInternal: true,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'cmt-3',
    ticketId: 'tkt-1042',
    authorUid: 'user-warden-1',
    authorName: 'Dr. Radhika Iyer',
    authorRole: 'Campus Staff',
    authorDesignation: 'Warden',
    content: 'Issued warning note to catering contractor. Surprise inspection scheduled for today dinner service.',
    isInternal: false,
    createdAt: new Date(Date.now() - 11 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_HISTORY: TicketHistoryEvent[] = [
  {
    id: 'hist-1',
    ticketId: 'tkt-1041',
    eventType: 'CREATED',
    actorUid: 'user-student-2',
    actorName: 'Karan Mehra',
    description: 'Ticket created with priority High',
    timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
  {
    id: 'hist-2',
    ticketId: 'tkt-1041',
    eventType: 'ASSIGNED',
    actorUid: 'user-admin-1',
    actorName: 'System Admin',
    description: 'Assigned to Rajesh Kumar (Maintenance Worker)',
    previousValue: 'Unassigned',
    newValue: 'Rajesh Kumar',
    timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: 'hist-3',
    ticketId: 'tkt-1041',
    eventType: 'STATUS_CHANGED',
    actorUid: 'user-staff-maint-1',
    actorName: 'Rajesh Kumar',
    description: 'Status changed from Assigned to In Progress',
    previousValue: 'Assigned',
    newValue: 'In Progress',
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
];

class DataStoreService {
  private getStorage<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  // Current logged in user
  getCurrentUser(): UserProfile {
    const user = this.getStorage<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (user) return user;
    // Default to Aarav Sharma (Student) for instant demo
    const defaultUser = DEMO_USERS[0];
    this.setCurrentUser(defaultUser);
    return defaultUser;
  }

  setCurrentUser(user: UserProfile): void {
    this.setStorage(STORAGE_KEYS.CURRENT_USER, user);
  }

  getAllUsers(): UserProfile[] {
    return DEMO_USERS;
  }

  // Tickets
  getTickets(): Ticket[] {
    const cleanMode = isProductionClean();
    const stored = this.getStorage<Ticket[] | null>(STORAGE_KEYS.TICKETS, null);

    if (cleanMode) {
      if (!stored) return [];
      // Filter out any mock dummy ticket IDs (tkt-1041 to tkt-1052)
      const demoIds = new Set(INITIAL_DEMO_TICKETS.map((t) => t.id));
      const realOnly = stored.filter((t) => !demoIds.has(t.id));
      if (realOnly.length !== stored.length) {
        this.setStorage(STORAGE_KEYS.TICKETS, realOnly);
      }
      return realOnly;
    }

    return stored || INITIAL_DEMO_TICKETS;
  }

  setTickets(tickets: Ticket[]): void {
    if (isProductionClean()) {
      const demoIds = new Set(INITIAL_DEMO_TICKETS.map((t) => t.id));
      const realOnly = tickets.filter((t) => !demoIds.has(t.id));
      this.setStorage(STORAGE_KEYS.TICKETS, realOnly);
    } else {
      this.setStorage(STORAGE_KEYS.TICKETS, tickets);
    }
  }

  purgeDemoTickets(): void {
    const demoIds = new Set(INITIAL_DEMO_TICKETS.map((t) => t.id));
    const current = this.getStorage<Ticket[]>(STORAGE_KEYS.TICKETS, []);
    const realOnly = current.filter((t) => !demoIds.has(t.id));
    this.setStorage(STORAGE_KEYS.TICKETS, realOnly);
    setProductionClean(true);
  }

  getTicketById(id: string): Ticket | undefined {
    return this.getTickets().find((t) => t.id === id);
  }

  saveTicket(ticket: Ticket): void {
    const tickets = this.getTickets();
    const index = tickets.findIndex((t) => t.id === ticket.id);
    if (index >= 0) {
      tickets[index] = ticket;
    } else {
      tickets.unshift(ticket);
    }
    this.setStorage(STORAGE_KEYS.TICKETS, tickets);
  }

  // Endorse ticket (+1 count) - Idempotent!
  toggleEndorsement(ticketId: string, userUid: string): { success: boolean; endorsed: boolean; affectedCount: number } {
    const tickets = this.getTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return { success: false, endorsed: false, affectedCount: 0 };

    const hasEndorsed = ticket.endorsedUserIds?.includes(userUid);
    let newEndorsed = false;

    if (hasEndorsed) {
      // Withdraw endorsement
      ticket.endorsedUserIds = ticket.endorsedUserIds.filter((uid) => uid !== userUid);
      ticket.affectedCount = Math.max(1, (ticket.affectedCount || 1) - 1);
      newEndorsed = false;
    } else {
      // Add endorsement
      if (!ticket.endorsedUserIds) ticket.endorsedUserIds = [];
      ticket.endorsedUserIds.push(userUid);
      ticket.affectedCount = (ticket.affectedCount || 1) + 1;
      newEndorsed = true;

      // Add to ticket history
      const currentUser = this.getCurrentUser();
      this.addHistoryEvent({
        id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ticketId,
        eventType: 'ENDORSED',
        actorUid: userUid,
        actorName: currentUser.name,
        description: `${currentUser.name} confirmed they are also affected (+1)`,
        timestamp: new Date().toISOString(),
      });
    }

    ticket.updatedAt = new Date().toISOString();
    this.saveTicket(ticket);
    return { success: true, endorsed: newEndorsed, affectedCount: ticket.affectedCount };
  }

  // Update Status
  updateTicketStatus(
    ticketId: string,
    newStatus: TicketStatus,
    actor: UserProfile,
    resolutionNotes?: string
  ): boolean {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return false;

    const previousStatus = ticket.status;
    ticket.status = newStatus;
    ticket.updatedAt = new Date().toISOString();
    if (resolutionNotes) {
      ticket.resolutionNotes = resolutionNotes;
    }

    this.addHistoryEvent({
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ticketId,
      eventType: newStatus === 'Resolved' ? 'RESOLVED' : newStatus === 'Reopened' ? 'REOPENED' : 'STATUS_CHANGED',
      actorUid: actor.uid,
      actorName: actor.name,
      previousValue: previousStatus,
      newValue: newStatus,
      description: resolutionNotes ? `Status changed to ${newStatus}. Note: ${resolutionNotes}` : `Status changed to ${newStatus}`,
      timestamp: new Date().toISOString(),
    });

    if (newStatus === 'Reopened') {
      ticket.reopenCount = (ticket.reopenCount || 0) + 1;
    }

    this.saveTicket(ticket);

    // Notify ticket reporter if actor is different
    if (ticket.reporterUid !== actor.uid) {
      this.addNotification({
        id: `notif-${Date.now()}`,
        recipientUid: ticket.reporterUid,
        title: `Ticket ${ticket.ticketNumber} Updated`,
        message: `${actor.name} changed status to "${newStatus}".`,
        type: 'ticket_update',
        linkTicketId: ticket.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    return true;
  }

  // Assign ticket
  assignTicket(
    ticketId: string,
    staffUid: string,
    staffName: string,
    actor: UserProfile
  ): boolean {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return false;

    const previous = ticket.assignedStaffName || 'Unassigned';
    ticket.assignedToStaffUid = staffUid;
    ticket.assignedStaffName = staffName;
    if (ticket.status === 'Open' || ticket.status === 'Under Review') {
      ticket.status = 'Assigned';
    }
    ticket.updatedAt = new Date().toISOString();

    this.addHistoryEvent({
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ticketId,
      eventType: 'ASSIGNED',
      actorUid: actor.uid,
      actorName: actor.name,
      previousValue: previous,
      newValue: staffName,
      description: `Assigned to ${staffName}`,
      timestamp: new Date().toISOString(),
    });

    this.saveTicket(ticket);

    // Notify assigned staff
    this.addNotification({
      id: `notif-${Date.now()}`,
      recipientUid: staffUid,
      title: 'New Ticket Assignment',
      message: `You were assigned ticket ${ticket.ticketNumber} (${ticket.title}) by ${actor.name}.`,
      type: 'ticket_assigned',
      linkTicketId: ticket.id,
      read: false,
      createdAt: new Date().toISOString(),
    });

    return true;
  }

  // Comments
  getComments(ticketId: string): TicketComment[] {
    const defaultComments = isProductionClean() ? [] : INITIAL_COMMENTS;
    const all = this.getStorage<TicketComment[]>(STORAGE_KEYS.COMMENTS, defaultComments);
    return all.filter((c) => c.ticketId === ticketId);
  }

  addComment(comment: TicketComment): void {
    const defaultComments = isProductionClean() ? [] : INITIAL_COMMENTS;
    const all = this.getStorage<TicketComment[]>(STORAGE_KEYS.COMMENTS, defaultComments);
    all.push(comment);
    this.setStorage(STORAGE_KEYS.COMMENTS, all);

    this.addHistoryEvent({
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ticketId: comment.ticketId,
      eventType: 'COMMENT_ADDED',
      actorUid: comment.authorUid,
      actorName: comment.authorName,
      description: comment.isInternal
        ? `Added an internal staff note`
        : `Added a public comment`,
      timestamp: new Date().toISOString(),
    });
  }

  // History
  getHistory(ticketId: string): TicketHistoryEvent[] {
    const defaultHistory = isProductionClean() ? [] : INITIAL_HISTORY;
    const all = this.getStorage<TicketHistoryEvent[]>(STORAGE_KEYS.HISTORY, defaultHistory);
    return all
      .filter((h) => h.ticketId === ticketId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  addHistoryEvent(event: TicketHistoryEvent): void {
    const defaultHistory = isProductionClean() ? [] : INITIAL_HISTORY;
    const all = this.getStorage<TicketHistoryEvent[]>(STORAGE_KEYS.HISTORY, defaultHistory);
    all.push(event);
    this.setStorage(STORAGE_KEYS.HISTORY, all);
  }

  // Communities
  getCommunities(): Community[] {
    // Purge any outdated cached versions from earlier builds
    try {
      localStorage.removeItem('campusaccord_communities');
      localStorage.removeItem('campusaccord_communities_v2');
      localStorage.removeItem('campusaccord_communities_v3');
      localStorage.removeItem('campusaccord_communities_v4');
    } catch {
      // ignore
    }

    const stored = this.getStorage<Community[]>(STORAGE_KEYS.COMMUNITIES, DEMO_COMMUNITIES);
    const updated = DEMO_COMMUNITIES.map((defaultComm) => {
      const existing = stored.find((c) => c.id === defaultComm.id);
      // Guarantee exactly 5 members with full names and phone numbers
      const members = (defaultComm.members || []).slice(0, 5);

      return {
        ...defaultComm,
        ...existing,
        name: defaultComm.name,
        memberCount: 5,
        members: members,
        trackRecord: defaultComm.trackRecord,
      };
    });

    this.setStorage(STORAGE_KEYS.COMMUNITIES, updated);
    return updated;
  }

  saveCommunity(community: Community): void {
    const communities = this.getCommunities();
    const index = communities.findIndex((c) => c.id === community.id);
    if (index >= 0) {
      communities[index] = community;
    } else {
      communities.push(community);
    }
    this.setStorage(STORAGE_KEYS.COMMUNITIES, communities);
  }

  // Committee Memberships
  getMemberships(): CommitteeMembership[] {
    return this.getStorage<CommitteeMembership[]>(STORAGE_KEYS.MEMBERSHIPS, INITIAL_MEMBERSHIPS);
  }

  proposeMembership(membership: CommitteeMembership): void {
    const all = this.getMemberships();
    all.unshift(membership);
    this.setStorage(STORAGE_KEYS.MEMBERSHIPS, all);

    // Notify Wardens
    this.addNotification({
      id: `notif-${Date.now()}`,
      recipientUid: 'user-warden-1',
      title: 'Committee Membership Proposed',
      message: `${membership.userName} has been nominated for ${membership.communityName}. Awaiting your approval.`,
      type: 'committee',
      linkTab: 'communities',
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  reviewMembership(membershipId: string, decision: 'Approved' | 'Rejected', warden: UserProfile, reason?: string): void {
    const all = this.getMemberships();
    const mem = all.find((m) => m.id === membershipId);
    if (!mem) return;

    mem.status = decision;
    mem.reviewedByWardenUid = warden.uid;
    mem.reviewedAt = new Date().toISOString();
    if (reason) mem.rejectionReason = reason;

    this.setStorage(STORAGE_KEYS.MEMBERSHIPS, all);

    // Notify user
    this.addNotification({
      id: `notif-${Date.now()}`,
      recipientUid: mem.userUid,
      title: `Committee Nomination ${decision}`,
      message: `Your membership for ${mem.communityName} was ${decision.toLowerCase()} by ${warden.name}.${reason ? ' Reason: ' + reason : ''}`,
      type: 'committee',
      linkTab: 'communities',
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  // Notifications
  getNotifications(userId: string): NotificationItem[] {
    const all = this.getStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return all.filter((n) => n.recipientUid === userId);
  }

  addNotification(notif: NotificationItem): void {
    const all = this.getStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    all.unshift(notif);
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, all);
  }

  markNotificationAsRead(id: string): void {
    const all = this.getStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const item = all.find((n) => n.id === id);
    if (item) {
      item.read = true;
      this.setStorage(STORAGE_KEYS.NOTIFICATIONS, all);
    }
  }

  markAllNotificationsAsRead(userId: string): void {
    const all = this.getStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    all.forEach((n) => {
      if (n.recipientUid === userId) n.read = true;
    });
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, all);
  }

  // Reset Demo Database
  resetDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.COMMENTS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.COMMUNITIES);
    localStorage.removeItem(STORAGE_KEYS.MEMBERSHIPS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  }
}

export const dataStore = new DataStoreService();
