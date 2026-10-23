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
import { CampusBlueprintPicker } from './CampusBlueprintPicker';

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
  const [location, setLocation] = useState(
    'Boys Hostel • 2nd Floor • Room 204'
  );
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
      setErrorMsg('Please select a valid JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be strictly under 5MB.');
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
    if (complaint.trim().length < 5) {
      setErrorMsg('Please describe the problem in at least 5 characters so AI can summarize it.');
      return;
    }
    if (!location || location.trim().length < 2) {
      setErrorMsg('Please select a valid campus blueprint location.');
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.warn('AI Triage warning:', msg);
      setErrorMsg('Automated AI analysis encountered a network delay. You can still confirm and submit your ticket directly.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add clarification without losing draft
  const handleAddClarification = () => {
    if (!clarificationAnswer.trim()) return;
    setComplaint((prev) => `${prev}\n\n[Clarification Details]: ${clarificationAnswer.trim()}`);
    setClarificationAnswer('');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto animate-sonner">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(37,3,9,0.3)] border border-mocha-200/90 overflow-hidden my-6 max-h-[92vh] flex flex-col text-left">
        {/* Header with Step Indicator */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-mocha-100 bg-mocha-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-burgundy-900 text-mocha-300 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-burgundy-950 tracking-tight">
                  Report Campus Concern
                </h2>
                <span className="text-[10px] font-bold text-burgundy-900 bg-burgundy-50 px-2 py-0.5 rounded-full border border-burgundy-200/60 font-mono">
                  Gemini 2.5 Triage
                </span>
              </div>
              <p className="text-xs text-mocha-700 font-medium mt-0.5">
                Every report is analyzed for priority, routed to responsible staff, and checked for duplicates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-mocha-400 hover:text-mocha-700 rounded-xl hover:bg-mocha-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-burgundy-50 border border-burgundy-200 text-burgundy-900 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-sonner">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-burgundy-700" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* AI Analysis In-Progress Shimmer Card */}
          {isAnalyzing && (
            <div className="p-5 rounded-2xl border border-mocha-300/80 bg-gradient-to-r from-mocha-50/80 via-latte-100 to-mocha-50/80 space-y-3 shimmer-ai">
              <div className="flex items-center gap-2.5">
                <Loader2 className="w-5 h-5 text-burgundy-700 animate-spin" />
                <span className="text-xs font-extrabold text-burgundy-950 uppercase tracking-wider">
                  Analyzing Campus Report with Google Gemini...
                </span>
              </div>
              <p className="text-xs text-mocha-800 leading-relaxed font-medium">
                Categorizing department, extracting visible evidence from photos, scoring priority, and cross-referencing active hostel issues for duplicates.
              </p>
            </div>
          )}

          {/* Duplicate Candidate Detection Card */}
          {duplicateCandidate?.hasDuplicate && duplicateCandidate.matchedTicket && (
            <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100/60 rounded-2xl border-2 border-amber-300 shadow-subtle space-y-3.5 animate-sonner">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider font-mono">
                      Existing Issue Detected ({duplicateCandidate.similarityScore}% Match)
                    </h4>
                  </div>
                  <p className="text-xs text-amber-900 mt-1 font-medium leading-relaxed">
                    A report for this facility is already being tracked by maintenance. Instead of creating a duplicate ticket, add your endorsement to elevate its urgency!
                  </p>
                </div>
              </div>

              {/* Matched Ticket Preview */}
              <div className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-sm text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-burgundy-950">
                  <span className="font-mono text-burgundy-900 bg-burgundy-50 px-2 py-0.5 rounded border border-burgundy-200/60">
                    {duplicateCandidate.matchedTicket.ticketNumber}
                  </span>
                  <span className="text-amber-800 font-extrabold bg-amber-50 px-2 py-0.5 rounded">
                    {duplicateCandidate.matchedTicket.affectedCount} Students Affected
                  </span>
                </div>
                <p className="font-bold text-mocha-900 text-[13px]">{duplicateCandidate.matchedTicket.title}</p>
                <p className="text-mocha-700 line-clamp-2">{duplicateCandidate.matchedTicket.summary}</p>
                <div className="flex items-center gap-2 text-[11px] text-mocha-600 pt-1 font-medium">
                  <MapPin className="w-3 h-3 text-mocha-400" />
                  <span>{duplicateCandidate.matchedTicket.location}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onEndorseExisting(duplicateCandidate.matchedTicket!.id);
                    onClose();
                  }}
                  className="px-4 py-2.5 bg-burgundy-900 hover:bg-burgundy-800 text-latte-50 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 shadow-[0_2px_10px_rgba(61,6,16,0.35)] active:scale-95"
                >
                  <ThumbsUp className="w-4 h-4 text-mocha-300 fill-mocha-300" />
                  <span>I Experience This Too (+1 Endorse)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDuplicateCandidate(null)}
                  className="px-3.5 py-2.5 bg-white hover:bg-mocha-50 text-mocha-800 border border-mocha-200 text-xs font-bold rounded-xl transition-colors active:scale-95"
                >
                  Create Separate Ticket
                </button>
              </div>
            </div>
          )}

          {/* AI Analysis Result & Clarification Step */}
          {aiAnalysis && (
            <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50/90 to-teal-50/70 rounded-2xl border border-emerald-200/90 space-y-3 animate-sonner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider font-mono">
                    AI Problem Summary & Triage
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-extrabold px-2.5 py-0.5 rounded-full font-mono border border-emerald-200">
                  {aiAnalysis.category}
                </span>
              </div>

              {/* Title & AI Smart Summary */}
              <div className="p-3.5 bg-white rounded-xl border border-emerald-200/80 space-y-1.5 shadow-sm">
                <p className="text-xs font-bold text-gray-900">{aiAnalysis.title}</p>
                <div className="text-xs text-gray-700 leading-relaxed font-medium">
                  <span className="font-bold text-emerald-800">AI Summary: </span>
                  {aiAnalysis.summary}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-emerald-100 shadow-sm">
                  <span className="text-mocha-500 font-medium block text-[10px] uppercase font-mono">
                    Assigned Department
                  </span>
                  <span className="font-bold text-emerald-900">{aiAnalysis.suggestedCommunity}</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-100 shadow-sm">
                  <span className="text-mocha-500 font-medium block text-[10px] uppercase font-mono">
                    Urgency Scoring
                  </span>
                  <span className="font-bold text-emerald-900">
                    {aiAnalysis.priority} ({aiAnalysis.priorityReason})
                  </span>
                </div>
              </div>

              {/* Conversational Missing Info Step */}
              {aiAnalysis.missingInfo && aiAnalysis.missingInfo.length > 0 && (
                <div className="p-3.5 bg-amber-50/90 rounded-xl border border-amber-200/90 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Technician Clarifications Requested:</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-amber-800 space-y-1 font-medium">
                    {aiAnalysis.missingInfo.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                  <div className="flex gap-2 pt-1.5">
                    <input
                      type="text"
                      value={clarificationAnswer}
                      onChange={(e) => setClarificationAnswer(e.target.value)}
                      placeholder="e.g. Room 304, right tap, leaking continuously"
                      className="flex-1 text-xs px-3 py-2 border border-amber-300 rounded-xl bg-white focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddClarification}
                      className="px-3 py-2 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors active:scale-95"
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-900">
                  Describe the Campus Issue <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    if (complaint.trim().length < 5) {
                      setErrorMsg('Please type a few words of your complaint first so AI can summarize it.');
                      return;
                    }
                    setIsAnalyzing(true);
                    setErrorMsg('');
                    try {
                      const { result } = await aiService.analyzeComplaint(complaint, location, photoBase64);
                      setAiAnalysis(result);
                    } catch (err) {
                      console.warn(err);
                    } finally {
                      setIsAnalyzing(false);
                    }
                  }}
                  disabled={isAnalyzing || complaint.trim().length < 5}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#15803D] rounded-xl text-xs font-bold border border-emerald-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Summarize Problem</span>
                </button>
              </div>
              <textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Describe what is leaking, broken, sparking, or causing disruption (Hindi or English supported)..."
                rows={3}
                required
                className="w-full text-xs sm:text-sm p-3.5 border border-mocha-200/90 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all resize-none placeholder:text-mocha-400 text-gray-900 leading-relaxed bg-mocha-50/30"
              />
              <p className="text-[11px] text-mocha-500 mt-1 font-medium">
                Type naturally — AI will extract symptoms, summarize, and categorize for dispatch.
              </p>
            </div>

            {/* Structured Campus 2D Blueprint Location Picker (No Randomness) */}
            <div className="pt-1">
              <CampusBlueprintPicker
                value={location}
                onChange={(newLoc) => setLocation(newLoc)}
                defaultRoom={currentUser.roomNumber}
              />
            </div>

            {/* Shared Location & Sensitivity Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-mocha-50/60 rounded-2xl border border-mocha-200/70">
              <label className="flex items-start gap-2.5 text-xs text-mocha-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSharedLocation}
                  onChange={(e) => setIsSharedLocation(e.target.checked)}
                  className="mt-0.5 rounded border-mocha-300 text-burgundy-700 focus:ring-burgundy-600"
                />
                <div>
                  <span className="font-bold text-burgundy-950">Shared Facility</span>
                  <p className="text-[11px] text-mocha-600 leading-snug mt-0.5">
                    Allows other students in this block to endorse this issue with +1.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-mocha-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSensitive}
                  onChange={(e) => setIsSensitive(e.target.checked)}
                  className="mt-0.5 rounded border-mocha-300 text-burgundy-700 focus:ring-burgundy-600"
                />
                <div>
                  <span className="font-bold text-burgundy-950 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-burgundy-700" />
                    Confidential Report
                  </span>
                  <p className="text-[11px] text-mocha-600 leading-snug mt-0.5">
                    Hides report from public feed; strictly accessible to Wardens only.
                  </p>
                </div>
              </label>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1.5">
                Photo (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-mocha-200/90 rounded-2xl text-xs font-bold text-mocha-800 hover:bg-mocha-50 cursor-pointer transition-all shadow-subtle active:scale-95">
                  <Camera className="w-4 h-4 text-mocha-500" />
                  <span>{photoFileName ? 'Change Photo' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {photoFileName && (
                  <span className="text-xs text-mocha-700 truncate max-w-[200px] font-mono">
                    {photoFileName}
                  </span>
                )}
              </div>

              {photoBase64 && (
                <div className="mt-2.5 relative w-24 h-24 rounded-2xl overflow-hidden border border-mocha-200 shadow-subtle">
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
                    className="absolute top-1 right-1 p-1 bg-burgundy-950/80 text-latte-50 rounded-full hover:bg-burgundy-900 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-mocha-100 bg-mocha-50/90 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-mocha-700 hover:text-burgundy-950 rounded-xl hover:bg-mocha-200/60 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!aiAnalysis ? (
              <button
                type="submit"
                form="raise-issue-form"
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] hover:bg-[#22C55E] text-white text-xs font-extrabold rounded-2xl shadow-[0_4px_16px_rgba(22,163,74,0.35)] transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>AI Summarizing Problem...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>AI Summarize & Submit</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmSubmission}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#16A34A] hover:bg-[#22C55E] text-white text-xs font-extrabold rounded-2xl shadow-[0_4px_16px_rgba(22,163,74,0.35)] transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-white" />
                <span>Confirm & Create Ticket</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default RaiseIssueModal;
