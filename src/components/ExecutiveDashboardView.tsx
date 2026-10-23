import React, { useState } from 'react';
import {
  Settings,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Search,
  QrCode,
  Sparkles,
  MapPin,
  ThumbsUp,
  ChevronRight,
  AlertCircle,
  X,
  Layers,
} from 'lucide-react';
import { Ticket, GatePass, UserProfile } from '../types';

interface ExecutiveDashboardViewProps {
  tickets: Ticket[];
  gatePasses: GatePass[];
  currentUser: UserProfile;
  onApplyGatePass: () => void;
  onReportConcern: () => void;
  onSelectTicket: (ticket: Ticket) => void;
  onNavigateTab: (tab: string) => void;
  openIssuesCount: number;
  gatePassCount: number;
  onOpenSettings?: () => void;
  onToggleEndorse?: (ticketId: string, e?: React.MouseEvent) => void;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardViewProps> = ({
  tickets,
  gatePasses,
  currentUser,
  onApplyGatePass,
  onReportConcern,
  onSelectTicket,
  onNavigateTab,
  openIssuesCount,
  gatePassCount,
  onOpenSettings,
  onToggleEndorse,
}) => {
  const isStudent = currentUser.role === 'Student';

  // Filter states for Student Overview
  const [filterType, setFilterType] = useState<'active' | 'my-issues' | 'solved'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Counts
  const activeTickets = tickets.filter((t) => t.status !== 'Resolved');
  const resolvedTickets = tickets.filter((t) => t.status === 'Resolved');
  const myStudentTickets = tickets.filter((t) => t.reporterUid === currentUser.uid);

  // Student's active gate passes
  const myGatePasses = gatePasses.filter((g) => g.studentUid === currentUser.uid);
  const activeGatePass = myGatePasses[0];

  // Filtered tickets based on student selection
  const displayedTickets = tickets
    .filter((ticket) => {
      if (filterType === 'active') return ticket.status !== 'Resolved';
      if (filterType === 'my-issues') return ticket.reporterUid === currentUser.uid;
      if (filterType === 'solved') return ticket.status === 'Resolved';
      return true;
    })
    .filter((ticket) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        ticket.title.toLowerCase().includes(q) ||
        ticket.ticketNumber.toLowerCase().includes(q) ||
        ticket.location.toLowerCase().includes(q) ||
        ticket.category.toLowerCase().includes(q)
      );
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            In Progress
          </span>
        );
      case 'Assigned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Staff Assigned
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-900 border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
            Resolved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Open
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* ---------------------------------------------------------------------- */}
      {/* 1. Minimal Student Header: Greeting & Quick Action Buttons              */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 border-b border-mocha-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hostel Student Portal • Room {currentUser.roomNumber || '304'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-gray-900">
            Hello, <span className="text-[#15803D]">{currentUser.name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-mocha-700 mt-0.5">
            Overview of hostel problems, active tickets, and gate pass clearances.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            onClick={onApplyGatePass}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-latte-50 text-[#15803D] border border-emerald-300 font-bold text-xs tracking-tight shadow-sm transition-all active:scale-95"
          >
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Gate Pass</span>
          </button>

          <button
            onClick={onReportConcern}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#16A34A] hover:bg-[#22C55E] text-white font-extrabold text-xs tracking-tight shadow-[0_4px_16px_rgba(22,163,74,0.35)] transition-all active:scale-95 group"
          >
            <Plus className="w-4 h-4 stroke-[2.5] text-white group-hover:rotate-90 transition-transform duration-200" />
            <span>Report Problem</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. Three Clean Summary Cards: Active Tickets, Solved Tickets, Track     */}
      {/* ---------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Active Tickets */}
        <div
          onClick={() => setFilterType('active')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            filterType === 'active'
              ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white hover:bg-latte-50/70 border-mocha-200 shadow-subtle'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-mocha-700 font-mono">
              Active Tickets
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-mono">
              {activeTickets.length}
            </span>
            <p className="text-xs text-mocha-700 font-medium mt-1">
              Issues currently open or in progress
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-mocha-100 flex items-center justify-between text-xs font-bold text-[#15803D]">
            <span>View Active Issues</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Solved Tickets */}
        <div
          onClick={() => setFilterType('solved')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            filterType === 'solved'
              ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white hover:bg-latte-50/70 border-mocha-200 shadow-subtle'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-mocha-700 font-mono">
              Solved Tickets
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-800 font-mono">
              {resolvedTickets.length}
            </span>
            <p className="text-xs text-mocha-700 font-medium mt-1">
              Successfully fixed & closed concerns
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-mocha-100 flex items-center justify-between text-xs font-bold text-[#15803D]">
            <span>View Solved Issues</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Track Issue Option */}
        <div
          onClick={() => setFilterType('my-issues')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            filterType === 'my-issues'
              ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-2 ring-emerald-500/20'
              : 'bg-white hover:bg-latte-50/70 border-mocha-200 shadow-subtle'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-mocha-700 font-mono">
              Track My Issues
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Search className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-mono">
              {myStudentTickets.length}
            </span>
            <p className="text-xs text-mocha-700 font-medium mt-1">
              Problems raised by you
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-mocha-100 flex items-center justify-between text-xs font-bold text-[#15803D]">
            <span>Track My Raised Complaints</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. Active Gate Pass Status (If Applied)                                */}
      {/* ---------------------------------------------------------------------- */}
      {activeGatePass && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-latte-100 border border-emerald-300 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs flex-shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-gray-900">
                  Pass #{activeGatePass.passNumber}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    activeGatePass.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-900'
                      : activeGatePass.status === 'Rejected'
                      ? 'bg-rose-100 text-rose-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {activeGatePass.status}
                </span>
              </div>
              <p className="text-xs text-mocha-700 mt-0.5">
                Purpose: <span className="font-semibold">{activeGatePass.purpose}</span> • Valid: {activeGatePass.dateFrom} to {activeGatePass.dateTo}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('gate-pass')}
            className="px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#22C55E] text-white text-xs font-bold transition-colors self-start sm:self-center"
          >
            Open Digital Pass
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 4. Active Issues List Directly in Overview (Clean, Ultra-Readable)      */}
      {/* ---------------------------------------------------------------------- */}
      <div className="space-y-4 pt-2">
        {/* Controls Bar: Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-mocha-200/90 shadow-subtle">
          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterType('active')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'active'
                  ? 'bg-[#16A34A] text-white shadow-sm'
                  : 'bg-mocha-100/80 text-mocha-800 hover:bg-mocha-200/70'
              }`}
            >
              Active Problems ({activeTickets.length})
            </button>

            <button
              onClick={() => setFilterType('my-issues')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'my-issues'
                  ? 'bg-[#16A34A] text-white shadow-sm'
                  : 'bg-mocha-100/80 text-mocha-800 hover:bg-mocha-200/70'
              }`}
            >
              My Issues ({myStudentTickets.length})
            </button>

            <button
              onClick={() => setFilterType('solved')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'solved'
                  ? 'bg-[#16A34A] text-white shadow-sm'
                  : 'bg-mocha-100/80 text-mocha-800 hover:bg-mocha-200/70'
              }`}
            >
              Solved ({resolvedTickets.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-mocha-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problem or room..."
              className="w-full pl-9 pr-8 py-1.5 border border-mocha-200 rounded-xl bg-mocha-50/60 focus:bg-white text-xs font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-mocha-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-mocha-400 hover:text-mocha-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* List of Problem Cards (Zero Clutter, High Readability) */}
        <div className="space-y-3">
          {displayedTickets.length === 0 ? (
            <div className="p-10 bg-white rounded-3xl border border-mocha-200 text-center space-y-3 shadow-subtle">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                No Problems Found
              </h3>
              <p className="text-xs text-mocha-600 max-w-sm mx-auto">
                {searchQuery
                  ? 'No issues match your search query.'
                  : filterType === 'my-issues'
                  ? 'You have not reported any complaints yet.'
                  : 'Everything in this category is running smoothly!'}
              </p>
              <button
                onClick={onReportConcern}
                className="px-4 py-2 bg-[#16A34A] text-white rounded-xl text-xs font-bold hover:bg-[#22C55E] transition-colors shadow-sm"
              >
                Report a Concern
              </button>
            </div>
          ) : (
            displayedTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket)}
                className="p-5 bg-white hover:bg-latte-50/60 rounded-3xl border border-mocha-200/90 shadow-subtle hover:shadow-card transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Info: Clean, Large, Easy to Read */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-mocha-100 text-mocha-800">
                      {ticket.ticketNumber || ticket.id}
                    </span>
                    {getStatusBadge(ticket.status)}
                    <span className="text-xs font-bold text-[#15803D] bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/80">
                      {ticket.category}
                    </span>
                  </div>

                  {/* Big Readable Title */}
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#15803D] transition-colors leading-snug">
                    {ticket.title}
                  </h3>

                  {/* Clean Location & Date */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-mocha-700 font-medium">
                    <span className="flex items-center gap-1 text-mocha-800">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{ticket.location}</span>
                    </span>
                    <span>•</span>
                    <span className="text-mocha-500 font-mono">
                      Reported on {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Right Action: Upvote (+1) & Track Button */}
                <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-mocha-100 w-full sm:w-auto justify-between sm:justify-end">
                  {onToggleEndorse && ticket.status !== 'Resolved' && (
                    <button
                      onClick={(e) => onToggleEndorse(ticket.id, e)}
                      title="I am also facing this problem"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-mocha-50 hover:bg-emerald-50 border border-mocha-200 text-mocha-700 hover:text-emerald-800 text-xs font-bold transition-all active:scale-95"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>+1 Me Too ({ticket.affectedCount})</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTicket(ticket);
                    }}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#16A34A] hover:bg-[#22C55E] text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
                  >
                    <span>Track Issue</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
