import React, { useState } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
  Check,
  Wrench,
  FileText,
} from 'lucide-react';
import { Ticket, TicketStatus } from '../../../types';
import { ResolutionVerificationResult } from '../types';
import { verifyResolution, hashImageString } from '../aiClient';
import { useTranslation } from '../../../i18n';

interface ResolutionVerificationModalProps {
  ticket: Ticket;
  onClose: () => void;
  onVerificationComplete: (
    updatedStatus: TicketStatus,
    afterImage: string,
    resolutionNote: string,
    verification: ResolutionVerificationResult
  ) => void;
  onEscalateToAdmin: (escalationReason: string) => void;
}

// Sample demo fixture images (clean SVG base64) to make testing instant without needing external camera files
const SAMPLE_FIXED_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0fdf4"/><rect x="80" y="50" width="240" height="200" rx="12" fill="%23ffffff" stroke="%2316a34a" stroke-width="4"/><circle cx="150" cy="140" r="14" fill="%2316a34a"/><circle cx="250" cy="140" r="14" fill="%2316a34a"/><rect x="185" y="170" width="30" height="40" rx="4" fill="%2322c55e"/><text x="200" y="275" font-family="sans-serif" font-size="14" font-weight="bold" fill="%2315803d" text-anchor="middle">REPAIRED FIXTURE - VERIFIED CLEAN</text></svg>';

