import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Ticket } from '../types';
import { getTicketPriorityBorderClass } from '../utils/formatters';

interface TicketCardProps {
  ticket: Ticket;
  currentUserUid?: string;
  onSelect: (ticket: Ticket) => void;
  onToggleEndorse?: (ticketId: string, e: React.MouseEvent) => void;
  commentCount?: number;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onSelect,
}) => {
  const borderClass = getTicketPriorityBorderClass(ticket);

  return (
    <div
      onClick={() => onSelect(ticket)}
      className={`group relative rounded-2xl p-4 sm:p-5 shadow-subtle hover:shadow-card transition-all duration-200 cursor-pointer text-left select-none flex items-center justify-between gap-4 ${borderClass}`}
    >
      {/* Department & Issue Name Only */}
      <div className="space-y-1.5 min-w-0 flex-1">
        <span className="inline-block text-xs font-bold text-[#15803D] bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/80 font-mono">
          {ticket.category}
        </span>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#15803D] transition-colors leading-snug truncate">
          {ticket.title}
        </h3>
      </div>

      {/* Right: Clean Action Indicator */}
      <div className="flex items-center gap-1.5 text-mocha-400 group-hover:text-[#15803D] transition-colors flex-shrink-0">
        <span className="text-xs font-bold hidden sm:inline">Details</span>
        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
      </div>
    </div>
  );
};

export default TicketCard;
