import React from 'react';
import {
  MapPin,
  Clock,
  MessageSquare,
  ThumbsUp,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { Ticket } from '../types';
import { formatRelativeTime } from '../utils/formatters';

interface TicketCardProps {
  ticket: Ticket;
  currentUserUid: string;
  onSelect: (ticket: Ticket) => void;
  onToggleEndorse: (ticketId: string, e: React.MouseEvent) => void;
  commentCount: number;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  currentUserUid,
  onSelect,
  onToggleEndorse,
  commentCount,
}) => {
  const hasEndorsed = ticket.endorsedUserIds?.includes(currentUserUid);
  const isCombined = ticket.affectedCount > 1;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Working on it
          </span>
        );
      case 'Assigned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Staff Assigned
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-900 border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
            Fixed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Reported
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect(ticket)}
      className="group relative bg-white border border-mocha-200/90 hover:border-mocha-300 rounded-3xl p-5 shadow-subtle hover:shadow-card transition-all duration-200 cursor-pointer text-left select-none"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Clean Metadata & Title */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge(ticket.status)}
            <span className="text-xs font-bold text-[#15803D] bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/80">
              {ticket.category}
            </span>

            {/* AI Merged Indicator */}
            {isCombined && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50/90 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>AI Merged ({ticket.affectedCount} reports)</span>
              </span>
            )}
          </div>

          {/* Big Readable Title */}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#15803D] transition-colors line-clamp-1 tracking-tight leading-snug">
            {ticket.title}
          </h3>

          {/* Clean Location & Relative Time */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-mocha-700 font-medium">
            <div className="flex items-center gap-1.5 text-mocha-800">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold">{ticket.location}</span>
            </div>

            <span>•</span>

            <div className="flex items-center gap-1 text-mocha-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatRelativeTime(ticket.createdAt)}</span>
            </div>

            {ticket.assignedStaffName && (
              <>
                <span>•</span>
                <span className="text-emerald-700 font-bold">
                  Assigned: {ticket.assignedStaffName}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Photo Preview Thumbnail (if attached) */}
        {ticket.photoUrls && ticket.photoUrls.length > 0 && (
          <div className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-mocha-200 bg-mocha-50 shadow-subtle group-hover:shadow-card transition-shadow">
            <img
              src={ticket.photoUrls[0]}
              alt="Issue evidence"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-1 right-1 bg-gray-900/70 backdrop-blur-sm px-1 py-0.5 rounded text-[9px] text-white flex items-center gap-0.5">
              <ImageIcon className="w-2.5 h-2.5" />
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls: Affected Counter (+1) and Comments */}
      <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-mocha-100">
        <div className="flex items-center gap-2.5">
          {/* Affected Students Button */}
          {ticket.status !== 'Resolved' && (
            <button
              onClick={(e) => onToggleEndorse(ticket.id, e)}
              title={hasEndorsed ? 'You endorsed this issue' : 'Tap if you face this issue too'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 border ${
                hasEndorsed
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-mocha-50 hover:bg-emerald-50 text-gray-800 border-mocha-200 hover:border-mocha-300'
              }`}
            >
              <ThumbsUp
                className={`w-3.5 h-3.5 ${hasEndorsed ? 'fill-white' : 'text-mocha-600'}`}
              />
              <span>{hasEndorsed ? 'Reported (+1)' : `+1 Me Too (${ticket.affectedCount})`}</span>
            </button>
          )}

          {/* Comment Count */}
          {commentCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-mocha-600 font-medium px-2 py-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-mocha-400" />
              <span>{commentCount}</span>
            </div>
          )}
        </div>

        {/* View Details Action */}
        <div className="flex items-center gap-1 text-xs font-bold text-mocha-700 group-hover:text-[#15803D] transition-colors">
          <span>Track Status</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
