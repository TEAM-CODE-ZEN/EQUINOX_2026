import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Send,
  MessageSquare,
  ThumbsUp,
  RotateCcw,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import {
  Ticket,
  TicketComment,
  TicketHistoryEvent,
  UserProfile,
  TicketStatus,
  TicketPriority,
} from '../types';
import { formatRelativeTime } from '../utils/formatters';
import { DEMO_USERS } from '../services/mockData';
import { AI_FEATURES } from '../features/ai/config';
import { InvestigatorTab } from '../features/ai/components/InvestigatorTab';
import { ResolutionVerificationModal } from '../features/ai/components/ResolutionVerificationModal';
import { StudentVerificationCard } from '../features/ai/components/StudentVerificationCard';
import { ResolutionVerificationResult } from '../features/ai/types';

interface TicketDetailModalProps {
  ticket: Ticket;
  onClose: () => void;
  currentUser: UserProfile;
  comments: TicketComment[];
  history: TicketHistoryEvent[];
  onAddComment: (content: string, isInternal: boolean) => void;
  onUpdateStatus: (status: TicketStatus, resolutionNotes?: string) => void;
  onAssignStaff: (staffUid: string, staffName: string) => void;
  onToggleEndorse: (ticketId: string) => void;
  onReopenTicket: (reason: string) => void;
  allTickets?: Ticket[];
  onUpdateTicket?: (updatedTicket: Ticket) => void;
  onSelectSimilarTicket?: (ticketId: string) => void;
  rootCauseClusterTitle?: string;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  onClose,
  currentUser,
  comments,
  history,
  onAddComment,
  onUpdateStatus,
  onAssignStaff,
  onToggleEndorse,
  onReopenTicket,
  allTickets = [],
  onUpdateTicket,
  onSelectSimilarTicket,
  rootCauseClusterTitle,
}) => {
  const [activeModalTab, setActiveModalTab] = useState<'overview' | 'investigator'>('overview');
  const [newCommentText, setNewCommentText] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [showAiVerificationModal, setShowAiVerificationModal] = useState(false);

  const isStaffOrAdmin =
    currentUser.role === 'Campus Staff' || currentUser.role === 'Admin';
  const hasEndorsed = ticket.endorsedUserIds?.includes(currentUser.uid);
  const isCombined = ticket.affectedCount > 1;

  // Filter comments: students do NOT see internal notes
  const visibleComments = comments.filter(
    (c) => !c.isInternal || isStaffOrAdmin
  );

  const eligibleStaff = DEMO_USERS.filter((u) => u.role === 'Campus Staff');

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(newCommentText.trim(), false);
    setNewCommentText('');
  };

  const handleResolveSubmit = () => {
    if (!resolutionNotes.trim()) return;
    onUpdateStatus('Resolved', resolutionNotes.trim());
    setShowResolveModal(false);
    setResolutionNotes('');
  };

  const handleReopenSubmit = () => {
    if (!reopenReason.trim()) return;
    onReopenTicket(reopenReason.trim());
    setShowReopenModal(false);
    setReopenReason('');
  };

  // Feature C: Handle AI verification completion
  const handleAiVerificationComplete = (
    updatedStatus: TicketStatus,
    afterImage: string,
    resolutionNote: string,
    verification: ResolutionVerificationResult
  ) => {
    const updatedTicket: Ticket = {
      ...ticket,
      status: updatedStatus,
      afterImage,
      resolutionNote,
      resolutionNotes: resolutionNote,
      verification,
      updatedAt: new Date().toISOString(),
    };
    if (onUpdateTicket) {
      onUpdateTicket(updatedTicket);
    } else {
      onUpdateStatus(updatedStatus, resolutionNote);
    }
    setShowAiVerificationModal(false);
  };

  const handleEscalateToAdmin = (escalationReason: string) => {
    const updatedTicket: Ticket = {
      ...ticket,
      status: 'Under Review',
      priority: 'High',
      updatedAt: new Date().toISOString(),
    };
    onAddComment(`[AI Verification Notice] Verification failed or inconclusive: ${escalationReason}. Escalated to campus administration for manual inspection.`, true);
    if (onUpdateTicket) {
      onUpdateTicket(updatedTicket);
    } else {
      onUpdateStatus('Under Review', escalationReason);
    }
  };

  // Feature C: Student confirms fix
  const handleConfirmFixed = () => {
    const updatedTicket: Ticket = {
      ...ticket,
      status: 'Resolved',
      updatedAt: new Date().toISOString(),
      verification: ticket.verification
        ? {
            ...ticket.verification,
            studentConfirmation: {
              confirmed: true,
              confirmedAt: new Date().toISOString(),
            },
          }
        : undefined,
    };
    if (onUpdateTicket) {
      onUpdateTicket(updatedTicket);
    } else {
      onUpdateStatus('Resolved');
    }
  };

  // Feature C: Student rejects fix
  const handleRejectFixed = (reason: string) => {
    const priorityMap: Record<TicketPriority, TicketPriority> = {
      Low: 'Medium',
      Medium: 'High',
      High: 'Critical',
      Critical: 'Critical',
    };
    const nextPriority = priorityMap[ticket.priority] || 'High';

    const updatedTicket: Ticket = {
      ...ticket,
      status: 'Reopened',
      priority: nextPriority,
      reopenCount: (ticket.reopenCount || 0) + 1,
      updatedAt: new Date().toISOString(),
      verification: ticket.verification
        ? {
            ...ticket.verification,
            studentConfirmation: {
              confirmed: false,
              comment: reason,
              confirmedAt: new Date().toISOString(),
            },
          }
        : undefined,
    };
    onAddComment(`[Student Resolution Rejection] ${reason}`, false);
    if (onUpdateTicket) {
      onUpdateTicket(updatedTicket);
    } else {
      onReopenTicket(reason);
    }
  };

  const getStepStatus = () => {
    if (ticket.status === 'Resolved') return 3;
    if (ticket.status === 'Awaiting Student Confirmation' || ticket.status === 'Pending Verification') return 2;
    if (ticket.status === 'In Progress' || ticket.assignedStaffName) return 2;
    return 1;
  };

  const getPriorityBadge = (t: Ticket) => {
    const isHigh =
      t.affectedCount >= 5 ||
      t.reopenCount > 0 ||
      t.priority === 'Critical' ||
      t.priority === 'High';

    if (isHigh) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          <span className="w-2 h-2 rounded-full bg-red-600"></span>
          High Priority
        </span>
      );
    }

    const isModerate = t.affectedCount >= 2 || t.priority === 'Medium';
    if (isModerate) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Moderate
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
        Normal
      </span>
    );
  };

  const currentStep = getStepStatus();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto animate-sonner">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-mocha-200/90 overflow-hidden my-6 max-h-[90vh] flex flex-col text-left">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-mocha-100 bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#15803D] bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/80">
                  {ticket.category}
                </span>

                {ticket.status === 'Resolved' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-900 border border-green-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                    Fixed
                  </span>
                ) : ticket.status === 'In Progress' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Working on it
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Reported
                  </span>
                )}

                {getPriorityBadge(ticket)}
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight leading-snug">
                {ticket.title}
              </h2>

              {/* Location & Time */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-mocha-700 font-medium">
                <span className="flex items-center gap-1 text-mocha-800">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{ticket.location}</span>
                </span>
                <span>•</span>
                <span className="text-mocha-500">
                  Reported {formatRelativeTime(ticket.createdAt)}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-mocha-400 hover:text-mocha-700 rounded-xl hover:bg-mocha-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Simple Visual 3-Stage Progress Timeline */}
          <div className="mt-5 pt-4 border-t border-mocha-100">
            <div className="grid grid-cols-3 gap-2 relative">
              <div className="text-center">
                <div
                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep >= 1
                      ? 'bg-[#16A34A] text-white shadow-sm'
                      : 'bg-mocha-100 text-mocha-400'
                  }`}
                >
                  1
                </div>
                <span className="text-[11px] font-bold text-gray-800 mt-1 block">
                  Reported
                </span>
              </div>

              <div className="text-center">
                <div
                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep >= 2
                      ? 'bg-[#16A34A] text-white shadow-sm'
                      : 'bg-mocha-100 text-mocha-400'
                  }`}
                >
                  2
                </div>
                <span className="text-[11px] font-bold text-gray-800 mt-1 block">
                  In Progress
                </span>
              </div>

              <div className="text-center">
                <div
                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === 3
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-mocha-100 text-mocha-400'
                  }`}
                >
                  3
                </div>
                <span className="text-[11px] font-bold text-gray-800 mt-1 block">
                  Resolved
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Segmented Tabs (Overview vs AI Investigator) - Management / Admin Only */}
        {AI_FEATURES.investigator && isStaffOrAdmin && (
          <div className="px-5 sm:px-6 pt-2 pb-0 bg-white flex items-center gap-3 border-b border-mocha-100 flex-shrink-0">
            <button
              onClick={() => setActiveModalTab('overview')}
              className={`pb-2.5 px-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeModalTab === 'overview'
                  ? 'border-[#15803D] text-[#15803D]'
                  : 'border-transparent text-mocha-600 hover:text-gray-900'
              }`}
            >
              Overview & Messages
            </button>
            <button
              onClick={() => setActiveModalTab('investigator')}
              className={`pb-2.5 px-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeModalTab === 'investigator'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-mocha-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Investigator</span>
              {ticket.investigation?.report && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
              )}
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-mocha-50/30">
          {activeModalTab === 'investigator' && AI_FEATURES.investigator && isStaffOrAdmin ? (
            <InvestigatorTab
              ticket={ticket}
              allTickets={allTickets}
              currentUser={currentUser}
              onUpdateTicket={onUpdateTicket || (() => {})}
              onSelectSimilarTicket={onSelectSimilarTicket}
              onAddComment={onAddComment}
              rootCauseClusterTitle={rootCauseClusterTitle}
            />
          ) : (
            <>
              {/* Student Resolution Verification Card (Feature C) */}
              {AI_FEATURES.verification &&
                (ticket.status === 'Awaiting Student Confirmation' ||
                  ticket.status === 'Pending Verification' ||
                  (ticket.verification && ticket.status !== 'Resolved')) && (
                  <StudentVerificationCard
                    ticket={ticket}
                    currentUserUid={currentUser.uid}
                    onConfirmFixed={handleConfirmFixed}
                    onRejectFixed={handleRejectFixed}
                  />
              )}

              {/* Root Cause Link Card if present */}
              {ticket.rootCauseId && (
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-3 shadow-subtle">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-800 flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-indigo-700" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-indigo-700 block">
                        Systemic Root-Cause Linked
                      </span>
                      <span className="text-xs font-bold text-indigo-950">
                        {rootCauseClusterTitle || `Part of root cause cluster #${ticket.rootCauseId}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Status Update Banner */}
          {ticket.status === 'Resolved' ? (
            <div className="p-4 rounded-2xl bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-700" />
                <span className="text-xs font-bold text-green-950 uppercase tracking-wider font-mono">
                  Fixed & Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-green-900 leading-relaxed font-medium">
                {ticket.resolutionNotes || 'Campus maintenance has inspected and fixed this issue.'}
              </p>
            </div>
          ) : ticket.assignedStaffName ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 flex-shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-950 block">
                    Maintenance In Progress
                  </span>
                  <span className="text-xs text-amber-900 font-medium">
                    Assigned to: <strong className="font-bold">{ticket.assignedStaffName}</strong>
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* AI Problem Summary */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Problem Summary</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full font-mono border border-emerald-200">
                Gemini 2.5 Triage
              </span>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-50/90 to-teal-50/50 rounded-2xl border border-emerald-200/90 text-xs sm:text-sm text-gray-900 leading-relaxed font-medium shadow-sm">
              {ticket.summary}
            </div>
          </div>

          {/* Original Complaint (if different from summary) */}
          {ticket.originalComplaint && ticket.originalComplaint !== ticket.summary && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-mocha-700 uppercase tracking-wider font-mono">
                Student's Reported Description (Raw)
              </span>
              <div className="p-3.5 bg-white rounded-2xl border border-mocha-200 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap shadow-subtle">
                {ticket.originalComplaint}
              </div>
            </div>
          )}

          {/* Photos (if attached) */}
          {ticket.photoUrls && ticket.photoUrls.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-mocha-700 uppercase tracking-wider font-mono">
                Attached Photo
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ticket.photoUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden border border-mocha-200 bg-mocha-50 max-h-60 shadow-subtle"
                  >
                    <img
                      src={url}
                      alt="Issue photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Endorsement Action */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-mocha-200 shadow-subtle">
            <div>
              <p className="text-xs font-bold text-gray-900">
                {ticket.affectedCount} {ticket.affectedCount === 1 ? 'Student experiencing this' : 'Students experiencing this'}
              </p>
              <p className="text-[11px] text-mocha-600 font-medium">
                Higher counts get priority from the hostel warden.
              </p>
            </div>
            {ticket.status !== 'Resolved' && (
              <button
                onClick={() => onToggleEndorse(ticket.id)}
                title={hasEndorsed ? 'You endorsed this issue' : 'Tap if you face this issue too'}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                  hasEndorsed
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white hover:bg-emerald-50 text-gray-800 border-mocha-300'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${hasEndorsed ? 'fill-white' : 'text-mocha-600'}`} />
                <span>{ticket.affectedCount}</span>
                {hasEndorsed ? (
                  <span className="text-[11px] opacity-90">• You Endorsed</span>
                ) : (
                  <span className="text-[11px] text-mocha-600">I face this too</span>
                )}
              </button>
            )}
          </div>

          {/* Staff Operational Controls (Only if staff or admin) */}
          {isStaffOrAdmin && (
            <div className="p-4 bg-gray-900 text-white rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono tracking-wider text-emerald-400 uppercase">
                  Staff Quick Actions
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={ticket.assignedToStaffUid || ''}
                  onChange={(e) => {
                    const staff = eligibleStaff.find((s) => s.uid === e.target.value);
                    if (staff) onAssignStaff(staff.uid, `${staff.name} (${staff.designation})`);
                  }}
                  className="bg-gray-800 border border-gray-700 text-xs rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="">Assign staff member...</option>
                  {eligibleStaff.map((s) => (
                    <option key={s.uid} value={s.uid}>
                      {s.name} ({s.designation})
                    </option>
                  ))}
                </select>

                {ticket.status !== 'In Progress' && (
                  <button
                    onClick={() => onUpdateStatus('In Progress')}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded-xl font-bold transition-all"
                  >
                    Mark Working on it
                  </button>
                )}

                {ticket.status !== 'Resolved' && (
                  <button
                    onClick={() => {
                      if (AI_FEATURES.verification) {
                        setShowAiVerificationModal(true);
                      } else {
                        setShowResolveModal(true);
                      }
                    }}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Mark Fixed
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Reopen Action for Resolved Tickets */}
          {ticket.status === 'Resolved' && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowReopenModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-white border border-mocha-200 transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Problem Still Not Fixed? Reopen</span>
              </button>
            </div>
          )}

          {/* Simple Updates & Messages */}
          <div className="space-y-3 pt-2 border-t border-mocha-200">
            <span className="text-xs font-bold text-mocha-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Updates & Discussion ({visibleComments.length})</span>
            </span>

            <div className="space-y-2">
              {visibleComments.length === 0 ? (
                <div className="py-6 text-center text-mocha-500 text-xs">
                  No comments yet. Leave an update below.
                </div>
              ) : (
                visibleComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3.5 rounded-2xl bg-white border border-mocha-200 shadow-subtle text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-900">
                        {comment.authorName} ({comment.authorRole})
                      </span>
                      <span className="text-[10px] text-mocha-400 font-mono">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Post comment input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write an update or question..."
                className="flex-1 p-2.5 text-xs bg-white border border-mocha-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-gray-900"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="px-4 py-2 bg-[#16A34A] text-white rounded-xl text-xs font-bold hover:bg-[#22C55E] disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-mocha-100 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-mocha-100 hover:bg-mocha-200 text-gray-900 text-xs font-bold rounded-xl transition-colors active:scale-95"
          >
            Close
          </button>
        </div>
      </div>

      {/* Resolve Dialog */}
      {showResolveModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-sonner">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-mocha-200">
            <h3 className="text-base font-extrabold text-gray-900 mb-1.5 tracking-tight">
              Mark Issue as Fixed
            </h3>
            <p className="text-xs text-mocha-700 mb-3.5 leading-relaxed font-medium">
              Briefly describe what was repaired so students are notified:
            </p>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Replaced faulty pipe valve, water pressure restored."
              rows={3}
              className="w-full text-xs p-3 border border-mocha-300 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 mb-4 resize-none bg-mocha-50/30 text-gray-900"
            />
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 text-xs font-bold text-mocha-700 hover:bg-mocha-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveSubmit}
                disabled={!resolutionNotes.trim()}
                className="px-4 py-2 text-xs bg-emerald-600 text-white font-extrabold rounded-xl hover:bg-emerald-500 disabled:opacity-50 transition-all active:scale-95"
              >
                Confirm Fixed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Dialog */}
      {showReopenModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-sonner">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-mocha-200">
            <h3 className="text-base font-extrabold text-gray-900 mb-1.5 tracking-tight">
              Reopen Issue
            </h3>
            <p className="text-xs text-mocha-700 mb-3.5 leading-relaxed font-medium">
              Why is this problem still persisting?
            </p>
            <textarea
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g. The tap is still leaking when turned on."
              rows={3}
              className="w-full text-xs p-3 border border-mocha-300 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 mb-4 resize-none bg-mocha-50/30 text-gray-900"
            />
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowReopenModal(false)}
                className="px-4 py-2 text-xs font-bold text-mocha-700 hover:bg-mocha-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleReopenSubmit}
                disabled={!reopenReason.trim()}
                className="px-4 py-2 text-xs bg-[#16A34A] text-white font-extrabold rounded-xl hover:bg-[#22C55E] disabled:opacity-50 transition-all active:scale-95"
              >
                Reopen Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Resolution Verification Modal (Feature C) */}
      {showAiVerificationModal && AI_FEATURES.verification && (
        <ResolutionVerificationModal
          ticket={ticket}
          onClose={() => setShowAiVerificationModal(false)}
          onVerificationComplete={handleAiVerificationComplete}
          onEscalateToAdmin={handleEscalateToAdmin}
        />
      )}
    </div>
  );
};

export default TicketDetailModal;
