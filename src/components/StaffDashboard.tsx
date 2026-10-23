import React, { useState } from 'react';
import {
  ArrowUpRight,
} from 'lucide-react';
import { Ticket, UserProfile, TicketCategory, TicketStatus } from '../types';
import {
  getStatusBadgeStyle,
  getPriorityBadgeStyle,
} from '../utils/formatters';
import { DEMO_USERS } from '../services/mockData';

interface StaffDashboardProps {
  tickets: Ticket[];
  currentUser: UserProfile;
  onOpenTicket: (ticket: Ticket) => void;
  onUpdateStatus?: (ticketId: string, status: TicketStatus, notes?: string) => void;
  onAssignStaff: (ticketId: string, staffUid: string, staffName: string) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  tickets,
  currentUser,
  onOpenTicket,
  onAssignStaff,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Compute live metrics strictly from database state
  const totalTickets = tickets.length;
  const openIssues = tickets.filter((t) => t.status === 'Open').length;
  const awaitingAssignment = tickets.filter(
    (t) => !t.assignedToStaffUid && t.status !== 'Resolved'
  ).length;
  const inProgressIssues = tickets.filter((t) => t.status === 'In Progress').length;
  const resolvedIssues = tickets.filter((t) => t.status === 'Resolved').length;
  const reopenedIssues = tickets.filter((t) => (t.reopenCount || 0) > 0).length;
  const criticalHighIssues = tickets.filter(
    (t) => (t.priority === 'Critical' || t.priority === 'High') && t.status !== 'Resolved'
  ).length;

  const categories: TicketCategory[] = [
    'Maintenance',
    'Mess',
    'Security',
    'Internet / Connectivity',
    'Events / Clubs',
  ];

  const categoryCounts = categories.map((cat) => ({
    name: cat,
    count: tickets.filter((t) => t.category === cat && t.status !== 'Resolved').length,
  }));

  const filteredTickets = tickets.filter((t) => {
    if (filterCategory !== 'All' && t.category !== filterCategory) return false;
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    return true;
  });

  const eligibleStaff = DEMO_USERS.filter((u) => u.role === 'Campus Staff');

