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
        return <Utensils className="w-5 h-5 text-amber-700" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-mocha-700" />;
      case 'Wifi':
        return <Wifi className="w-5 h-5 text-mocha-600" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-burgundy-700" />;
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-burgundy-800" />;
      default:
        return <Users className="w-5 h-5 text-mocha-600" />;
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
    <div className="space-y-6 text-left pb-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-mocha-200/90 shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-burgundy-950 tracking-tight">
              Campus Communities & Student Committees
            </h2>
            <span className="text-[10px] font-mono font-bold bg-mocha-100 text-mocha-800 px-2.5 py-0.5 rounded-full border border-mocha-200">
              5 Sectors
            </span>
          </div>
          <p className="text-xs text-mocha-700 mt-1 font-medium">
            Student leadership bodies, warden-reviewed nominations, and facilities coordination.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowProposeModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-burgundy-900 hover:bg-burgundy-800 text-latte-50 text-xs font-extrabold rounded-2xl transition-all shadow-[0_4px_16px_rgba(37,3,9,0.25)] active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-mocha-300 stroke-[2.5]" />
            <span>Propose Committee Member</span>
          </button>
        )}
      </div>

      {/* Community Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {communities.map((comm) => (
          <div
            key={comm.id}
            className="bg-white border border-mocha-200/90 rounded-3xl p-5 sm:p-6 shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-11 h-11 rounded-2xl bg-mocha-50 border border-mocha-100 flex items-center justify-center shadow-subtle">
                  {getCommunityIcon(comm.iconName)}
                </div>
                <span className="text-xs font-mono font-bold text-burgundy-900 bg-burgundy-50 px-2.5 py-0.5 rounded-full border border-burgundy-200/60">
                  {comm.activeTicketCount} Active Tickets
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-extrabold text-burgundy-950 tracking-tight">{comm.name}</h3>
              <p className="text-xs text-mocha-800 mt-1.5 leading-relaxed font-medium min-h-[36px]">
                {comm.description}
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-mocha-100 flex items-center justify-between text-xs text-mocha-600 font-medium">
              <span>Lead: <strong className="text-burgundy-950">{comm.leadName || 'Assigned Staff'}</strong></span>
              <span className="font-mono text-mocha-800 bg-mocha-100 px-2 py-0.5 rounded-md text-[11px] font-bold">
                {comm.memberCount} Members
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Committee Governance & Approvals Section */}
      <div className="bg-white border border-mocha-200/90 rounded-3xl p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-mocha-100 pb-4">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-burgundy-950 tracking-tight">
              Committee Nominations & Warden Approval Workflow
            </h3>
            <p className="text-xs text-mocha-700 font-medium mt-0.5">
              Administrators propose eligible representatives. Campus Wardens approve or reject with audit notes.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-mocha-800 bg-mocha-100 px-3 py-1 rounded-xl self-start sm:self-auto border border-mocha-200/70">
            {memberships.length} Recorded Nominations
          </span>
        </div>

        {/* Memberships Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-mocha-50/80 text-mocha-600 font-mono font-extrabold uppercase text-[10px] tracking-wider border-b border-mocha-200/80">
              <tr>
                <th className="py-3 px-3.5">Candidate</th>
                <th className="py-3 px-3.5">Target Committee</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Nominated Date</th>
                <th className="py-3 px-3.5 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mocha-100 font-medium">
              {memberships.map((mem) => (
                <tr key={mem.id} className="hover:bg-mocha-50/60 transition-colors">
                  <td className="py-3.5 px-3.5">
                    <p className="font-bold text-burgundy-950 text-xs sm:text-[13px]">{mem.userName}</p>
                    <p className="text-[11px] text-mocha-500 font-mono">{mem.userEmail} ({mem.userRole})</p>
                  </td>
                  <td className="py-3.5 px-3.5">
                    <span className="font-bold text-mocha-900">{mem.communityName}</span>
                  </td>
                  <td className="py-3.5 px-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-full text-[11px] border ${
                        mem.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : mem.status === 'Rejected'
                          ? 'bg-burgundy-50 text-burgundy-900 border-burgundy-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {mem.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {mem.status === 'Rejected' && <XCircle className="w-3.5 h-3.5 text-burgundy-700" />}
                      {mem.status === 'Proposed' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      <span>{mem.status}</span>
                    </span>
                    {mem.rejectionReason && (
                      <p className="text-[11px] text-burgundy-800 mt-1 font-medium">Note: {mem.rejectionReason}</p>
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
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-subtle"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectionModalId(mem.id);
                              setRejectionReason('');
                            }}
                            className="px-3 py-1.5 bg-burgundy-50 hover:bg-burgundy-100 text-burgundy-800 border border-burgundy-200 rounded-xl text-xs font-bold transition-all active:scale-95"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-mocha-500 italic font-medium">
                          Awaiting Warden Approval
                        </span>
                      )
                    ) : (
                      <span className="text-[11px] text-mocha-500 font-medium font-mono">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-burgundy-950/60 backdrop-blur-md animate-sonner">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-elevated border border-mocha-200">
            <h3 className="text-base font-extrabold text-burgundy-950 mb-1 tracking-tight">
              Propose Committee Candidate
            </h3>
            <p className="text-xs text-mocha-700 mb-4 font-medium">
              Nominate a campus representative for Warden review and permanent audit record.
            </p>

            <form onSubmit={handleProposeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-mocha-900 mb-1.5">
                  Candidate Persona:
                </label>
                <select
                  value={selectedUserUid}
                  onChange={(e) => setSelectedUserUid(e.target.value)}
                  className="w-full text-xs p-3 border border-mocha-200 rounded-2xl bg-mocha-50/50 focus:ring-2 focus:ring-burgundy-700/20 focus:border-burgundy-700 font-medium cursor-pointer text-mocha-900"
                >
                  {DEMO_USERS.map((u) => (
                    <option key={u.uid} value={u.uid}>
                      {u.name} ({u.role}{u.roomNumber ? ` - ${u.roomNumber}` : ''})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-mocha-900 mb-1.5">
                  Target Committee Board:
                </label>
                <select
                  value={selectedCommunityId}
                  onChange={(e) => setSelectedCommunityId(e.target.value)}
                  className="w-full text-xs p-3 border border-mocha-200 rounded-2xl bg-mocha-50/50 focus:ring-2 focus:ring-burgundy-700/20 focus:border-burgundy-700 font-medium cursor-pointer"
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
                  className="px-4 py-2 text-xs bg-burgundy-900 text-latte-50 font-extrabold rounded-xl hover:bg-burgundy-800 transition-all active:scale-95 shadow-sm"
                >
                  Submit Nomination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Note Modal */}
      {rejectionModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-burgundy-950/60 backdrop-blur-md animate-sonner">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 border border-mocha-200 shadow-elevated">
            <h4 className="text-sm font-extrabold text-burgundy-950 mb-1 tracking-tight">Reason for Rejection</h4>
            <p className="text-xs text-mocha-700 mb-3.5 font-medium">Record a justification for the permanent institutional audit trail:</p>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Current semester disciplinary warning recorded."
              className="w-full text-xs p-3 border border-mocha-200 rounded-2xl mb-4 focus:ring-2 focus:ring-burgundy-700/20 focus:border-burgundy-700"
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
                className="px-4 py-2 text-xs bg-burgundy-900 text-latte-50 font-extrabold rounded-xl hover:bg-burgundy-800 transition-all active:scale-95"
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
