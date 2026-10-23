import { TicketStatus, TicketPriority, TicketCategory } from '../types';

export const getStatusBadgeStyle = (status: TicketStatus) => {
  switch (status) {
    case 'Open':
      return {
        bg: 'bg-mocha-100 text-mocha-900 border-mocha-200/90',
        dot: 'bg-mocha-600',
      };
    case 'Under Review':
      return {
        bg: 'bg-latte-200 text-mocha-800 border-mocha-200',
        dot: 'bg-mocha-500',
      };
    case 'Assigned':
      return {
        bg: 'bg-burgundy-50 text-burgundy-800 border-burgundy-200/80',
        dot: 'bg-burgundy-600',
      };
    case 'In Progress':
      return {
        bg: 'bg-amber-50/90 text-amber-800 border-amber-200/80',
        dot: 'bg-amber-600',
      };
    case 'Resolved':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        dot: 'bg-emerald-600',
      };
    case 'Reopened':
      return {
        bg: 'bg-burgundy-100 text-burgundy-900 border-burgundy-300',
        dot: 'bg-burgundy-700',
      };
    default:
      return {
        bg: 'bg-latte-100 text-mocha-700 border-mocha-200',
        dot: 'bg-mocha-400',
      };
  }
};

export const getPriorityBadgeStyle = (priority: TicketPriority) => {
  switch (priority) {
    case 'Critical':
      return {
        bg: 'text-rose-900 bg-rose-50/95 border-rose-200 shadow-sm',
        dot: 'bg-rose-600 animate-pulse',
        label: 'Critical Priority',
      };
    case 'High':
      return {
        bg: 'text-amber-800 bg-amber-50/95 border-amber-200',
        dot: 'bg-amber-600',
        label: 'High Priority',
      };
    case 'Medium':
      return {
        bg: 'text-mocha-800 bg-mocha-100/90 border-mocha-200',
        dot: 'bg-mocha-500',
        label: 'Medium Priority',
      };
    case 'Low':
      return {
        bg: 'text-mocha-700 bg-latte-100/90 border-mocha-200',
        dot: 'bg-mocha-400',
        label: 'Low Priority',
      };
    default:
      return {
        bg: 'text-mocha-700 bg-latte-100 border-mocha-200',
        dot: 'bg-mocha-400',
        label: `${priority} Priority`,
      };
  }
};

export const getCategoryTheme = (category: TicketCategory) => {
  switch (category) {
    case 'Mess':
      return {
        bg: 'bg-amber-50/90 text-amber-900 border-amber-200/80',
        iconColor: 'text-amber-700',
      };
    case 'Security':
      return {
        bg: 'bg-burgundy-50 text-burgundy-900 border-burgundy-200/80',
        iconColor: 'text-burgundy-700',
      };
    case 'Maintenance':
      return {
        bg: 'bg-mocha-100 text-mocha-900 border-mocha-200/80',
        iconColor: 'text-mocha-700',
      };
    case 'Internet / Connectivity':
      return {
        bg: 'bg-latte-200 text-mocha-900 border-mocha-200/80',
        iconColor: 'text-mocha-600',
      };
    case 'Events / Clubs':
      return {
        bg: 'bg-burgundy-100/70 text-burgundy-950 border-burgundy-200/80',
        iconColor: 'text-burgundy-800',
      };
    default:
      return {
        bg: 'bg-latte-100 text-mocha-800 border-mocha-200',
        iconColor: 'text-mocha-600',
      };
  }
};

export const formatRelativeTime = (isoString: string) => {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return `${diffMins}m ago`;
    }
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
};