export const ResolutionVerificationModal: React.FC<ResolutionVerificationModalProps> = ({
  ticket,
  onClose,
  onVerificationComplete,
  onEscalateToAdmin,
}) => {
  const { t } = useTranslation();

  const beforeImage = ticket.beforeImage || ticket.photoUrls?.[0];
  const [afterImage, setAfterImage] = useState<string>('');
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [partsUsed, setPartsUsed] = useState<string>('');

  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<ResolutionVerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle image upload from file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAfterImage(reader.result as string);
        setErrorMessage(null);
        setVerificationResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run AI Verification
  const handleRunVerification = async () => {
    if (!afterImage) {
      setErrorMessage('Please upload photographic evidence of the completed repair.');
      return;
    }
    if (!resolutionNote.trim()) {
      setErrorMessage('Please enter notes describing the repair work performed.');
      return;
    }

    setErrorMessage(null);
    setIsVerifying(true);

    try {
      // 1. Client-side hash check: auto-fail immediately if identical image reused
      if (beforeImage && afterImage) {
        const hBefore = await hashImageString(beforeImage);
        const hAfter = await hashImageString(afterImage);
        if (hBefore && hAfter && hBefore === hAfter) {
          setIsVerifying(false);
          setErrorMessage(t('samePhotoError'));
          setVerificationResult({
            verdict: 'Not Verified',
            confidence: 0,
            what_was_wrong: ticket.title,
            what_changed: 'None — exact same image provided as after evidence',
            checks: [
              { item: 'Photographic evidence matches reported issue', passed: true },
              { item: 'New physical evidence of repair provided', passed: false },
              { item: 'Distinct before and after states observed', passed: false },
            ],
            red_flags: [
              'Duplicate Photo Detected: The uploaded after-photo is byte-identical to the original complaint photo.',
            ],
            reasoning:
              'Automated image hash verification detected an identical file submission. The repair cannot be certified without genuine completion evidence.',
            isSimulated: false,
          });
          return;
        }
      }

      // 2. Call multimodal verification
      const fullNote = partsUsed.trim()
        ? `${resolutionNote}\nParts/Tools Used: ${partsUsed}`
        : resolutionNote;

      const result = await verifyResolution(
        beforeImage,
        afterImage,
        `${ticket.title}: ${ticket.originalComplaint || ticket.summary}`,
        ticket.location,
        fullNote
      );

      setVerificationResult(result);

      // If verified with high confidence, notify and allow proceeding
      if (result.verdict === 'Verified' && result.confidence >= 70) {
        // Complete verification automatically
        onVerificationComplete(
          'Awaiting Student Confirmation',
          afterImage,
          fullNote,
          result
        );
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setErrorMessage('AI verification service encountered an issue. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-mocha-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-left">
        {/* Modal Header */}
        <div className="p-5 border-b border-mocha-100 flex items-center justify-between bg-latte-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
              <Sparkles className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
                  {t('resolutionModalTitle')}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {ticket.ticketNumber}
                </span>
              </div>
              <p className="text-xs text-mocha-600 mt-0.5">
                {t('resolutionModalSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-mocha-100 hover:bg-mocha-200 text-mocha-600 hover:text-gray-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Ticket Context Pill */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
            <span className="font-bold text-gray-800">{ticket.title}</span>
            <span className="text-gray-500 font-mono ml-2">• {ticket.location}</span>
          </div>

          {/* Photo Comparison Display (Before & After) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before Photo */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 font-mono">
                  {t('beforePhoto')} (Reported)
                </span>
              </div>
              <div className="w-full h-44 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center relative">
                {beforeImage ? (
                  <img
                    src={beforeImage}
                    alt="Before Repair"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-3 text-gray-400 text-xs">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                    <span>No before image attached</span>
                  </div>
                )}
              </div>
            </div>

            {/* After Photo Upload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 font-mono">
                  {t('afterPhoto')} (Evidence) *
                </span>
                {afterImage && (
                  <button
                    onClick={() => {
                      setAfterImage('');
                      setVerificationResult(null);
                    }}
                    className="text-[11px] text-red-600 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="w-full h-44 rounded-2xl bg-emerald-50/40 border-2 border-dashed border-emerald-300 hover:border-emerald-500 transition-colors overflow-hidden flex flex-col items-center justify-center relative p-3 text-center">
                {afterImage ? (
                  <img
                    src={afterImage}
                    alt="After Repair Evidence"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                    <Upload className="w-6 h-6 text-emerald-600 mb-1.5" />
                    <span className="text-xs font-bold text-emerald-900">
                      {t('afterPhotoLabel')}
                    </span>
                    <span className="text-[10px] text-mocha-500 mt-0.5">
                      Click to browse or drag file here
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Demo Helper Quick Action Pills */}
              {!afterImage && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-mocha-400 font-mono">Demo:</span>
                  <button
                    onClick={() => setAfterImage(SAMPLE_FIXED_IMAGE)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 transition-colors"
                  >
                    + Use Repaired Photo
                  </button>
                  {beforeImage && (
                    <button
                      onClick={() => setAfterImage(beforeImage)}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 transition-colors"
                      title="Test client-side SHA-256 hash detection"
                    >
                      + Test Same Photo (Auto-Fail)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form Fields: Work Done Note & Parts */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                {t('resolutionNoteLabel')} *
              </label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Explain the technical fix performed (e.g., Replaced 16A burnt outlet, torqued terminal screws, tested voltage at 228V)..."
                rows={3}
                className="w-full p-3 border border-mocha-200 rounded-2xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                {t('partsUsedLabel')}
              </label>
              <input
                type="text"
                value={partsUsed}
                onChange={(e) => setPartsUsed(e.target.value)}
                placeholder="e.g. 1x Anchor Roma 16A Socket, 2.5 sq mm copper wire segment"
                className="w-full p-2.5 border border-mocha-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Error / Hashing Warning Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-300 rounded-2xl text-xs font-bold text-red-900 flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Verification Result Display */}
          {verificationResult && (
            <div
              className={`p-4 rounded-2xl border space-y-3 animate-in fade-in ${
                verificationResult.verdict === 'Verified'
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50/70 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {verificationResult.verdict === 'Verified' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  )}
                  <span className="text-xs font-extrabold tracking-tight">
                    {verificationResult.verdict === 'Verified'
                      ? t('verifiedByAi')
                      : t('notVerifiedByAi')}
                  </span>
                </div>
                <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-full bg-white border border-gray-300">
                  {t('confidence')}: {verificationResult.confidence}%
                </span>
              </div>

              <p className="text-xs font-medium leading-relaxed">
                {verificationResult.reasoning}
              </p>

              {/* Checklist items */}
              {verificationResult.checks && verificationResult.checks.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-bold block uppercase tracking-wide opacity-80">
                    Automated Verification Checks:
                  </span>
                  <div className="space-y-1">
                    {verificationResult.checks.map((chk, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium">
                        {chk.passed ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                        )}
                        <span className={chk.passed ? 'text-gray-800' : 'text-red-800 font-bold'}>
                          {chk.item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Red Flags if failed */}
              {verificationResult.red_flags && verificationResult.red_flags.length > 0 && (
                <div className="p-2.5 rounded-xl bg-red-100/70 border border-red-200 text-xs text-red-900 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                    Failure Warning Flags:
                  </span>
                  {verificationResult.red_flags.map((flag, idx) => (
                    <p key={idx}>• {flag}</p>
                  ))}
                </div>
              )}

              {/* Failure Actions */}
              {verificationResult.verdict !== 'Verified' && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200">
                  <button
                    onClick={() => {
                      setAfterImage('');
                      setVerificationResult(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-300 text-xs font-bold text-gray-800 transition-colors"
                  >
                    {t('uploadBetterPhoto')}
                  </button>
                  <button
                    onClick={() => {
                      onEscalateToAdmin(
                        verificationResult.reasoning || 'Verification inconclusive'
                      );
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
                  >
                    {t('escalateToAdmin')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Toolbar */}
        <div className="p-4 sm:p-5 border-t border-mocha-100 bg-latte-50/50 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-mocha-500 font-medium hidden sm:block">
            {t('aiNotice')}
          </p>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleRunVerification}
              disabled={isVerifying || !afterImage || !resolutionNote.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-extrabold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? t('loading') : t('submitVerification')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
