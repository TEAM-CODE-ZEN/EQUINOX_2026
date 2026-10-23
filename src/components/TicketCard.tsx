import React from 'react';
import {
  MapPin,
  Clock,
  MessageSquare,
  ThumbsUp,
  User,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';
import { Ticket, TicketStatus, TicketPriority } from '../types';

interface TicketCardProps {
  ticket: Ticket;
  currentUserUid: string;
  onSelect: (ticket: Ticket) => void;
  onToggleEndorse: (ticketId: string, e: React.MouseEvent) => void;
  commentCount: number;
}

export const getStatusBadgeStyle = (status: TicketStatus) => {
  switch (status) {
    case 'Open':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Under Review':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Assigned':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'In Progress':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Resolved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Reopened':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

export const getPriorityBadgeStyle = (priority: TicketPriority) => {
  switch (priority) {
    case 'Critical':
      return 'text-rose-700 bg-rose-50 border-rose-200';
    case 'High':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'Medium':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'Low':
      return 'text-slate-600 bg-slate-50 border-slate-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
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
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
};

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  currentUserUid,
  onSelect,
  onToggleEndorse,
  commentCount,
}) => {
  const hasEndorsed = ticket.endorsedUserIds?.includes(currentUserUid);

  return (
    <div
      onClick={() => onSelect(ticket)}
      className="group relative bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl p-4 sm:p-5 shadow-subtle hover:shadow-card transition-all cursor-pointer text-left"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Metadata & Titles */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Ticket ID */}
            <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {ticket.ticketNumber}
            </span>

            {/* Category */}
            <span className="text-xs font-medium text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/60">
              {ticket.category}
            </span>

            {/* Status */}
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                ticket.status
              )}`}
            >
              {ticket.status}
            </span>

            {/* Priority */}
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded border ${getPriorityBadgeStyle(
                ticket.priority
              )}`}
            >
              {ticket.priority} Priority
            </span>

            {/* Sensitive Flag */}
            {ticket.isSensitive && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                <ShieldAlert className="w-3 h-3" />
                Sensitive Report
              </span>
            )}

            {/* Reopened Flag */}
            {ticket.reopenCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <RotateCcw className="w-3 h-3" />
                Reopened ({ticket.reopenCount})
              </span>
            )}
          </div>

          {/* AI-Generated Title */}
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-indigo-950 transition-colors line-clamp-1">
            {ticket.title}
          </h3>

          {/* Summary */}
          <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2">
            {ticket.summary}
          </p>

          {/* Location & Time */}
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-3 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[220px]">{ticket.location}</span>
              {ticket.isSharedLocation && (
                <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded font-medium">
                  Shared
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatRelativeTime(ticket.createdAt)}</span>
            </div>

            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {ticket.isSensitive
                  ? 'Confidential Reporter'
                  : ticket.reporterName}
              </span>
            </div>

            {ticket.assignedStaffName && (
              <div className="flex items-center gap-1 text-slate-600 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                <span>Assigned: {ticket.assignedStaffName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Photo Preview Thumbnail */}
        {ticket.photoUrls && ticket.photoUrls.length > 0 && (
          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
            <img
              src={ticket.photoUrls[0]}
              alt="Issue evidence"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}
      </div>

      {/* Footer Controls: Affected Counter (+1) and Comments */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {/* Affected Students Button (+1 control) */}
          <button
            onClick={(e) => onToggleEndorse(ticket.id, e)}
            title={
              hasEndorsed
                ? 'You endorsed this issue. Click to remove endorsement.'
                : 'Click +1 if you are also experiencing this campus problem'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              hasEndorsed
                ? 'bg-teal-50 text-teal-800 border-teal-300 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <ThumbsUp
              className={`w-3.5 h-3.5 ${
                hasEndorsed ? 'text-teal-700 fill-teal-700' : 'text-slate-500'
              }`}
            />
            <span>
              {ticket.affectedCount}{' '}
              <span className="hidden sm:inline font-normal">
                {ticket.affectedCount === 1 ? 'affected' : 'affected'}
              </span>
            </span>
            <span
              className={`text-[10px] font-bold px-1 rounded ${
                hasEndorsed
                  ? 'bg-teal-200 text-teal-900'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {hasEndorsed ? 'Joined' : '+1'}
            </span>
          </button>

          {/* Comment Count */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 px-2 py-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>{commentCount}</span>
          </div>

          {ticket.aiMetadata?.visibleEvidence && (
            <span className="hidden lg:flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              Verified Evidence
            </span>
          )}
        </div>

        {/* View Details Action */}
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 group-hover:text-slate-900">
          <span>Details & History</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
