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
  getCategoryTheme,
  formatRelativeTime,
} from '../utils/formatters';
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

  const statusBadge = getStatusBadgeStyle(ticket.status);
  const priorityBadge = getPriorityBadgeStyle(ticket.priority);
  const categoryTheme = getCategoryTheme(ticket.category);

  // Filter comments: students do NOT see internal notes
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto animate-sonner">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(37,3,9,0.3)] border border-mocha-200/90 overflow-hidden my-6 max-h-[92vh] flex flex-col text-left">
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-mocha-100 bg-mocha-50/80">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-mocha-800 bg-white px-2.5 py-0.5 rounded-lg border border-mocha-200/80 shadow-subtle">
                {ticket.ticketNumber}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
                <span>{ticket.status}</span>
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-lg border ${priorityBadge.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${priorityBadge.dot}`}></span>
                <span>{priorityBadge.label}</span>
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${categoryTheme.bg}`}>
                {ticket.category}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-burgundy-950 tracking-tight leading-snug">
              {ticket.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-mocha-400 hover:text-mocha-700 rounded-xl hover:bg-mocha-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-mocha-200/80 bg-white px-5 sm:px-6 gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'details'
                ? 'border-burgundy-900 text-burgundy-950'
                : 'border-transparent text-mocha-600 hover:text-burgundy-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Issue Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'comments'
                ? 'border-burgundy-900 text-burgundy-950'
                : 'border-transparent text-mocha-600 hover:text-burgundy-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Discussion ({visibleComments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'history'
                ? 'border-burgundy-900 text-burgundy-950'
                : 'border-transparent text-mocha-600 hover:text-burgundy-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit History ({history.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Key Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-mocha-50/60 rounded-2xl border border-mocha-200/80 text-xs">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-mocha-500" />
                  <div>
                    <span className="text-mocha-500 font-medium">Location:</span>{' '}
                    <span className="font-bold text-slate-800">{ticket.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-mocha-500" />
                  <div>
                    <span className="text-mocha-500 font-medium">Reported By:</span>{' '}
                    <span className="font-bold text-slate-800">
                      {ticket.isSensitive ? 'Confidential Reporter' : ticket.reporterName}
                    </span>
                    {ticket.reporterRoom && (
                      <span className="text-mocha-600"> ({ticket.reporterRoom})</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-mocha-500" />
                  <div>
                    <span className="text-mocha-500 font-medium">Timestamp:</span>{' '}
                    <span className="font-mono text-mocha-800">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-burgundy-700" />
                  <div>
                    <span className="text-mocha-500 font-medium">Assigned Staff:</span>{' '}
                    <span className="font-bold text-burgundy-950">
                      {ticket.assignedStaffName || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Endorsements Control */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-mocha-50 via-latte-100 to-burgundy-50/40 rounded-2xl border border-mocha-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-burgundy-900 text-latte-50 flex items-center justify-center font-extrabold text-sm shadow-sm font-mono">
                    +{ticket.affectedCount}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-burgundy-950">
                      {ticket.affectedCount} {ticket.affectedCount === 1 ? 'Student Endorsement' : 'Student Endorsements'}
                    </p>
                    <p className="text-[11px] text-mocha-700 font-medium">
                      Facilities staff prioritizes tickets with higher community affected counts.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onToggleEndorse(ticket.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border active:scale-95 ${
                    hasEndorsed
                      ? 'bg-burgundy-900 text-latte-50 border-burgundy-900 shadow-sm'
                      : 'bg-white hover:bg-mocha-50 text-mocha-900 border-mocha-300'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 inline mr-1.5 ${hasEndorsed ? 'text-mocha-300 fill-mocha-300' : 'text-mocha-600'}`} />
                  {hasEndorsed ? 'Endorsed (+1)' : 'I Experience This Too'}
                </button>
              </div>

              {/* Original Complaint */}
              <div>
                <h4 className="text-xs font-bold text-mocha-700 uppercase tracking-wider mb-2 font-mono">
                  Complaint Description
                </h4>
                <div className="p-4 bg-white rounded-2xl border border-mocha-200/90 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap shadow-subtle">
                  {ticket.originalComplaint}
                </div>
              </div>

              {/* AI Triage & Evidence Card */}
              {ticket.aiMetadata && (
                <div className="p-4 sm:p-5 bg-gradient-to-br from-mocha-50/90 to-latte-100/70 rounded-2xl border border-mocha-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-burgundy-700" />
                      <span className="text-xs font-bold text-burgundy-950 uppercase tracking-wider font-mono">
                        Gemini AI Triage Assessment ({ticket.aiMetadata.model})
                      </span>
                    </div>
                    <span className="text-[10px] bg-burgundy-100 text-burgundy-950 font-extrabold px-2.5 py-0.5 rounded-full font-mono border border-burgundy-200/60">
                      Automated Pipeline
                    </span>
                  </div>

                  <p className="text-xs text-mocha-900 leading-relaxed font-medium">
                    <span className="font-bold text-burgundy-950">Priority Justification:</span>{' '}
                    {ticket.priorityReason || 'Assessed based on student facility disruption and safety urgency.'}
                  </p>

                  {ticket.aiMetadata.visibleEvidence && (
                    <div className="p-3 bg-white/90 rounded-xl border border-mocha-200 text-xs text-mocha-900">
                      <span className="font-bold text-burgundy-900">Physical Evidence Extracted:</span>{' '}
                      {ticket.aiMetadata.visibleEvidence}
                    </div>
                  )}

                  {ticket.aiMetadata.suggestedAction && (
                    <div className="text-xs text-mocha-800 font-medium">
                      <span className="font-bold text-burgundy-900">Recommended Routing:</span>{' '}
                      {ticket.aiMetadata.suggestedAction}
                    </div>
                  )}
                </div>
              )}

              {/* Photo Evidence */}
              {ticket.photoUrls && ticket.photoUrls.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-mocha-700 uppercase tracking-wider mb-2 font-mono">
                    Attached Photographs
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ticket.photoUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl overflow-hidden border border-mocha-200 bg-mocha-50 max-h-64 shadow-subtle group"
                      >
                        <img
                          src={url}
                          alt="Evidence photo"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution Notes (If resolved) */}
              {ticket.status === 'Resolved' && (
                <div className="p-4 sm:p-5 bg-emerald-50/90 rounded-2xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider font-mono">
                      Official Work Completion Notes
                    </h4>
                  </div>
                  <p className="text-xs text-emerald-900 whitespace-pre-wrap leading-relaxed font-medium">
                    {ticket.resolutionNotes || 'Marked as resolved by campus facilities team.'}
                  </p>
                </div>
              )}

              {/* Staff Management Console */}
              {isStaffOrAdmin && (
                <div className="p-5 bg-burgundy-950 text-latte-50 rounded-2xl shadow-elevated border border-burgundy-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold tracking-wider uppercase text-mocha-300 font-mono">
                      Staff Operational Console
                    </span>
                    <span className="text-[10px] bg-burgundy-900 text-mocha-200 px-2 py-0.5 rounded font-mono font-bold border border-burgundy-700">
                      Staff Authorized
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Assign Staff */}
                    <div>
                      <label className="block text-[11px] text-mocha-300 font-medium mb-1.5">
                        Assign Maintenance Personnel:
                      </label>
                      <select
                        value={ticket.assignedToStaffUid || ''}
                        onChange={(e) => {
                          const staff = eligibleStaff.find((s) => s.uid === e.target.value);
                          if (staff) onAssignStaff(staff.uid, `${staff.name} (${staff.designation})`);
                        }}
                        className="w-full bg-burgundy-900 border border-burgundy-700 text-latte-50 text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-mocha-400 cursor-pointer"
                      >
                        <option value="">Select Staff Member...</option>
                        {eligibleStaff.map((s) => (
                          <option key={s.uid} value={s.uid}>
                            {s.name} — {s.designation}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Change Status */}
                    <div>
                      <label className="block text-[11px] text-mocha-300 font-medium mb-1.5">
                        Workflow Progression:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {ticket.status !== 'In Progress' && (
                          <button
                            onClick={() => onUpdateStatus('In Progress')}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs rounded-xl font-bold transition-all active:scale-95 shadow-sm"
                          >
                            Mark In Progress
                          </button>
                        )}
                        {ticket.status !== 'Resolved' && (
                          <button
                            onClick={() => setShowResolveModal(true)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-xl font-bold transition-all active:scale-95 shadow-sm"
                          >
                            Mark Resolved
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
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-burgundy-800 hover:bg-burgundy-50 border border-burgundy-200 transition-all active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Issue Persists? Reopen Ticket</span>
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
                  <div className="py-12 text-center text-mocha-500 text-xs font-medium">
                    No discussion updates yet. Add a message below.
                  </div>
                ) : (
                  visibleComments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-2xl border text-xs text-left transition-all ${
                        comment.isInternal
                          ? 'bg-amber-50/80 border-amber-200/90'
                          : 'bg-white border-mocha-200/90 shadow-subtle'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-burgundy-950">
                            {comment.authorName}
                          </span>
                          <span className="text-[10px] text-mocha-600 font-medium">
                            {comment.authorDesignation || comment.authorRole}
                          </span>
                          {comment.isInternal && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-200/90 px-2 py-0.2 rounded-full font-mono">
                              <Lock className="w-2.5 h-2.5" /> Staff Only
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-mocha-400 font-mono">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Post Comment Input */}
              <form onSubmit={handleCommentSubmit} className="pt-3 border-t border-mocha-100">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Type an operational update or student comment..."
                  rows={2}
                  className="w-full p-3.5 text-xs sm:text-sm bg-mocha-50/60 border border-mocha-200/90 rounded-2xl focus:ring-2 focus:ring-burgundy-700/20 focus:border-burgundy-700 focus:bg-white resize-none transition-all text-slate-800"
                />

                <div className="flex items-center justify-between mt-2.5">
                  {isStaffOrAdmin ? (
                    <label className="flex items-center gap-2 text-xs text-mocha-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        className="rounded border-mocha-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-medium text-amber-900">
                        Internal staff note (hidden from students)
                      </span>
                    </label>
                  ) : (
                    <div></div>
                  )}

                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-burgundy-900 text-latte-50 rounded-xl text-xs font-bold hover:bg-burgundy-800 disabled:opacity-50 transition-all active:scale-95 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5 text-mocha-300" />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Audit History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <p className="text-xs text-mocha-600 mb-3 font-medium">
                Cryptographic immutable audit record of all status changes, staff assignments, and endorsements:
              </p>
              <div className="relative border-l-2 border-mocha-200 ml-4 space-y-4">
                {history.map((event) => (
                  <div key={event.id} className="relative pl-6 text-xs">
                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-mocha-400 ring-4 ring-white" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-burgundy-950">
                        {event.actorName}
                      </span>
                      <span className="text-[10px] text-mocha-400 font-mono">
                        {formatRelativeTime(event.timestamp)}
                      </span>
                    </div>
                    <p className="text-mocha-700 mt-0.5 leading-relaxed">{event.description}</p>
                    {event.previousValue && event.newValue && (
                      <div className="mt-1.5 text-[11px] font-mono text-mocha-800 bg-mocha-100 px-2 py-1 rounded-lg inline-flex items-center gap-1.5 border border-mocha-200/60">
                        <span>{event.previousValue}</span>
                        <ArrowRight className="w-3 h-3 text-mocha-400" />
                        <span className="font-bold text-burgundy-950">{event.newValue}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="p-4 sm:p-5 border-t border-mocha-100 bg-mocha-50/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-mocha-100 hover:bg-mocha-200 text-mocha-900 border border-mocha-200 text-xs font-bold rounded-xl transition-colors active:scale-95"
          >
            Close
          </button>
        </div>
      </div>

      {/* Resolve Dialog */}
      {showResolveModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-burgundy-950/70 backdrop-blur-sm animate-sonner">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-elevated border border-mocha-200">
            <h3 className="text-base font-extrabold text-burgundy-950 mb-1.5 tracking-tight">
              Mark Ticket as Resolved
            </h3>
            <p className="text-xs text-mocha-700 mb-3.5 leading-relaxed font-medium">
              Describe the repair or maintenance actions completed so the reporting student is informed:
            </p>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Replaced faulty compressor switch, tested water temperature, and restored normal flow."
              rows={3}
              className="w-full text-xs p-3 border border-mocha-300 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 mb-4 resize-none bg-mocha-50/30 text-mocha-900"
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
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Dialog */}
      {showReopenModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-burgundy-950/70 backdrop-blur-sm animate-sonner">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-elevated border border-mocha-200">
            <h3 className="text-base font-extrabold text-burgundy-950 mb-1.5 tracking-tight">
              Reopen Persisting Concern
            </h3>
            <p className="text-xs text-mocha-700 mb-3.5 leading-relaxed font-medium">
              Why was the previous resolution incomplete or recurrence observed?
            </p>
            <textarea
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g. Water cooler stopped cooling again after 3 hours."
              rows={3}
              className="w-full text-xs p-3 border border-mocha-300 rounded-2xl focus:ring-2 focus:ring-burgundy-800/20 focus:border-burgundy-800 mb-4 resize-none bg-mocha-50/30 text-mocha-900"
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
                className="px-4 py-2 text-xs bg-burgundy-900 text-latte-50 font-extrabold rounded-xl hover:bg-burgundy-800 disabled:opacity-50 transition-all active:scale-95"
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
export default TicketDetailModal;
