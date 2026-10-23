import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Lock,
  Send,
  MessageSquare,
  History,
  FileText,
  ThumbsUp,
  ArrowRight,
} from 'lucide-react';
import {
  Ticket,
  TicketComment,
  TicketHistoryEvent,
  UserProfile,
  TicketStatus,
} from '../types';
import {
  getStatusBadgeStyle,
  getPriorityBadgeStyle,
  formatRelativeTime,
} from './TicketCard';
import { DEMO_USERS } from '../services/mockData';

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
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');
  const [newCommentText, setNewCommentText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  const isStaffOrAdmin =
    currentUser.role === 'Campus Staff' || currentUser.role === 'Admin';
  const hasEndorsed = ticket.endorsedUserIds?.includes(currentUser.uid);

  // Filter comments: students do NOT see internal notes!
  const visibleComments = comments.filter(
    (c) => !c.isInternal || isStaffOrAdmin
  );

  const eligibleStaff = DEMO_USERS.filter((u) => u.role === 'Campus Staff');

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(newCommentText.trim(), isInternalNote);
    setNewCommentText('');
    setIsInternalNote(false);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-elevated border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col text-left">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                {ticket.ticketNumber}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                  ticket.status
                )}`}
              >
                {ticket.status}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded border ${getPriorityBadgeStyle(
                  ticket.priority
                )}`}
              >
                {ticket.priority} Priority
              </span>
              <span className="text-xs text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded font-medium">
                {ticket.category}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {ticket.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-white px-5 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'details'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Issue Overview
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'comments'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Comments ({visibleComments.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'history'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            Audit History ({history.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Key Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-500">Location:</span>{' '}
                    <span className="font-semibold text-slate-800">{ticket.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-500">Reported By:</span>{' '}
                    <span className="font-semibold text-slate-800">
                      {ticket.isSensitive ? 'Confidential Reporter' : ticket.reporterName}
                    </span>
                    {ticket.reporterRoom && (
                      <span className="text-slate-500"> ({ticket.reporterRoom})</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-500">Created:</span>{' '}
                    <span className="font-semibold text-slate-800">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <div>
                    <span className="text-slate-500">Assigned Staff:</span>{' '}
                    <span className="font-semibold text-slate-800">
                      {ticket.assignedStaffName || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Endorsements Control */}
              <div className="flex items-center justify-between p-3.5 bg-teal-50/60 rounded-xl border border-teal-200/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                    +{ticket.affectedCount}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-teal-900">
                      {ticket.affectedCount} {ticket.affectedCount === 1 ? 'Student Affected' : 'Students Affected'}
                    </p>
                    <p className="text-[11px] text-teal-700">
                      Shared issues are prioritized according to endorsement counts.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onToggleEndorse(ticket.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    hasEndorsed
                      ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                      : 'bg-white hover:bg-teal-100 text-teal-800 border-teal-300'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5 inline mr-1" />
                  {hasEndorsed ? 'Endorsed (+1)' : 'I Have This Issue Too'}
                </button>
              </div>

              {/* Original Complaint */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Student Complaint Description
                </h4>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {ticket.originalComplaint}
                </div>
              </div>

              {/* AI Triage & Evidence Card */}
              {ticket.aiMetadata && (
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                        AI Triage Analysis ({ticket.aiMetadata.model})
                      </span>
                    </div>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
                      Automated Assessment
                    </span>
                  </div>

                  <p className="text-xs text-indigo-900 leading-relaxed">
                    <span className="font-semibold">Priority Rationale:</span> {ticket.priorityReason || 'Assessed based on student welfare and campus safety.'}
                  </p>

                  {ticket.aiMetadata.visibleEvidence && (
                    <div className="p-2.5 bg-white/80 rounded-lg border border-indigo-100 text-xs text-indigo-900">
                      <span className="font-semibold">Visual Evidence Observed:</span>{' '}
                      {ticket.aiMetadata.visibleEvidence}
                    </div>
                  )}

                  {ticket.aiMetadata.suggestedAction && (
                    <div className="text-xs text-indigo-800">
                      <span className="font-semibold">Suggested Dispatch Action:</span>{' '}
                      {ticket.aiMetadata.suggestedAction}
                    </div>
                  )}
                </div>
              )}

              {/* Photo Evidence */}
              {ticket.photoUrls && ticket.photoUrls.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Attached Photographs
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ticket.photoUrls.map((url, idx) => (
                      <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-64">
                        <img
                          src={url}
                          alt="Evidence photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution Notes (If resolved) */}
              {ticket.status === 'Resolved' && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      Official Resolution Notes
                    </h4>
                  </div>
                  <p className="text-xs text-emerald-800 whitespace-pre-wrap">
                    {ticket.resolutionNotes || 'Marked as resolved by campus staff.'}
                  </p>
                </div>
              )}

              {/* Staff Management Toolbar (Authorized Staff/Admin only) */}
              {isStaffOrAdmin && (
                <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
                      Staff Operational Actions
                    </span>
                    <span className="text-[10px] bg-slate-800 text-teal-400 px-2 py-0.5 rounded font-mono">
                      Role Authorized
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Assign Staff */}
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Assign Staff Member:
                      </label>
                      <select
                        value={ticket.assignedToStaffUid || ''}
                        onChange={(e) => {
                          const staff = eligibleStaff.find((s) => s.uid === e.target.value);
                          if (staff) onAssignStaff(staff.uid, `${staff.name} (${staff.designation})`);
                        }}
                        className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-teal-400"
                      >
                        <option value="">Select Staff to Assign...</option>
                        {eligibleStaff.map((s) => (
                          <option key={s.uid} value={s.uid}>
                            {s.name} — {s.designation}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Change Status */}
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Update Status:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {ticket.status !== 'In Progress' && (
                          <button
                            onClick={() => onUpdateStatus('In Progress')}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded font-medium transition-colors"
                          >
                            Mark In Progress
                          </button>
                        )}
                        {ticket.status !== 'Resolved' && (
                          <button
                            onClick={() => setShowResolveModal(true)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded font-medium transition-colors"
                          >
                            Resolve Ticket
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reopen Action for Resolved Tickets */}
              {ticket.status === 'Resolved' && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShowReopenModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Problem Persists? Reopen Ticket
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {visibleComments.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No comments yet. Start a discussion below.
                  </div>
                ) : (
                  visibleComments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-3.5 rounded-xl border text-xs text-left ${
                        comment.isInternal
                          ? 'bg-amber-50/70 border-amber-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {comment.authorName}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {comment.authorDesignation || comment.authorRole}
                          </span>
                          {comment.isInternal && (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-200/80 px-1.5 py-0.2 rounded">
                              <Lock className="w-2.5 h-2.5" /> Staff Only
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Post Comment Input */}
              <form onSubmit={handleCommentSubmit} className="pt-3 border-t border-slate-200">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Type an update or comment..."
                  rows={2}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:bg-white resize-none"
                />

                <div className="flex items-center justify-between mt-2">
                  {isStaffOrAdmin ? (
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span>Internal staff note (hidden from students)</span>
                    </label>
                  ) : (
                    <div></div>
                  )}

                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    Post
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* History / Audit Log Tab */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-500 mb-2">
                Preserved tamper-evident chronological timeline of all actions taken on this ticket:
              </p>
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-4">
                {history.map((event) => (
                  <div key={event.id} className="relative pl-5 text-xs">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-400 ring-4 ring-white" />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        {event.actorName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatRelativeTime(event.timestamp)}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{event.description}</p>
                    {event.previousValue && event.newValue && (
                      <div className="mt-1 text-[11px] font-mono text-slate-500 bg-slate-100 p-1 rounded inline-flex items-center gap-1">
                        <span>{event.previousValue}</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                        <span className="font-semibold text-slate-800">{event.newValue}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Resolve Dialog */}
      {showResolveModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-elevated border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Mark Ticket as Resolved
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              Explain the work completed or actions taken so the reporting student is informed:
            </p>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g., Replaced washer, cleared blockage, and tested water pressure."
              rows={3}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 mb-3"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveSubmit}
                disabled={!resolutionNotes.trim()}
                className="px-3 py-1.5 text-xs bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 disabled:opacity-50"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Dialog */}
      {showReopenModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-elevated border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Reopen Persisting Issue
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              Why was the previous resolution unsatisfactory? Please describe the ongoing symptoms:
            </p>
            <textarea
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g., The leak started again after 2 hours."
              rows={3}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 mb-3"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReopenModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReopenSubmit}
                disabled={!reopenReason.trim()}
                className="px-3 py-1.5 text-xs bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-500 disabled:opacity-50"
              >
                Reopen Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
