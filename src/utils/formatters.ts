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
        dot: 'bg-rose-600',
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

export const getTicketPriorityBorderClass = (t: {
  affectedCount?: number;
  reopenCount?: number;
  priority?: TicketPriority;
}): string => {
  const affected = t.affectedCount || 1;
  const reopens = t.reopenCount || 0;
  const isHigh =
    affected >= 5 ||
    reopens > 0 ||
    t.priority === 'Critical' ||
    t.priority === 'High';

  if (isHigh) {
    return 'border-2 border-red-500 hover:border-red-600 bg-white hover:bg-red-50/20';
  }

  const isModerate = affected >= 2 || t.priority === 'Medium';
  if (isModerate) {
    return 'border-2 border-amber-400 hover:border-amber-500 bg-white hover:bg-amber-50/20';
  }

  return 'border-2 border-emerald-400 hover:border-emerald-500 bg-white hover:bg-emerald-50/20';
};

