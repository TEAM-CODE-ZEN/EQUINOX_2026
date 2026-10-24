import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckSquare,
  Square,
  Clock,
  ArrowRight,
  Send,
  MessageSquare,
  CheckCircle2,
  ShieldAlert,
  Wrench,
  Bot,
  ExternalLink,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Ticket, UserProfile, TicketPriority } from '../../../types';
import { InvestigationReport, InvestigationChatTurn } from '../types';
import { investigateTicket, chatWithInvestigator } from '../aiClient';
import { useTranslation } from '../../../i18n';

interface InvestigatorTabProps {
  ticket: Ticket;
  allTickets: Ticket[];
  currentUser: UserProfile;
  onUpdateTicket: (updatedTicket: Ticket) => void;
  onSelectSimilarTicket?: (ticketId: string) => void;
  onAddComment: (content: string, isInternal: boolean) => void;
  rootCauseClusterTitle?: string;
}

export const InvestigatorTab: React.FC<InvestigatorTabProps> = ({
  ticket,
  allTickets,
  currentUser: _currentUser,
  onUpdateTicket,
  onSelectSimilarTicket,
  onAddComment,
  rootCauseClusterTitle,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [appliedPriority, setAppliedPriority] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState<Record<number, boolean>>({});

  const report: InvestigationReport | undefined = ticket.investigation?.report;
  const chatTurns: InvestigationChatTurn[] = ticket.investigation?.chat || [];

  // Filter nearby related tickets (max 15 from same category or location)
  const relatedTickets = allTickets
    .filter(
      (t) =>
        t.id !== ticket.id &&
        (t.category === ticket.category ||
          (t.location && ticket.location && t.location.includes(ticket.location.split(' ')[0])))
    )
    .slice(0, 15);

  const handleRunInvestigation = async () => {
    setLoading(true);
    try {
      const result = await investigateTicket(ticket, relatedTickets, rootCauseClusterTitle);
      const updatedTicket: Ticket = {
        ...ticket,
        investigation: {
          report: result,
          chat: ticket.investigation?.chat || [],
        },
      };
      onUpdateTicket(updatedTicket);
    } catch (err) {
      console.error('Failed to run investigation:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleApplyPriority = (suggested: 'Low' | 'Medium' | 'High' | 'Urgent') => {
    const priorityMap: Record<string, TicketPriority> = {
      Low: 'Low',
      Medium: 'Medium',
      High: 'High',
      Urgent: 'Critical',
    };
    const targetPriority = priorityMap[suggested] || 'High';

    const updatedTicket: Ticket = {
      ...ticket,
      priority: targetPriority,
      priorityReason: report?.priority_reason,
    };
    onUpdateTicket(updatedTicket);
    setAppliedPriority(true);
    setTimeout(() => setAppliedPriority(false), 3000);
  };

  const handleAskStudent = (question: string, qIndex: number) => {
    onAddComment(`[Investigator AI Clarification Request]: ${question}`, false);
    setAskedQuestions((prev) => ({ ...prev, [qIndex]: true }));
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !report || chatLoading) return;

    const userMsg: InvestigationChatTurn = {
      role: 'user',
      text: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };
    const currentChat = [...chatTurns, userMsg];

    // Optimistically update
    onUpdateTicket({
      ...ticket,
      investigation: {
        report,
        chat: currentChat,
      },
    });
    setChatInput('');
    setChatLoading(true);

    try {
      const answer = await chatWithInvestigator(ticket, report, currentChat, userMsg.text);
      const assistantMsg: InvestigationChatTurn = {
        role: 'assistant',
        text: answer,
        timestamp: new Date().toISOString(),
      };
      onUpdateTicket({
        ...ticket,
        investigation: {
          report,
          chat: [...currentChat, assistantMsg],
        },
      });
    } catch {
      const errMsg: InvestigationChatTurn = {
        role: 'assistant',
        text: t('notEnoughInfo'),
        timestamp: new Date().toISOString(),
      };
      onUpdateTicket({
        ...ticket,
        investigation: {
          report,
          chat: [...currentChat, errMsg],
        },
      });
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-5 text-left text-xs font-sans pb-4">
      {/* Action Header / Trigger Banner */}
      {!report && (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-white via-mocha-50/50 to-latte-50 border border-mocha-200 text-center space-y-4 shadow-subtle">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto border border-purple-200/80 shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900">
              AI Incident Root-Cause Investigation
            </h3>
            <p className="text-xs text-mocha-600 mt-1 max-w-md mx-auto leading-relaxed">
              Launch multimodal diagnostic reasoning across {relatedTickets.length} adjacent historical campus tickets, safety guidelines, and infrastructure taxonomy.
            </p>
          </div>
          <button
            onClick={handleRunInvestigation}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-extrabold rounded-2xl shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? t('runningInvestigation') : t('runInvestigation')}</span>
          </button>
        </div>
      )}

      {/* Re-run button if report exists */}
      {report && (
        <div className="flex items-center justify-between pb-1 border-b border-mocha-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
            <span className="font-extrabold text-gray-900 text-sm">
              {t('investigationSummary')}
            </span>
            {report.isSimulated && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {t('aiUnavailableNotice')}
              </span>
            )}
          </div>
          <button
            onClick={handleRunInvestigation}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? t('loading') : t('runInvestigation')}</span>
          </button>
        </div>
      )}

      {/* Render Investigation Report Sections */}
      {report && (
        <div className="space-y-4">
          {/* Section 1: Technical Summary & Recurrence */}
          <div className="p-4 bg-white rounded-2xl border border-mocha-200 shadow-subtle space-y-2">
            <p className="text-gray-900 font-medium leading-relaxed">
              {report.summary}
            </p>
            {report.is_recurring && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-50 text-red-800 border border-red-200 text-[11px] font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{report.recurrence_note || t('isRecurring')}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-3 pt-2 text-[11px] text-mocha-700 font-mono">
              <span>{t('estimatedFixTime')}: <strong className="text-gray-900">{report.estimated_fix_time}</strong></span>
              <span>•</span>
              <span>{t('suggestedDepartment')}: <strong className="text-gray-900">{report.suggested_department}</strong></span>
            </div>
          </div>

          {/* Section 2: Likely Causes with Single-Color Likelihood Bar */}
          <div className="p-4 bg-white rounded-2xl border border-mocha-200 shadow-subtle space-y-3">
            <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-700" />
              <span>{t('likelyCauses')}</span>
            </h4>
            <div className="space-y-3">
              {report.likely_causes.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-xs">{item.cause}</span>
                    <span className="font-mono font-bold text-indigo-700">{item.likelihood}%</span>
                  </div>
                  {/* Single-color probability bar */}
                  <div className="w-full h-2 rounded-full bg-indigo-100 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, item.likelihood))}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-mocha-600 leading-relaxed font-medium">
                    {item.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Safety Warnings in Amber Box */}
          {report.safety_warnings && report.safety_warnings.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{t('safetyWarnings')}</span>
              </div>
              <ul className="space-y-1 pl-5 list-disc text-[11px] leading-relaxed">
                {report.safety_warnings.map((warn, i) => (
                  <li key={i} className="font-medium">{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 4: "Check First" Actionable Checklist */}
          <div className="p-4 bg-white rounded-2xl border border-mocha-200 shadow-subtle space-y-2.5">
            <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>{t('checkFirst')}</span>
            </h4>
            <div className="space-y-2">
              {report.what_to_check_first.map((item, idx) => {
                const isChecked = Boolean(checkedItems[idx]);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleCheck(idx)}
                    className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl border transition-all text-left ${
                      isChecked
                        ? 'bg-emerald-50/60 border-emerald-200 text-gray-500 line-through'
                        : 'bg-latte-50/60 border-mocha-200 text-gray-800 hover:bg-white'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-mocha-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span className="text-xs font-medium leading-relaxed">{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Similar Incidents Chips (Clickable) */}
          {report.similar_ticket_ids && report.similar_ticket_ids.length > 0 && (
            <div className="p-4 bg-white rounded-2xl border border-mocha-200 shadow-subtle space-y-2.5">
              <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">
                {t('similarIncidents')} ({report.similar_ticket_ids.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {report.similar_ticket_ids.map((id) => {
                  const target = allTickets.find((t) => t.id === id);
                  return (
                    <button
                      key={id}
                      onClick={() => onSelectSimilarTicket?.(id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-mocha-50 hover:bg-mocha-100 border border-mocha-200 text-gray-800 text-xs font-bold transition-all active:scale-95"
                    >
                      <span>#{target?.ticketNumber || id}</span>
                      {target && <span className="opacity-75 font-normal truncate max-w-[140px]">({target.title})</span>}
                      <ExternalLink className="w-3 h-3 text-mocha-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 6: Suggested Priority with Apply Button */}
          <div className="p-4 bg-white rounded-2xl border border-mocha-200 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-mocha-400 block">
                {t('suggestedPriority')}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-extrabold text-indigo-950">
                  {report.suggested_priority}
                </span>
                <span className="text-xs text-mocha-600 font-medium">
                  — {report.priority_reason}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleApplyPriority(report.suggested_priority)}
              className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold rounded-xl transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              {appliedPriority ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              <span>{appliedPriority ? 'Applied' : t('apply')}</span>
            </button>
          </div>

          {/* Section 7: Questions for Student ("Ask student" button) */}
          {report.questions_for_student && report.questions_for_student.length > 0 && (
            <div className="p-4 bg-white rounded-2xl border border-mocha-200 shadow-subtle space-y-2.5">
              <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-700" />
                <span>{t('askStudent')}</span>
              </h4>
              <div className="space-y-2">
                {report.questions_for_student.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-latte-50/70 rounded-xl border border-mocha-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <span className="text-xs text-gray-800 font-medium">{q}</span>
                    <button
                      onClick={() => handleAskStudent(q, idx)}
                      disabled={askedQuestions[idx]}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 disabled:bg-emerald-600 text-white font-extrabold text-[11px] rounded-lg transition-all active:scale-95 flex items-center gap-1 flex-shrink-0 cursor-pointer"
                    >
                      {askedQuestions[idx] ? <CheckCircle2 className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                      <span>{askedQuestions[idx] ? 'Posted to Ticket' : t('send')}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 8: Follow-up Chat with Investigator AI */}
          <div className="p-4 bg-white rounded-2xl border border-mocha-200 shadow-subtle space-y-3">
            <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-indigo-700" />
              <span>{t('followUpChatTitle')}</span>
            </h4>

            {/* Conversation Log */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {chatTurns.length === 0 ? (
                <p className="text-[11px] text-mocha-500 py-3 text-center italic">
                  {t('chatInitialNotice')}
                </p>
              ) : (
                chatTurns.map((turn, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                      turn.role === 'user'
                        ? 'ml-auto bg-indigo-700 text-white'
                        : 'bg-mocha-50 border border-mocha-200 text-gray-900'
                    }`}
                  >
                    <p className="font-medium whitespace-pre-wrap">{turn.text}</p>
                    <span
                      className={`text-[9px] font-mono block mt-1 ${
                        turn.role === 'user' ? 'text-indigo-200' : 'text-mocha-400'
                      }`}
                    >
                      {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="p-3 rounded-2xl bg-mocha-50 border border-mocha-200 text-xs text-mocha-600 max-w-[85%] animate-pulse">
                  Investigator AI is analyzing context...
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t('chatPlaceholder')}
                className="flex-1 px-3.5 py-2 bg-latte-50/60 border border-mocha-200 rounded-xl text-xs text-gray-900 placeholder:text-mocha-400 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white rounded-xl transition-all active:scale-95 font-bold cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Section 9: Next Actions & Footer */}
          {report.next_best_actions && report.next_best_actions.length > 0 && (
            <div className="p-3.5 bg-latte-50/70 rounded-2xl border border-mocha-200 space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-mocha-400 block">
                {t('nextBestActions')}
              </span>
              <ul className="space-y-1 pl-4 list-disc text-xs text-gray-800 font-medium">
                {report.next_best_actions.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Notice */}
          <div className="py-2 text-center text-[11px] font-mono font-medium text-mocha-500 border-t border-mocha-100">
            {t('aiNotice')}
          </div>
        </div>
      )}
    </div>
  );
};
