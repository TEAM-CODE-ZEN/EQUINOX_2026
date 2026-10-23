import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Camera,
  MapPin,
  AlertCircle,
  ShieldAlert,
  ThumbsUp,
  HelpCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { Ticket, UserProfile } from '../types';
import { aiService, DuplicateMatchResult } from '../services/aiService';
import { AiAnalysisResult } from '../utils/validation';

interface RaiseIssueModalProps {
  onClose: () => void;
  currentUser: UserProfile;
  activeTickets: Ticket[];
  onTicketCreated: (ticket: Ticket) => void;
  onEndorseExisting: (ticketId: string) => void;
}

export const RaiseIssueModal: React.FC<RaiseIssueModalProps> = ({
  onClose,
  currentUser,
  activeTickets,
  onTicketCreated,
  onEndorseExisting,
}) => {
  const [complaint, setComplaint] = useState('');
  const [location, setLocation] = useState(currentUser.roomNumber ? `Hostel 3, ${currentUser.roomNumber}` : '');
  const [isSharedLocation, setIsSharedLocation] = useState(true);
  const [isSensitive, setIsSensitive] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(undefined);
  const [photoFileName, setPhotoFileName] = useState<string | undefined>(undefined);

  // States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResult | null>(null);
  const [duplicateCandidate, setDuplicateCandidate] = useState<DuplicateMatchResult | null>(null);
  const [clarificationAnswer, setClarificationAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Photo selection with size & type validation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('Please select a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be under 5MB.');
      return;
    }

    setErrorMsg('');
    setPhotoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Step 1: Trigger AI Triage & Duplicate Detection
  const handleAnalyzeAndReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (complaint.trim().length < 10) {
      setErrorMsg('Please provide at least 10 characters describing the issue.');
      return;
    }
    if (location.trim().length < 2) {
      setErrorMsg('Please provide a campus location.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg('');

    try {
      // 1. Run Gemini extraction
      const { result } = await aiService.analyzeComplaint(
        complaint,
        location,
        photoBase64
      );
      setAiAnalysis(result);

      // 2. Check for duplicate ticket candidates
      const duplicate = aiService.findDuplicateCandidate(
        complaint,
        location,
        result.category,
        activeTickets,
        isSharedLocation
      );
      setDuplicateCandidate(duplicate);
    } catch (_err) {
      setErrorMsg('Analysis failed. You can still submit the ticket directly.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add clarification without losing draft
  const handleAddClarification = () => {
    if (!clarificationAnswer.trim()) return;
    setComplaint((prev) => `${prev}\n\n[Additional Details]: ${clarificationAnswer.trim()}`);
    setClarificationAnswer('');
    // Clear missing info from current analysis view
    if (aiAnalysis) {
      setAiAnalysis({
        ...aiAnalysis,
        missingInfo: [],
      });
    }
  };

  // Final Ticket Submission
  const handleConfirmSubmission = () => {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TKT-2026-${randNum}`;

    const newTicket: Ticket = {
      id: `tkt-${Date.now()}`,
      ticketNumber,
      originalComplaint: complaint.trim(),
      title: aiAnalysis?.title || `${location} Issue`,
      summary: aiAnalysis?.summary || complaint.trim().substring(0, 120),
      category: aiAnalysis?.category || 'Maintenance',
      communityId: aiAnalysis?.suggestedCommunity === 'Mess' ? 'comm-mess' : 'comm-maint',
      location: location.trim(),
      isSharedLocation,
      isSensitive,
      reporterUid: currentUser.uid,
      reporterName: currentUser.name,
      reporterRoom: currentUser.roomNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Open',
      priority: aiAnalysis?.priority || 'Medium',
      priorityReason: aiAnalysis?.priorityReason || 'Reported via student portal.',
      affectedCount: 1,
      endorsedUserIds: [currentUser.uid],
      photoUrls: photoBase64 ? [photoBase64] : [],
      reopenCount: 0,
      aiMetadata: aiAnalysis
        ? {
            model: 'gemini-2.5-flash',
            missingInfo: aiAnalysis.missingInfo,
            visibleEvidence: aiAnalysis.visibleEvidence,
            suggestedAction: `Route to ${aiAnalysis.suggestedCommunity} staff`,
          }
        : undefined,
    };

    onTicketCreated(newTicket);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-elevated border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col text-left">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Raise Campus Concern
              </h2>
              <p className="text-xs text-slate-500">
                AI will triage your complaint and detect duplicate reports automatically.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* If duplicate found, show candidate first! */}
          {duplicateCandidate?.hasDuplicate && duplicateCandidate.matchedTicket && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Existing Active Ticket Found ({duplicateCandidate.similarityScore}% Match)
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    An issue has already been reported for this facility. Instead of creating a duplicate, you can endorse it to increase its priority!
                  </p>
                </div>
              </div>

              {/* Matched Ticket Preview */}
              <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>{duplicateCandidate.matchedTicket.ticketNumber} — {duplicateCandidate.matchedTicket.title}</span>
                  <span className="text-teal-700 font-bold">{duplicateCandidate.matchedTicket.affectedCount} Affected</span>
                </div>
                <p className="text-slate-600">{duplicateCandidate.matchedTicket.summary}</p>
                <p className="text-[11px] text-slate-500">Location: {duplicateCandidate.matchedTicket.location}</p>
              </div>

              {/* Dual Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onEndorseExisting(duplicateCandidate.matchedTicket!.id);
                    onClose();
                  }}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  I Have This Issue Too (+1)
                </button>
                <button
                  type="button"
                  onClick={() => setDuplicateCandidate(null)}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium rounded-lg transition-colors"
                >
                  Create Separate Ticket
                </button>
              </div>
            </div>
          )}

          {/* AI Analysis Result & Clarification Step */}
          {aiAnalysis && (
            <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    AI Pre-Triage Suggestion
                  </span>
                </div>
                <span className="text-[10px] bg-indigo-200 text-indigo-900 font-bold px-2 py-0.5 rounded-full">
                  Category: {aiAnalysis.category}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white rounded-lg border border-indigo-100">
                  <span className="text-slate-500">Routing:</span>{' '}
                  <span className="font-semibold text-slate-900">{aiAnalysis.suggestedCommunity}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-indigo-100">
                  <span className="text-slate-500">Priority:</span>{' '}
                  <span className="font-semibold text-slate-900">{aiAnalysis.priority}</span>
                </div>
              </div>

              {/* Conversational Missing Info Step */}
              {aiAnalysis.missingInfo && aiAnalysis.missingInfo.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    Helpful Details Missing:
                  </div>
                  <ul className="list-disc list-inside text-xs text-amber-800 space-y-1">
                    {aiAnalysis.missingInfo.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={clarificationAnswer}
                      onChange={(e) => setClarificationAnswer(e.target.value)}
                      placeholder="Add clarification (e.g., Room 304, 3rd floor west)"
                      className="flex-1 text-xs px-2.5 py-1.5 border border-amber-300 rounded-lg bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddClarification}
                      className="px-2.5 py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg"
                    >
                      Update
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Fields */}
          <form id="raise-issue-form" onSubmit={handleAnalyzeAndReview} className="space-y-4">
            {/* Written Complaint */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Describe the Problem <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Explain what is broken, leaking, defective, or causing disruption..."
                rows={4}
                required
                className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 resize-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Be specific about symptoms, sounds, or duration.
              </p>
            </div>

            {/* Campus Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Campus Location <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Hostel 3, Block B, 2nd Floor Corridor Water Station"
                  required
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>

            {/* Shared Location & Sensitivity Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSharedLocation}
                  onChange={(e) => setIsSharedLocation(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <div>
                  <span className="font-semibold">Shared Campus Facility</span>
                  <p className="text-[11px] text-slate-500">
                    Allows other affected students to +1 endorse this ticket.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSensitive}
                  onChange={(e) => setIsSensitive(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-purple-700 focus:ring-purple-700"
                />
                <div>
                  <span className="font-semibold text-purple-900 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-purple-700" />
                    Sensitive / Confidential Report
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Hidden from general feed; only visible to Wardens & authorized personnel.
                  </p>
                </div>
              </label>
            </div>

            {/* Photograph Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Attach Supporting Photograph (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span>{photoFileName ? 'Change Photo' : 'Upload Image'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {photoFileName && (
                  <span className="text-xs text-slate-600 truncate max-w-[200px]">
                    {photoFileName}
                  </span>
                )}
              </div>

              {photoBase64 && (
                <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src={photoBase64}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoBase64(undefined);
                      setPhotoFileName(undefined);
                    }}
                    className="absolute top-1 right-1 p-0.5 bg-slate-900/80 text-white rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!aiAnalysis ? (
              <button
                type="submit"
                form="raise-issue-form"
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                    <span>Analyzing with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span>Analyze & Review Ticket</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmSubmission}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Confirm & Submit Ticket</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
