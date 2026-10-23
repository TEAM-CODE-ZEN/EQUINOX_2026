import React, { useState } from 'react';
import {
  Users,
  Shield,
  Utensils,
  Wrench,
  Wifi,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
} from 'lucide-react';
import { Community, CommitteeMembership, UserProfile } from '../types';
import { DEMO_USERS } from '../services/mockData';

interface CommunitiesViewProps {
  communities: Community[];
  memberships: CommitteeMembership[];
  currentUser: UserProfile;
  onProposeMembership: (membership: CommitteeMembership) => void;
  onReviewMembership: (membershipId: string, decision: 'Approved' | 'Rejected', reason?: string) => void;
}

export const CommunitiesView: React.FC<CommunitiesViewProps> = ({
  communities,
  memberships,
  currentUser,
  onProposeMembership,
  onReviewMembership,
}) => {
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
        return <Utensils className="w-5 h-5 text-amber-600" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-blue-600" />;
      case 'Wifi':
        return <Wifi className="w-5 h-5 text-indigo-600" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-teal-600" />;
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      default:
        return <Users className="w-5 h-5 text-slate-600" />;
    }
  };

  const handleProposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const comm = communities.find((c) => c.id === selectedCommunityId);
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
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Campus Communities & Student Committees
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Departmental boards, student governance, and verified committee nominations.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowProposeModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-teal-400" />
            <span>Propose Committee Member</span>
          </button>
        )}
      </div>

      {/* Community Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {communities.map((comm) => (
          <div
            key={comm.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-subtle hover:shadow-card transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                {getCommunityIcon(comm.iconName)}
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
                {comm.activeTicketCount} Active Tickets
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900">{comm.name}</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed min-h-[36px]">
              {comm.description}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Lead: <strong className="text-slate-800">{comm.leadName || 'Assigned Staff'}</strong></span>
              <span>{comm.memberCount} Members</span>
            </div>
          </div>
        ))}
      </div>

      {/* Committee Governance & Approvals Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Committee Nominations & Approvals Workflow
            </h3>
            <p className="text-xs text-slate-500">
              Admin proposes eligible students/staff. Wardens review and approve with audit logging.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            {memberships.length} Nominations Recorded
          </span>
        </div>

        {/* Memberships Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Candidate</th>
                <th className="py-2.5 px-3">Committee</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Nominated Date</th>
                <th className="py-2.5 px-3 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {memberships.map((mem) => (
                <tr key={mem.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-semibold text-slate-900">{mem.userName}</p>
                    <p className="text-[10px] text-slate-500">{mem.userEmail} ({mem.userRole})</p>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-800">{mem.communityName}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[11px] border ${
                        mem.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : mem.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {mem.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                      {mem.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                      {mem.status === 'Proposed' && <Clock className="w-3 h-3" />}
                      {mem.status}
                    </span>
                    {mem.rejectionReason && (
                      <p className="text-[10px] text-rose-600 mt-0.5">Note: {mem.rejectionReason}</p>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {new Date(mem.proposedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {mem.status === 'Proposed' ? (
                      canReview ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onReviewMembership(mem.id, 'Approved')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectionModalId(mem.id);
                              setRejectionReason('');
                            }}
                            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded font-medium transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Awaiting Warden Review
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        Decision Recorded
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Propose Modal */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-elevated border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Propose Committee Membership
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select student or staff candidate for Warden approval.
            </p>

            <form onSubmit={handleProposeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Candidate User:
                </label>
                <select
                  value={selectedUserUid}
                  onChange={(e) => setSelectedUserUid(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  {DEMO_USERS.map((u) => (
                    <option key={u.uid} value={u.uid}>
                      {u.name} ({u.role}{u.roomNumber ? ` - ${u.roomNumber}` : ''})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Committee:
                </label>
                <select
                  value={selectedCommunityId}
                  onChange={(e) => setSelectedCommunityId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  {communities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800"
                >
                  Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Note Modal */}
      {rejectionModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-sm w-full p-4 border border-slate-200 shadow-elevated">
            <h4 className="text-xs font-bold text-slate-900 mb-1">Reason for Rejection</h4>
            <p className="text-[11px] text-slate-500 mb-3">Provide a brief justification for the audit trail:</p>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Minimum semester attendance requirement not met."
              className="w-full text-xs p-2 border border-slate-300 rounded-lg mb-3"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectionModalId(null)}
                className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onReviewMembership(rejectionModalId, 'Rejected', rejectionReason.trim());
                  setRejectionModalId(null);
                }}
                className="px-3 py-1 text-xs bg-rose-600 text-white font-semibold rounded hover:bg-rose-500"
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
