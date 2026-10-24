import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Check,
  X,
  MessageSquare,
  Image as ImageIcon,
  ArrowRight,
} from 'lucide-react';
import { Ticket } from '../../../types';
import { useTranslation } from '../../../i18n';

interface StudentVerificationCardProps {
  ticket: Ticket;
  currentUserUid: string;
  onConfirmFixed: () => void;
  onRejectFixed: (reopenReason: string) => void;
}

export const StudentVerificationCard: React.FC<StudentVerificationCardProps> = ({
  ticket,
  currentUserUid,
  onConfirmFixed,
  onRejectFixed,
}) => {
  const { t } = useTranslation();
  const [isReopening, setIsReopening] = useState<boolean>(false);
  const [reopenReason, setReopenReason] = useState<string>('');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const verification = ticket.verification;
  const beforeImg = ticket.beforeImage || ticket.photoUrls?.[0];
  const afterImg = ticket.afterImage;

  const isReporter = currentUserUid === ticket.reporterUid;

  const handleConfirm = () => {
    onConfirmFixed();
  };

  const handleReopenSubmit = () => {
    if (!reopenReason.trim()) {
      setErrorNotice('Please provide a short explanation of what is still broken.');
      return;
    }
    setErrorNotice(null);
    onRejectFixed(reopenReason.trim());
    setIsReopening(false);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/70 to-white rounded-3xl border-2 border-emerald-400/80 shadow-md p-5 sm:p-6 space-y-5 text-left animate-in fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-emerald-950 tracking-tight">
                {t('studentConfirmTitle')}
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300">
                Action Required
              </span>
            </div>
            <p className="text-xs text-emerald-800/90 mt-0.5">
              {t('studentConfirmPrompt')}
            </p>
          </div>
        </div>

        {verification && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-mono font-extrabold text-emerald-900">
              AI Confidence: {verification.confidence}%
            </span>
          </div>
        )}
      </div>

      {/* Side-by-Side Photographic Verification (Stacked on Mobile) */}
      {(beforeImg || afterImg) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Before Photo */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-gray-700 font-mono block">
              {t('beforePhoto')} (Reported Complaint)
            </span>
            <div className="w-full h-44 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
              {beforeImg ? (
                <img
                  src={beforeImg}
                  alt="Before repair"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-3 text-gray-400 text-xs">
                  <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-40" />
                  <span>No before photo</span>
                </div>
              )}
            </div>
          </div>

          {/* After Photo */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-emerald-800 font-mono block">
              {t('afterPhoto')} (Technician's Completion Evidence)
            </span>
            <div className="w-full h-44 rounded-2xl bg-emerald-50 border-2 border-emerald-300 overflow-hidden flex items-center justify-center">
              {afterImg ? (
                <img
                  src={afterImg}
                  alt="After repair evidence"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-3 text-emerald-600 text-xs font-medium">
                  <span>Photo verification uploaded</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Technician Note */}
      {ticket.resolutionNote && (
        <div className="p-3.5 bg-white/80 rounded-2xl border border-emerald-200 text-xs space-y-1">
          <span className="font-bold text-emerald-950 uppercase tracking-wide text-[10px] block">
            Technician Repair Note:
          </span>
          <p className="text-gray-800 font-medium leading-relaxed">
            {ticket.resolutionNote}
          </p>
        </div>
      )}

      {/* AI Diagnostic Checks & Reasoning */}
      {verification && (
        <div className="p-3.5 bg-white/90 rounded-2xl border border-emerald-200 text-xs space-y-2">
          <span className="font-bold text-emerald-950 uppercase tracking-wide text-[10px] block">
            AI Automated Observations:
          </span>
          <p className="text-gray-700 font-medium leading-relaxed">
            {verification.reasoning}
          </p>

          {verification.checks && verification.checks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {verification.checks.map((chk, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-700">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{chk.item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reopening prompt text area */}
      {isReopening && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-3 animate-in fade-in">
          <label className="block text-xs font-bold text-amber-950">
            {t('reopenReasonPrompt')}
          </label>
          <textarea
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            rows={2}
            placeholder="e.g. The socket still trips when I plug in my laptop charger..."
            className="w-full p-2.5 border border-amber-300 rounded-xl bg-white text-xs font-medium text-gray-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
          />

          {errorNotice && (
            <p className="text-xs text-red-600 font-bold">{errorNotice}</p>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleReopenSubmit}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold transition-all"
            >
              Reopen Ticket & Escalate
            </button>
            <button
              onClick={() => {
                setIsReopening(false);
                setErrorNotice(null);
              }}
              className="px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold transition-all"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons for Student */}
      {!isReopening && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-xs text-emerald-800 font-semibold">
            Does the repaired fixture meet your satisfaction?
          </p>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsReopening(true)}
              className="px-4 py-2 bg-white hover:bg-red-50 text-red-700 border border-red-200 hover:border-red-300 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1.5" />
              <span>{t('noStillNotFixed')}</span>
            </button>

            <button
              onClick={handleConfirm}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{t('yesItsFixed')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
