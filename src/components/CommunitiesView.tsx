import React, { useState } from 'react';
import {
  Users,
  Shield,
  Utensils,
  Wrench,
  Wifi,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Star,
  Award,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  X,
  Activity,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  FileText,
  UserCheck,
} from 'lucide-react';
import { Community, CommitteeMembership, UserProfile, Ticket } from '../types';
import { DEMO_USERS } from '../services/mockData';
import { getStatusBadgeStyle, getPriorityBadgeStyle, formatRelativeTime } from '../utils/formatters';

interface CommunitiesViewProps {
  communities: Community[];
  memberships: CommitteeMembership[];
  currentUser: UserProfile;
  tickets?: Ticket[];
  onOpenTicket?: (ticket: Ticket) => void;
  onProposeMembership: (membership: CommitteeMembership) => void;
  onReviewMembership: (membershipId: string, decision: 'Approved' | 'Rejected', reason?: string) => void;
}

export const CommunitiesView: React.FC<CommunitiesViewProps> = ({
  communities,
  memberships,
  currentUser,
  tickets = [],
  onOpenTicket,
  onProposeMembership,
  onReviewMembership,
}) => {
  // Modal for detailed community inspection (members & track record)
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [modalTab, setModalTab] = useState<'members' | 'track-record' | 'tickets' | 'nominate'>('members');

  // Proposal modal states
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState(communities[0]?.id || '');
  const [selectedUserUid, setSelectedUserUid] = useState(DEMO_USERS[0]?.uid || '');
  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const isAdmin = currentUser.role === 'Admin';
  const isWarden =
    currentUser.role === 'Campus Staff' &&
    (currentUser.designation === 'Warden' || currentUser.designation === 'Head Warden');
  const canReview = isWarden || isAdmin;

  const getCommunityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-amber-700" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-emerald-700" />;
      case 'Wifi':
        return <Wifi className="w-5 h-5 text-blue-700" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-red-700" />;
      default:
        return <Users className="w-5 h-5 text-purple-700" />;
    }
  };

  const handleProposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCommId = selectedCommunity ? selectedCommunity.id : selectedCommunityId;
    const comm = communities.find((c) => c.id === targetCommId);
    const targetUser = DEMO_USERS.find((u) => u.uid === selectedUserUid);
    if (!comm || !targetUser) return;

    const newMembership: CommitteeMembership = {
      id: `mem-${Date.now()}`,
      communityId: comm.id,
      communityName: comm.name,
      userUid: targetUser.uid,
      userName: targetUser.name,
      userEmail: targetUser.email,
      userRole: targetUser.role,
      status: 'Proposed',
      proposedByAdminUid: currentUser.uid,
      proposedAt: new Date().toISOString(),
    };

    onProposeMembership(newMembership);
    setShowProposeModal(false);
    if (selectedCommunity) {
      setModalTab('members');
    }
  };

  // Get active tickets for a community
  const getCommunityTickets = (commName: string) => {
    return tickets.filter((t) => {
      const q = commName.toLowerCase();
      return (
        t.category.toLowerCase().includes(q) ||
        (q.includes('maintenance') && t.category === 'Maintenance') ||
        (q.includes('mess') && t.category === 'Mess') ||
        (q.includes('internet') && t.category === 'Internet / Connectivity') ||
        (q.includes('security') && t.category === 'Security')
      );
    });
  };

  return (
    <div className="space-y-6 text-left pb-12 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* ---------------------------------------------------------------------- */}
      {/* 1. Top Banner                                                          */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-mocha-200/90 shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Campus Governance & Councils</span>
            </span>
            <span className="text-xs font-mono font-bold text-mocha-800 bg-mocha-100 px-2.5 py-0.5 rounded-lg border border-mocha-200">
              {communities.length} Active Committees
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mt-2">
            Communities, Wings & Student Leadership
          </h1>
          <p className="text-xs text-mocha-600 mt-1 font-medium">
            Click on any committee card to view its active council members, SLA resolution track record, and operational performance.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setSelectedCommunityId(communities[0]?.id || '');
              setShowProposeModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] hover:bg-[#22C55E] text-white text-xs font-extrabold rounded-2xl transition-all shadow-[0_4px_16px_rgba(22,163,74,0.3)] active:scale-95 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nominate Member</span>
          </button>
        )}
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. Interactive Community Cards Grid                                   */}
      {/* ---------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {communities.map((comm) => {
          const membersList = comm.members || [];
          const record = comm.trackRecord;

          return (
            <div
              key={comm.id}
              onClick={() => {
                setSelectedCommunity(comm);
                setModalTab('members');
              }}
              className="bg-white border border-mocha-200/90 hover:border-emerald-500 rounded-3xl p-5 sm:p-6 shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
            >
              <div className="space-y-3">
                {/* Header with Icon & Ticket Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-mocha-50 group-hover:bg-emerald-50 border border-mocha-100 group-hover:border-emerald-200 flex items-center justify-center shadow-subtle transition-colors">
                    {getCommunityIcon(comm.iconName)}
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
                    {comm.activeTicketCount} Active Issues
                  </span>
                </div>

                {/* Name & Description */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#15803D] transition-colors tracking-tight">
                    {comm.name}
                  </h3>
                  <p className="text-xs text-mocha-600 mt-1 leading-relaxed line-clamp-2">
                    {comm.description}
                  </p>
                </div>

                {/* Track Record Quick Preview */}
                {record && (
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="p-2.5 bg-mocha-50/70 rounded-xl border border-mocha-100">
                      <span className="text-[10px] uppercase font-mono font-bold text-mocha-500 block">
                        Resolved
                      </span>
                      <span className="text-xs font-extrabold text-gray-900 font-mono">
                        {record.totalResolved} Incidents
                      </span>
                    </div>
                    <div className="p-2.5 bg-mocha-50/70 rounded-xl border border-mocha-100">
                      <span className="text-[10px] uppercase font-mono font-bold text-mocha-500 block">
                        Rating / SLA
                      </span>
                      <span className="text-xs font-extrabold text-emerald-700 font-mono flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{record.satisfactionRating} • {record.slaComplianceRate}%</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* 5 Committee Members & Contact Numbers Roster */}
                <div className="pt-3 border-t border-mocha-100/90 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-gray-800 uppercase tracking-wider font-mono text-[10px] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#15803D]" />
                      Committee Members ({Math.min(membersList.length, 5)}):
                    </span>
                    <span className="text-[10px] text-[#15803D] font-bold">
                      Direct Contacts
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {membersList.slice(0, 5).map((m, idx) => (
                      <div
                        key={m.id || idx}
                        className="flex items-center justify-between p-1.5 sm:p-2 rounded-xl bg-mocha-50/70 border border-mocha-100 hover:bg-emerald-50/80 hover:border-emerald-200 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <img
                            src={m.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"}
                            alt={m.name}
                            className="w-6 h-6 rounded-full object-cover border border-mocha-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-gray-900 truncate block text-[11px] leading-tight">
                              {m.name}
                            </span>
                            <span className="text-[10px] text-mocha-500 font-medium truncate block leading-tight">
                              {m.role}
                            </span>
                          </div>
                        </div>

                        {/* Direct Contact Phone Number Badge */}
                        <a
                          href={`tel:${m.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0 flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 px-2 py-0.5 rounded-lg border border-emerald-300/60 transition-colors"
                          title={`Call ${m.name}`}
                        >
                          <Phone className="w-2.5 h-2.5 text-emerald-700" />
                          <span>{m.phone}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Lead info & Click Indicator */}
              <div className="mt-4 pt-3.5 border-t border-mocha-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-mocha-400 block font-mono">Lead Officer:</span>
                  <strong className="text-gray-900 text-xs">{comm.leadName || 'Assigned Staff'}</strong>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[#15803D] group-hover:translate-x-0.5 transition-transform">
                  <span>{membersList.length >= 5 ? `${membersList.length} Members` : `${comm.memberCount} Members`}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. Committee Governance & Warden Approvals Table                       */}
      {/* ---------------------------------------------------------------------- */}
      <div className="bg-white border border-mocha-200/90 rounded-3xl p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-mocha-100 pb-4">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
              Committee Nominations & Warden Approval Workflow
            </h3>
            <p className="text-xs text-mocha-600 font-medium mt-0.5">
              Administrators propose candidate representatives. Campus Wardens approve or reject with institutional audit notes.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-mocha-800 bg-mocha-100 px-3 py-1 rounded-xl self-start sm:self-auto border border-mocha-200/70">
            {memberships.length} Recorded Nominations
          </span>
        </div>

        {/* Memberships Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-mocha-50/80 text-mocha-600 font-mono font-extrabold uppercase text-[10px] tracking-wider border-b border-mocha-200">
              <tr>
                <th className="py-3 px-3.5">Candidate</th>
                <th className="py-3 px-3.5">Target Committee</th>
                <th className="py-3 px-3.5">Nomination Status</th>
                <th className="py-3 px-3.5">Date Submitted</th>
                <th className="py-3 px-3.5 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mocha-100 font-medium">
              {memberships.map((mem) => (
                <tr key={mem.id} className="hover:bg-mocha-50/60 transition-colors">
                  <td className="py-3.5 px-3.5">
                    <p className="font-bold text-gray-900 text-xs sm:text-[13px]">{mem.userName}</p>
                    <p className="text-[11px] text-mocha-500 font-mono">{mem.userEmail} ({mem.userRole})</p>
                  </td>
                  <td className="py-3.5 px-3.5">
                    <span className="font-bold text-gray-800">{mem.communityName}</span>
                  </td>
                  <td className="py-3.5 px-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-full text-[11px] border ${
                        mem.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : mem.status === 'Rejected'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {mem.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {mem.status === 'Rejected' && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                      {mem.status === 'Proposed' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      <span>{mem.status}</span>
                    </span>
                    {mem.rejectionReason && (
                      <p className="text-[11px] text-red-700 mt-1 font-medium">Note: {mem.rejectionReason}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-3.5 text-mocha-600 font-mono">
                    {new Date(mem.proposedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-3.5 text-right">
                    {mem.status === 'Proposed' ? (
                      canReview ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onReviewMembership(mem.id, 'Approved')}
                            className="px-3 py-1.5 bg-[#16A34A] hover:bg-[#22C55E] text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectionModalId(mem.id);
                              setRejectionReason('');
                            }}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-xl text-xs font-bold transition-all active:scale-95"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-mocha-500 italic font-medium">
                          Awaiting Warden Review
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] text-mocha-500 font-medium font-mono">
                        Decision Finalized
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 4. Deep Community Detail Modal (Members & Track Record)                */}
      {/* ---------------------------------------------------------------------- */}
      {selectedCommunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto animate-sonner">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-mocha-200 overflow-hidden my-6 max-h-[92vh] flex flex-col text-left">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-mocha-100 bg-white flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getCommunityIcon(selectedCommunity.iconName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                      {selectedCommunity.name}
                    </h2>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {selectedCommunity.activeTicketCount} Active
                    </span>
                  </div>
                  <p className="text-xs text-mocha-600 mt-0.5">
                    {selectedCommunity.description}
                  </p>
                  <p className="text-[11px] text-mocha-700 font-mono mt-1">
                    Lead: <strong className="text-gray-900">{selectedCommunity.leadName}</strong> ({selectedCommunity.leadRole || 'Lead Supervisor'}) • {selectedCommunity.leadContact || 'Campus Ext.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCommunity(null)}
                className="p-2 text-mocha-400 hover:text-gray-700 rounded-xl hover:bg-mocha-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs inside Modal */}
            <div className="px-5 sm:px-6 pt-3 bg-mocha-50/60 border-b border-mocha-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setModalTab('members')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                  modalTab === 'members'
                    ? 'border-emerald-600 text-emerald-800 bg-white'
                    : 'border-transparent text-mocha-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Committee Members ({selectedCommunity.members?.length || selectedCommunity.memberCount})</span>
              </button>

              <button
                onClick={() => setModalTab('track-record')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                  modalTab === 'track-record'
                    ? 'border-emerald-600 text-emerald-800 bg-white'
                    : 'border-transparent text-mocha-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Track Record & SLA</span>
              </button>

              <button
                onClick={() => setModalTab('tickets')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                  modalTab === 'tickets'
                    ? 'border-emerald-600 text-emerald-800 bg-white'
                    : 'border-transparent text-mocha-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Active Queue ({getCommunityTickets(selectedCommunity.name).length})</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setModalTab('nominate')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                    modalTab === 'nominate'
                      ? 'border-emerald-600 text-emerald-800 bg-white'
                      : 'border-transparent text-mocha-600 hover:text-gray-900'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nominate Member</span>
                </button>
              )}
            </div>

            {/* Modal Body Content */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-mocha-50/30">
              
              {/* TAB 1: MEMBERS LIST (Min 5+ Members) */}
              {modalTab === 'members' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Official Council Members & Student Representatives
                      </h3>
                      <p className="text-xs text-mocha-600">
                        Active faculty advisors, student wing leads, and specialized technicians.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {selectedCommunity.members?.length || 6} Appointed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(selectedCommunity.members || []).map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 bg-white rounded-2xl border border-mocha-200/90 shadow-subtle flex items-start gap-3 hover:border-emerald-300 transition-colors"
                      >
                        <div className="relative">
                          <img
                            src={m.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                            alt={m.name}
                            className="w-11 h-11 rounded-full object-cover border border-mocha-200"
                          />
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-gray-900 truncate">{m.name}</h4>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-mocha-100 text-mocha-700">
                              {m.userType}
                            </span>
                          </div>

                          <p className="text-[11px] font-bold text-[#15803D] mt-0.5 truncate">
                            {m.role}
                          </p>

                          <div className="mt-2.5 space-y-1.5 text-[10px] text-mocha-600 font-medium">
                            {/* Prominent Direct Contact Phone Badge */}
                            <a
                              href={`tel:${m.phone}`}
                              className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#15803D] font-mono font-bold text-xs transition-colors"
                            >
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                                <span>{m.phone}</span>
                              </div>
                              <span className="text-[10px] font-sans font-semibold text-emerald-800 bg-emerald-200/60 px-1.5 py-0.5 rounded">
                                Call / SMS
                              </span>
                            </a>

                            <div className="flex items-center gap-1 truncate pt-0.5">
                              <MapPin className="w-3 h-3 text-mocha-400 flex-shrink-0" />
                              <span className="truncate">{m.roomOrOffice}</span>
                            </div>
                            <div className="flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 text-mocha-400 flex-shrink-0" />
                              <span className="truncate">{m.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: TRACK RECORD & PERFORMANCE */}
              {modalTab === 'track-record' && (
                <div className="space-y-5">
                  {/* KPI Cards */}
                  {selectedCommunity.trackRecord && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-4 bg-white rounded-2xl border border-mocha-200 shadow-subtle">
                        <span className="text-[10px] font-bold text-mocha-400 uppercase font-mono block">
                          Total Solved
                        </span>
                        <p className="text-2xl font-extrabold font-mono text-gray-900 mt-1">
                          {selectedCommunity.trackRecord.totalResolved}
                        </p>
                        <span className="text-[10px] font-bold text-emerald-700">Fixed & Verified</span>
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-mocha-200 shadow-subtle">
                        <span className="text-[10px] font-bold text-mocha-400 uppercase font-mono block">
                          Avg Turnaround
                        </span>
                        <p className="text-2xl font-extrabold font-mono text-gray-900 mt-1">
                          {selectedCommunity.trackRecord.avgTurnaroundHours}h
                        </p>
                        <span className="text-[10px] font-bold text-emerald-700">⚡ Fast Dispatch</span>
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-mocha-200 shadow-subtle">
                        <span className="text-[10px] font-bold text-mocha-400 uppercase font-mono block">
                          SLA Compliance
                        </span>
                        <p className="text-2xl font-extrabold font-mono text-emerald-800 mt-1">
                          {selectedCommunity.trackRecord.slaComplianceRate}%
                        </p>
                        <span className="text-[10px] font-bold text-emerald-700">On-time SLA</span>
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-mocha-200 shadow-subtle">
                        <span className="text-[10px] font-bold text-mocha-400 uppercase font-mono block">
                          Student Rating
                        </span>
                        <p className="text-2xl font-extrabold font-mono text-amber-700 mt-1 flex items-center gap-1">
                          <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                          <span>{selectedCommunity.trackRecord.satisfactionRating}</span>
                        </p>
                        <span className="text-[10px] font-bold text-mocha-600">Out of 5.0</span>
                      </div>
                    </div>
                  )}

                  {/* Key Achievements */}
                  {selectedCommunity.trackRecord?.keyAchievements && (
                    <div className="p-5 bg-white rounded-2xl border border-mocha-200 shadow-subtle space-y-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-700" />
                        <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider font-mono">
                          Key Milestone Achievements & Audit Deliverables
                        </h4>
                      </div>

                      <ul className="space-y-2">
                        {selectedCommunity.trackRecord.keyAchievements.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></span>
                            <span className="leading-relaxed font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Governance Charter Note */}
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 leading-relaxed font-medium">
                    <strong className="block font-bold mb-0.5">Council Charter & Operational Jurisdiction:</strong>
                    This committee operates under the direct oversight of the Chief Warden and Dean of Student Welfare. Representatives meet bi-weekly to review unresolved infrastructure faults and budget allocations.
                  </div>
                </div>
              )}

              {/* TAB 3: TICKETS QUEUE */}
              {modalTab === 'tickets' && (
                <div className="space-y-3">
                  {getCommunityTickets(selectedCommunity.name).length === 0 ? (
                    <div className="p-10 text-center text-mocha-500 space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                      <p className="text-sm font-bold text-gray-900">Zero Active Escalations</p>
                      <p className="text-xs text-mocha-500">
                        All logged complaints for {selectedCommunity.name} have been repaired and signed off!
                      </p>
                    </div>
                  ) : (
                    getCommunityTickets(selectedCommunity.name).map((tkt) => {
                      const sBadge = getStatusBadgeStyle(tkt.status);
                      const pBadge = getPriorityBadgeStyle(tkt.priority);

                      return (
                        <div
                          key={tkt.id}
                          className="p-4 bg-white rounded-2xl border border-mocha-200 shadow-subtle flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-mocha-800 bg-mocha-100 px-1.5 py-0.2 rounded">
                                {tkt.ticketNumber}
                              </span>
                              <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.2 rounded-md ${pBadge.bg}`}>
                                {tkt.priority}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${sBadge.bg}`}>
                                {tkt.status}
                              </span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{tkt.title}</h4>
                            <p className="text-[11px] text-mocha-500">{tkt.location} • {formatRelativeTime(tkt.createdAt)}</p>
                          </div>

                          {onOpenTicket && (
                            <button
                              onClick={() => {
                                onOpenTicket(tkt);
                                setSelectedCommunity(null);
                              }}
                              className="px-3 py-1.5 text-xs font-bold bg-[#16A34A] hover:bg-[#22C55E] text-white rounded-xl transition-all shadow-sm flex items-center gap-1 flex-shrink-0"
                            >
                              <span>Inspect</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 4: NOMINATE MEMBER (ADMIN) */}
              {modalTab === 'nominate' && (
                <div className="p-5 bg-white rounded-2xl border border-mocha-200 shadow-subtle space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Nominate Member to {selectedCommunity.name}
                    </h3>
                    <p className="text-xs text-mocha-600 mt-0.5">
                      Select a student or campus staff persona. Nomination will be submitted to the Chief Warden for audit review.
                    </p>
                  </div>

                  <form onSubmit={handleProposeSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Candidate Persona:
                      </label>
                      <select
                        value={selectedUserUid}
                        onChange={(e) => setSelectedUserUid(e.target.value)}
                        className="w-full text-xs p-3 border border-mocha-200 rounded-xl bg-mocha-50/50 font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      >
                        {DEMO_USERS.map((u) => (
                          <option key={u.uid} value={u.uid}>
                            {u.name} ({u.role}{u.roomNumber ? ` - Room ${u.roomNumber}` : ''})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#16A34A] hover:bg-[#22C55E] text-white text-xs font-extrabold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        Submit Nomination for Warden Review
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-mocha-100 bg-white flex items-center justify-between">
              <span className="text-xs text-mocha-500 font-mono">
                Institutional ID: {selectedCommunity.id}
              </span>
              <button
                onClick={() => setSelectedCommunity(null)}
                className="px-4 py-2 text-xs font-bold bg-mocha-100 hover:bg-mocha-200 text-gray-800 rounded-xl transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 5. Standalone Propose Modal (from Header Button)                       */}
      {/* ---------------------------------------------------------------------- */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-sonner">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-mocha-200 text-left">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                Nominate Committee Representative
              </h3>
              <button onClick={() => setShowProposeModal(false)} className="text-mocha-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-mocha-600 mb-4 font-medium">
              Nominate a campus representative for Warden review and permanent audit record.
            </p>

            <form onSubmit={handleProposeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  Candidate Persona:
                </label>
                <select
                  value={selectedUserUid}
                  onChange={(e) => setSelectedUserUid(e.target.value)}
                  className="w-full text-xs p-3 border border-mocha-200 rounded-xl bg-mocha-50/50 font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  {DEMO_USERS.map((u) => (
                    <option key={u.uid} value={u.uid}>
                      {u.name} ({u.role}{u.roomNumber ? ` - Room ${u.roomNumber}` : ''})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5">
                  Target Committee Board:
                </label>
                <select
                  value={selectedCommunityId}
                  onChange={(e) => setSelectedCommunityId(e.target.value)}
                  className="w-full text-xs p-3 border border-mocha-200 rounded-xl bg-mocha-50/50 font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  {communities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-mocha-100">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="px-4 py-2 text-xs font-bold text-mocha-700 hover:bg-mocha-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-[#16A34A] text-white font-extrabold rounded-xl hover:bg-[#22C55E] transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  Submit Nomination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 6. Rejection Note Modal                                                */}
      {/* ---------------------------------------------------------------------- */}
      {rejectionModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-sonner">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 border border-mocha-200 shadow-2xl text-left">
            <h4 className="text-sm font-extrabold text-gray-900 mb-1 tracking-tight">Reason for Rejection</h4>
            <p className="text-xs text-mocha-600 mb-3.5 font-medium">Record a justification for the permanent institutional audit trail:</p>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Current semester disciplinary warning recorded."
              className="w-full text-xs p-3 border border-mocha-200 rounded-xl mb-4 focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectionModalId(null)}
                className="px-3.5 py-2 text-xs font-bold text-mocha-700 hover:bg-mocha-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onReviewMembership(rejectionModalId, 'Rejected', rejectionReason.trim());
                  setRejectionModalId(null);
                }}
                className="px-4 py-2 text-xs bg-red-700 text-white font-extrabold rounded-xl hover:bg-red-800 transition-all active:scale-95"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunitiesView;
