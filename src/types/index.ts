export type UserRole = 'Student' | 'Campus Staff' | 'Admin';

export type StaffDesignation =
  | 'Warden'
  | 'Head Warden'
  | 'Security Guard'
  | 'Maintenance Worker'
  | 'Mess Staff'
  | 'Housekeeping Staff'
  | 'Event Coordinator'
  | 'Other';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  designation?: StaffDesignation;
  roomNumber?: string;
  accountStatus: 'Active' | 'Pending' | 'Disabled';
  joinedDate: string;
  committeeMemberships: string[]; // Community names
  avatarUrl?: string;
}

export type TicketCategory =
  | 'Mess'
  | 'Security'
  | 'Maintenance'
  | 'Internet / Connectivity'
  | 'Events / Clubs'
  | 'Other';

export type TicketStatus =
  | 'Open'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Reopened';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TicketComment {
  id: string;
  ticketId: string;
  authorUid: string;
  authorName: string;
  authorRole: string;
  authorDesignation?: string;
  content: string;
  isInternal: boolean; // Hidden from students, visible to Staff/Admin
  createdAt: string;
}

export interface TicketHistoryEvent {
  id: string;
  ticketId: string;
  eventType:
    | 'CREATED'
    | 'ASSIGNED'
    | 'STATUS_CHANGED'
    | 'CATEGORY_UPDATED'
    | 'COMMENT_ADDED'
    | 'DUPLICATE_CONFIRMED'
    | 'ENDORSED'
    | 'RESOLVED'
    | 'REOPENED';
  actorUid: string;
  actorName: string;
  description: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  originalComplaint: string;
  title: string;
  summary: string;
  category: TicketCategory;
  communityId: string;
  location: string;
  isSharedLocation: boolean;
  isSensitive: boolean; // Private/sensitive reports
  reporterUid: string;
  reporterName: string;
  reporterRoom?: string;
  createdAt: string;
  updatedAt: string;
  status: TicketStatus;
  priority: TicketPriority;
  priorityReason?: string;
  affectedCount: number;
  endorsedUserIds: string[]; // Idempotent +1 tracking
  photoUrls?: string[];
  assignedToStaffUid?: string;
  assignedStaffName?: string;
  assignedCommitteeId?: string;
  reopenCount: number;
  resolutionNotes?: string;
  aiMetadata?: {
    model: string;
    missingInfo?: string[];
    visibleEvidence?: string;
    suggestedAction?: string;
  };
  duplicateReview?: {
    isDuplicateCandidate: boolean;
    matchedTicketId?: string;
    similarityScore?: number;
  };
}

export interface Community {
  id: string;
  name: string;
  description: string;
  iconName: string;
  leadName?: string;
  memberCount: number;
  activeTicketCount: number;
  isArchived: boolean;
}

export interface CommitteeMembership {
  id: string;
  communityId: string;
  communityName: string;
  userUid: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  status: 'Proposed' | 'Approved' | 'Rejected';
  proposedByAdminUid: string;
  reviewedByWardenUid?: string;
  proposedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  authorUid: string;
  authorName: string;
  authorRole: string;
  publishedAt: string;
  targetAudience: 'All' | 'Students' | 'Hostel Residents' | 'Campus Staff';
  isPinned: boolean;
  expiresAt?: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  organizer: string;
  audience: string;
  registrationUrl?: string;
  isOfficial: boolean;
}

export interface NotificationItem {
  id: string;
  recipientUid: string;
  title: string;
  message: string;
  type: 'ticket_update' | 'ticket_assigned' | 'comment' | 'committee' | 'announcement' | 'event' | 'safety';
  linkTicketId?: string;
  linkTab?: string;
  read: boolean;
  createdAt: string;
}

export interface RoutingRule {
  id: string;
  category: TicketCategory;
  defaultCommunityId: string;
  defaultStaffDesignation: StaffDesignation;
  keywords: string[];
}
