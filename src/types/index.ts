export type UserRole = 'Student' | 'Campus Staff' | 'Admin';

export type StaffDesignation =
  | 'Warden'
  | 'Head Warden'
  | 'Security Guard'
  | 'Maintenance Worker'
  | 'Mess Staff'
  | 'Housekeeping Staff'
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
  | 'Other';

export type TicketStatus =
  | 'Open'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Pending Verification'
  | 'Awaiting Student Confirmation'
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
    | 'REOPENED'
    | 'INVESTIGATION_RUN'
    | 'ROOT_CAUSE_LINKED'
    | 'VERIFICATION_RUN'
    | 'STUDENT_CONFIRMED';
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
  // Shared Data Model Extensions (Optional)
  rootCauseId?: string;
  beforeImage?: string;
  afterImage?: string;
  resolutionNote?: string;
  verification?: {
    verdict: 'Verified' | 'Not Verified' | 'Inconclusive';
    confidence: number;
    what_was_wrong?: string;
    what_changed?: string;
    reasoning: string;
    checks: { item: string; passed: boolean }[];
    red_flags?: string[];
    checkedAt?: string;
    studentConfirmation?: {
      confirmed: boolean;
      comment?: string;
      confirmedAt: string;
    };
  };
  investigation?: {
    report: any;
    chat: {
      role: 'user' | 'assistant';
      text: string;
      timestamp: string;
    }[];
  };
  demo?: boolean;
}

export interface CommunityMember {
  id: string;
  name: string;
  role: string; // e.g. 'Committee Lead' | 'Student Representative' | 'Wing Coordinator' | 'Faculty Advisor' | 'Technical Specialist'
  userType: 'Student' | 'Staff' | 'Faculty';
  email: string;
  phone?: string;
  roomOrOffice: string;
  joinedDate: string;
  avatarUrl?: string;
}

export interface CommunityTrackRecord {
  totalResolved: number;
  activeIssues: number;
  avgTurnaroundHours: number;
  satisfactionRating: number;
  slaComplianceRate: number;
  firstTimeFixRate: number;
  keyAchievements: string[];
}

export interface Community {
  id: string;
  name: string;
  description: string;
  iconName: string;
  leadName?: string;
  leadRole?: string;
  leadContact?: string;
  memberCount: number;
  activeTicketCount: number;
  isArchived: boolean;
  members?: CommunityMember[];
  trackRecord?: CommunityTrackRecord;
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

export interface NotificationItem {
  id: string;
  recipientUid: string;
  title: string;
  message: string;
  type: 'ticket_update' | 'ticket_assigned' | 'comment' | 'committee' | 'safety';
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

