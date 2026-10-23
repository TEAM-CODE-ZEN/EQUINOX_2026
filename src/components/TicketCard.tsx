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
  Wrench,
  Utensils,
  Shield,
  Wifi,
  PartyPopper,
  Image as ImageIcon,
} from 'lucide-react';
import { Ticket, TicketCategory } from '../types';
import {
  getStatusBadgeStyle,
  getPriorityBadgeStyle,
  getCategoryTheme,
  formatRelativeTime,
} from '../utils/formatters';

interface TicketCardProps {
  ticket: Ticket;
  currentUserUid: string;
  onSelect: (ticket: Ticket) => void;
  onToggleEndorse: (ticketId: string, e: React.MouseEvent) => void;
  commentCount: number;
}

const renderCategoryIcon = (category: TicketCategory, colorClass: string) => {
  switch (category) {
    case 'Mess':
      return <Utensils className={`w-3 h-3 ${colorClass}`} />;
    case 'Security':
      return <Shield className={`w-3 h-3 ${colorClass}`} />;
    case 'Maintenance':
      return <Wrench className={`w-3 h-3 ${colorClass}`} />;
    case 'Internet / Connectivity':
      return <Wifi className={`w-3 h-3 ${colorClass}`} />;
    case 'Events / Clubs':
      return <PartyPopper className={`w-3 h-3 ${colorClass}`} />;
    default:
      return <Wrench className={`w-3 h-3 ${colorClass}`} />;
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
  const statusBadge = getStatusBadgeStyle(ticket.status);
  const priorityBadge = getPriorityBadgeStyle(ticket.priority);
  const categoryTheme = getCategoryTheme(ticket.category);

  return (
    <div
      onClick={() => onSelect(ticket)}
      className="group relative bg-white border border-mocha-200/90 hover:border-mocha-300 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_0_rgba(61,6,16,0.03),0_4px_16px_-4px_rgba(61,6,16,0.04)] hover:shadow-[0_12px_24px_-6px_rgba(61,6,16,0.08)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left select-none"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Metadata, Badges & Titles */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2.5">
            {/* Ticket ID */}
            <span className="font-mono text-[11px] font-bold text-mocha-700 bg-mocha-50 px-2 py-0.5 rounded-lg border border-mocha-200/90">
              {ticket.ticketNumber}
            </span>

            {/* Category Pill with Icon */}
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border ${categoryTheme.bg}`}
            >
              {renderCategoryIcon(ticket.category, categoryTheme.iconColor)}
              <span>{ticket.category}</span>
            </span>

            {/* Status with Dot */}
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
              <span>{ticket.status}</span>
            </span>

            {/* Priority */}
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-lg border ${priorityBadge.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityBadge.dot}`}></span>
              <span>{priorityBadge.label}</span>
            </span>

            {/* Sensitive Flag */}
            {ticket.isSensitive && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-burgundy-900 bg-burgundy-50 px-2 py-0.5 rounded-lg border border-burgundy-200">
                <ShieldAlert className="w-3 h-3 text-burgundy-700" />
                Sensitive Report
              </span>
            )}

            {/* Reopened Flag */}
            {ticket.reopenCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-burgundy-900 bg-burgundy-100 px-2 py-0.5 rounded-lg border border-burgundy-300">
                <RotateCcw className="w-3 h-3 text-burgundy-700" />
                Reopened ({ticket.reopenCount})
              </span>
            )}
          </div>

          {/* AI-Generated / Verified Title */}
          <h3 className="text-sm sm:text-base font-bold text-burgundy-950 group-hover:text-burgundy-800 transition-colors line-clamp-1 tracking-tight">
            {ticket.title}
          </h3>

          {/* Summary */}
          <p className="text-xs sm:text-[13px] text-mocha-900/80 mt-1 line-clamp-2 leading-relaxed">
            {ticket.summary}
          </p>

          {/* Location & Time Info */}
          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 mt-3 text-xs text-mocha-700 font-medium">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-mocha-500" />
              <span className="truncate max-w-[200px] text-mocha-900 font-semibold">
                {ticket.location}
              </span>
              {ticket.isSharedLocation && (
                <span className="text-[9px] uppercase font-bold text-mocha-900 bg-mocha-100 px-1.5 py-0.2 rounded border border-mocha-200">
                  Shared Common Area
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-mocha-500" />
              <span className="font-mono text-[11px] text-mocha-700">{formatRelativeTime(ticket.createdAt)}</span>
            </div>

            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-mocha-500" />
              <span className="text-mocha-800">
                {ticket.isSensitive ? 'Confidential' : ticket.reporterName}
              </span>
            </div>

            {ticket.assignedStaffName && (
              <div className="flex items-center gap-1.5 text-burgundy-900 bg-burgundy-50 px-2 py-0.5 rounded-md font-bold text-[11px] border border-burgundy-200/60">
                <CheckCircle className="w-3 h-3 text-burgundy-700" />
                <span>Assigned: {ticket.assignedStaffName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Photo Preview Thumbnail */}
        {ticket.photoUrls && ticket.photoUrls.length > 0 && (
          <div className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-mocha-200 bg-mocha-50 shadow-subtle group-hover:shadow-card transition-shadow">
            <img
              src={ticket.photoUrls[0]}
              alt="Issue evidence"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-1 right-1 bg-burgundy-950/70 backdrop-blur-sm px-1 py-0.5 rounded text-[9px] text-latte-50 flex items-center gap-0.5">
              <ImageIcon className="w-2.5 h-2.5 text-mocha-200" />
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls: Affected Counter (+1) and Comments */}
      <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-mocha-100">
        <div className="flex items-center gap-2.5">
          {/* Affected Students Button (+1 control with tactile feedback) */}
          <button
            onClick={(e) => onToggleEndorse(ticket.id, e)}
            title={
              hasEndorsed
                ? 'You endorsed this issue. Click to withdraw.'
                : 'Tap +1 if you are experiencing this campus issue too'
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 border ${
              hasEndorsed
                ? 'bg-burgundy-900 text-latte-50 border-burgundy-900 shadow-[0_2px_10px_rgba(61,6,16,0.35)]'
                : 'bg-mocha-50 hover:bg-mocha-100 text-mocha-900 border-mocha-200/90 hover:border-mocha-300'
            }`}
          >
            <ThumbsUp
              className={`w-3.5 h-3.5 ${
                hasEndorsed ? 'text-mocha-200 fill-mocha-200' : 'text-mocha-600'
              }`}
            />
            <span className="font-mono">
              {ticket.affectedCount}{' '}
              <span className="font-sans font-medium text-[11px] opacity-90 hidden sm:inline">
                {ticket.affectedCount === 1 ? 'affected' : 'affected'}
              </span>
            </span>
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                hasEndorsed
                  ? 'bg-burgundy-950 text-mocha-300'
                  : 'bg-mocha-200 text-mocha-800'
              }`}
            >
              {hasEndorsed ? 'Joined' : '+1'}
            </span>
          </button>

          {/* Comment Count */}
          <div className="flex items-center gap-1.5 text-xs text-mocha-700 font-semibold px-2 py-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-mocha-400" />
            <span className="font-mono">{commentCount}</span>
          </div>

          {ticket.aiMetadata?.visibleEvidence && (
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-bold text-burgundy-900 bg-burgundy-50 px-2 py-0.5 rounded-lg border border-burgundy-200/70">
              <Sparkles className="w-3 h-3 text-burgundy-600" />
              AI Verified
            </span>
          )}
        </div>

        {/* View Details Action */}
        <div className="flex items-center gap-1 text-xs font-bold text-mocha-700 group-hover:text-burgundy-800 transition-colors">
          <span>View Ticket</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
    </div>
  );
};
export default TicketCard;
