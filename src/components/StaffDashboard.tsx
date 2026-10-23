import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Ticket, UserProfile, TicketCategory, TicketStatus } from '../types';
import { getStatusBadgeStyle, getPriorityBadgeStyle } from './TicketCard';
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

  // Compute live metrics strictly from database state!
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

  // Breakdown by category
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

  // Filtered queue for rapid operational triage
  const filteredTickets = tickets.filter((t) => {
    if (filterCategory !== 'All' && t.category !== filterCategory) return false;
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    return true;
  });

  const eligibleStaff = DEMO_USERS.filter((u) => u.role === 'Campus Staff');

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Staff Operations & Incident Triage
            </h2>
            <span className="text-[10px] font-mono uppercase bg-slate-900 text-teal-300 font-bold px-2 py-0.5 rounded">
              Role: {currentUser.role === 'Campus Staff' ? currentUser.designation : 'Admin'}
            </span>
            <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded">
              {totalTickets} Total Tickets
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time campus infrastructure metrics and rapid incident assignment queue.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-600 font-medium">Live Database Sync</span>
        </div>
      </div>

      {/* Operational Metrics Cards (Derived directly from actual data) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-subtle">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Open Issues
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{openIssues}</p>
          <span className="text-[10px] text-blue-600 font-medium">Active queue</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-subtle">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Unassigned
          </p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{awaitingAssignment}</p>
          <span className="text-[10px] text-amber-600 font-medium">Needs assignment</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-subtle">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            In Progress
          </p>
          <p className="text-2xl font-bold text-indigo-700 mt-1">{inProgressIssues}</p>
          <span className="text-[10px] text-indigo-600 font-medium">Under repair</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-subtle">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            High Priority
          </p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{criticalHighIssues}</p>
          <span className="text-[10px] text-rose-600 font-medium">Urgent dispatch</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-subtle">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Resolved
          </p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{resolvedIssues}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Total closed</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-subtle">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Reopened
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{reopenedIssues}</p>
          <span className="text-[10px] text-slate-500 font-medium">Audit tracked</span>
        </div>
      </div>

      {/* Category Breakdown Chips */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-subtle">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
          Active Issues by Category
        </h3>
        <div className="flex flex-wrap gap-2">
          {categoryCounts.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700"
            >
              <span className="font-medium">{cat.name}:</span>
              <span className="font-bold text-slate-900 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                {cat.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Triage Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Rapid Incident Triage Queue
            </h3>
            <p className="text-xs text-slate-500">
              Directly assign personnel, adjust statuses, and review resolution progress.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
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
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Ticket ID & Title</th>
                <th className="py-2.5 px-3">Priority / +1s</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Assigned Staff</th>
                <th className="py-2.5 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((tkt) => (
                <tr key={tkt.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 max-w-[280px]">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 rounded">
                        {tkt.ticketNumber}
                      </span>
                      <span className="text-[11px] text-slate-600 font-medium">
                        {tkt.category}
                      </span>
                    </div>
                    <button
                      onClick={() => onOpenTicket(tkt)}
                      className="font-semibold text-slate-900 hover:text-indigo-600 truncate block text-left w-full"
                    >
                      {tkt.title}
                    </button>
                    <p className="text-[11px] text-slate-400 truncate">{tkt.location}</p>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border mb-1 ${getPriorityBadgeStyle(
                        tkt.priority
                      )}`}
                    >
                      {tkt.priority}
                    </span>
                    <div className="text-[11px] text-teal-800 font-semibold">
                      +{tkt.affectedCount} students
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(
                        tkt.status
                      )}`}
                    >
                      {tkt.status}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <select
                      value={tkt.assignedToStaffUid || ''}
                      onChange={(e) => {
                        const s = eligibleStaff.find((x) => x.uid === e.target.value);
                        if (s) onAssignStaff(tkt.id, s.uid, `${s.name} (${s.designation})`);
                      }}
                      className="text-xs bg-slate-50 border border-slate-200 rounded p-1 max-w-[150px]"
                    >
                      <option value="">Assign staff...</option>
                      {eligibleStaff.map((s) => (
                        <option key={s.uid} value={s.uid}>
                          {s.name} ({s.designation})
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onOpenTicket(tkt)}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <span>Manage</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