  return (
    <div className="space-y-6 text-left pb-8">
      {/* Top Header Banner */}
      <div className="p-6 bg-white rounded-3xl border border-mocha-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-extrabold text-burgundy-950 tracking-tight">
              Staff Triage & Operations Board
            </h2>
            <span className="text-[10px] font-mono uppercase bg-burgundy-900 text-latte-100 font-extrabold px-2.5 py-0.5 rounded-full border border-burgundy-800">
              {currentUser.role === 'Campus Staff' ? currentUser.designation : 'Admin'}
            </span>
            <span className="text-xs font-mono font-bold text-mocha-800 bg-mocha-100 px-2 py-0.5 rounded-lg border border-mocha-200/80">
              {totalTickets} Live Records
            </span>
          </div>
          <p className="text-xs text-mocha-600 mt-1 font-medium">
            Cross-department facilities queue, technician dispatch, and resolution tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Synchronized</span>
        </div>
      </div>

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-mocha-200/90 shadow-subtle hover:border-mocha-300 transition-all">
          <p className="text-[10px] font-extrabold text-mocha-400 uppercase tracking-wider font-mono">
            Open Queue
          </p>
          <p className="text-2xl font-extrabold font-mono text-burgundy-950 mt-1">{openIssues}</p>
          <span className="text-[11px] text-mocha-700 font-bold">Unresolved</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-mocha-200/90 shadow-subtle hover:border-mocha-300 transition-all">
          <p className="text-[10px] font-extrabold text-mocha-400 uppercase tracking-wider font-mono">
            Unassigned
          </p>
          <p className="text-2xl font-extrabold font-mono text-amber-700 mt-1">{awaitingAssignment}</p>
          <span className="text-[11px] text-amber-700 font-bold">Needs technician</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-mocha-200/90 shadow-subtle hover:border-mocha-300 transition-all">
          <p className="text-[10px] font-extrabold text-mocha-400 uppercase tracking-wider font-mono">
            In Progress
          </p>
          <p className="text-2xl font-extrabold font-mono text-burgundy-800 mt-1">{inProgressIssues}</p>
          <span className="text-[11px] text-burgundy-700 font-bold">Under repair</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-mocha-200/90 shadow-subtle hover:border-mocha-300 transition-all">
          <p className="text-[10px] font-extrabold text-mocha-400 uppercase tracking-wider font-mono">
            High Priority
          </p>
          <p className="text-2xl font-extrabold font-mono text-burgundy-900 mt-1">{criticalHighIssues}</p>
          <span className="text-[11px] text-burgundy-900 font-bold">Urgent dispatch</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-mocha-200/90 shadow-subtle hover:border-mocha-300 transition-all">
          <p className="text-[10px] font-extrabold text-mocha-400 uppercase tracking-wider font-mono">
            Resolved
          </p>
          <p className="text-2xl font-extrabold font-mono text-emerald-700 mt-1">{resolvedIssues}</p>
          <span className="text-[11px] text-emerald-700 font-bold">Completed</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-mocha-200/90 shadow-subtle hover:border-mocha-300 transition-all">
          <p className="text-[10px] font-extrabold text-mocha-400 uppercase tracking-wider font-mono">
            Reopened
          </p>
          <p className="text-2xl font-extrabold font-mono text-mocha-800 mt-1">{reopenedIssues}</p>
          <span className="text-[11px] text-mocha-600 font-bold">Persisting</span>
        </div>
      </div>

      {/* Category Breakdown Chips */}
      <div className="p-5 bg-white rounded-3xl border border-mocha-200/90 shadow-subtle space-y-3">
        <h3 className="text-xs font-extrabold text-burgundy-950 uppercase tracking-wider font-mono">
          Pending Issues by Campus Sector
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {categoryCounts.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-mocha-200/80 bg-latte-100/70 text-xs font-semibold text-mocha-800"
            >
              <span>{cat.name}:</span>
              <span className="font-mono font-bold text-burgundy-950 bg-white px-2 py-0.5 rounded-lg border border-mocha-200 shadow-subtle">
                {cat.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Triage Table */}
      <div className="bg-white border border-mocha-200/90 rounded-3xl p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-mocha-100 pb-4">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-burgundy-950 tracking-tight">
              Rapid Incident Triage Queue
            </h3>
            <p className="text-xs text-mocha-600 font-medium">
              Directly assign personnel, update workflows, and inspect problem evidence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs font-bold border border-mocha-300/80 rounded-xl px-3 py-2 bg-mocha-50/60 text-mocha-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-burgundy-800/20"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-bold border border-mocha-300/80 rounded-xl px-3 py-2 bg-mocha-50/60 text-mocha-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-burgundy-800/20"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Reopened">Reopened</option>
            </select>
          </div>
        </div>

        {/* Triage Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-latte-100/90 text-mocha-600 font-mono font-extrabold uppercase text-[10px] tracking-wider border-b border-mocha-200/80">
              <tr>
                <th className="py-3 px-3.5">Ticket ID & Title</th>
                <th className="py-3 px-3.5">Priority / Endorsements</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Assigned Staff</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mocha-100 font-medium">
              {filteredTickets.map((tkt) => {
                const sBadge = getStatusBadgeStyle(tkt.status);
                const pBadge = getPriorityBadgeStyle(tkt.priority);

                return (
                  <tr key={tkt.id} className="hover:bg-latte-50/80 transition-colors">
                    <td className="py-3.5 px-3.5 max-w-[280px]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-[10px] font-bold text-mocha-700 bg-mocha-100 px-1.5 py-0.5 rounded border border-mocha-200/70">
                          {tkt.ticketNumber}
                        </span>
                        <span className="text-[11px] text-mocha-800 font-bold">
                          {tkt.category}
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenTicket(tkt)}
                        className="font-bold text-burgundy-950 hover:text-burgundy-700 truncate block text-left w-full text-xs sm:text-[13px] transition-colors"
                      >
                        {tkt.title}
                      </button>
                      <p className="text-[11px] text-mocha-500 truncate mt-0.5">{tkt.location}</p>
                    </td>

                    <td className="py-3.5 px-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md border mb-1 ${pBadge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${pBadge.dot}`}></span>
                        <span>{tkt.priority}</span>
                      </span>
                      <div className="text-[11px] text-burgundy-800 font-bold font-mono">
                        +{tkt.affectedCount} students
                      </div>
                    </td>

                    <td className="py-3.5 px-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${sBadge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${sBadge.dot}`}></span>
                        <span>{tkt.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3.5">
                      <select
                        value={tkt.assignedToStaffUid || ''}
                        onChange={(e) => {
                          const s = eligibleStaff.find((x) => x.uid === e.target.value);
                          if (s) onAssignStaff(tkt.id, s.uid, `${s.name} (${s.designation})`);
                        }}
                        className="text-xs bg-latte-50/70 hover:bg-white border border-mocha-200/90 rounded-xl px-2.5 py-1.5 font-medium text-mocha-800 max-w-[160px] cursor-pointer"
                      >
                        <option value="">Assign staff...</option>
                        {eligibleStaff.map((s) => (
                          <option key={s.uid} value={s.uid}>
                            {s.name} ({s.designation})
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-3.5 text-right">
                      <button
                        onClick={() => onOpenTicket(tkt)}
                        className="px-3 py-1.5 text-xs font-bold bg-latte-100 hover:bg-burgundy-900 hover:text-latte-50 text-burgundy-950 border border-mocha-200 rounded-xl transition-all inline-flex items-center gap-1 active:scale-95 shadow-subtle"
                      >
                        <span>Manage</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default StaffDashboard;
