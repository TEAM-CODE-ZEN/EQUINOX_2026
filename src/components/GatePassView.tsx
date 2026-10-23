import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  QrCode,
  Calendar,
  MapPin,
  Phone,
  User,
  GraduationCap,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Printer,
  Copy,
  Check,
  CheckCheck,
  LogOut,
  LogIn,
} from 'lucide-react';
import { GatePass, UserProfile, GatePassStatus } from '../types';

interface GatePassViewProps {
  gatePasses: GatePass[];
  currentUser: UserProfile;
  onOpenApplyModal: () => void;
  onReviewGatePass: (passId: string, status: 'Approved' | 'Rejected', reason?: string) => void;
  onRecordSecurityStatus: (passId: string, action: 'checkout' | 'checkin') => void;
}

export const GatePassView: React.FC<GatePassViewProps> = ({
  gatePasses,
  currentUser,
  onOpenApplyModal,
  onReviewGatePass,
  onRecordSecurityStatus,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rejectingPassId, setRejectingPassId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const isWardenOrAdmin =
    currentUser.role === 'Admin' ||
    (currentUser.role === 'Campus Staff' && (currentUser.designation === 'Warden' || currentUser.designation === 'Head Warden'));
  const isSecurityStaff =
    currentUser.role === 'Campus Staff' && currentUser.designation === 'Security Guard';

  const copyPassCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredPasses = gatePasses.filter((pass) => {
    if (filterStatus === 'All') return true;
    return pass.status === filterStatus;
  });

  const getStatusBadge = (status: GatePassStatus) => {
    switch (status) {
      case 'Approved':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          dot: 'bg-emerald-600',
          icon: CheckCircle2,
        };
      case 'Pending Warden Approval':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200/80',
          dot: 'bg-amber-500 animate-pulse',
          icon: Clock,
        };
      case 'Out of Campus':
        return {
          bg: 'bg-burgundy-100 text-burgundy-900 border-burgundy-300',
          dot: 'bg-burgundy-700 animate-ping',
          icon: LogOut,
        };
      case 'Returned':
        return {
          bg: 'bg-latte-200 text-mocha-900 border-mocha-300',
          dot: 'bg-mocha-600',
          icon: CheckCheck,
        };
      case 'Rejected':
        return {
          bg: 'bg-rose-50 text-rose-900 border-rose-200',
          dot: 'bg-rose-600',
          icon: AlertTriangle,
        };
      default:
        return {
          bg: 'bg-mocha-50 text-mocha-800 border-mocha-200',
          dot: 'bg-mocha-500',
          icon: Clock,
        };
    }
  };

  const handleRejectSubmit = (passId: string) => {
    if (!rejectionReason.trim()) return;
    onReviewGatePass(passId, 'Rejected', rejectionReason.trim());
    setRejectingPassId(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6 text-left pb-10">
      {/* Top Banner */}
      <div className="p-6 bg-white rounded-3xl border border-mocha-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-burgundy-900 text-latte-50 flex items-center justify-center shadow-md">
              <QrCode className="w-5 h-5 text-mocha-300" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-burgundy-950 tracking-tight">
              Hostel Outing & Digital Gate Pass Clearance
            </h2>
            <span className="text-[10px] font-mono font-bold bg-mocha-100 text-mocha-800 px-2.5 py-0.5 rounded-full border border-mocha-200">
              Live Gate 1 Sync
            </span>
          </div>
          <p className="text-xs text-mocha-600 mt-1 font-medium">
            Electronic campus exit authorization, parent SMS acknowledgement, and warden approval workflow.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onOpenApplyModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-burgundy-900 hover:bg-burgundy-800 text-latte-50 text-xs font-extrabold rounded-2xl transition-all shadow-[0_4px_16px_rgba(37,3,9,0.25)] active:scale-95 self-start sm:self-auto ring-1 ring-mocha-200/40"
        >
          <Plus className="w-4 h-4 text-mocha-300 stroke-[2.5]" />
          <span>Apply for Gate Pass</span>
        </button>
      </div>

      {/* Filter Tabs & Quick Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-mocha-200/90 shadow-subtle">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'Pending Warden Approval', 'Approved', 'Out of Campus', 'Returned'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === st
                  ? 'bg-burgundy-900 text-latte-50 shadow-sm'
                  : 'bg-latte-100/80 text-mocha-700 hover:text-burgundy-950 hover:bg-latte-200'
              }`}
            >
              {st === 'Pending Warden Approval' ? 'Pending Review' : st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-mocha-700 font-bold self-start sm:self-auto">
          <span>{filteredPasses.length} Active Records</span>
        </div>
      </div>

      {/* Gate Passes Cards List */}
      <div className="space-y-5">
        {filteredPasses.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-mocha-200 text-center space-y-3 shadow-subtle">
            <div className="w-12 h-12 rounded-2xl bg-mocha-100 flex items-center justify-center mx-auto text-mocha-500">
              <QrCode className="w-6 h-6 text-mocha-400" />
            </div>
            <h3 className="text-sm font-extrabold text-burgundy-950">No Gate Passes in this view</h3>
            <p className="text-xs text-mocha-600 max-w-sm mx-auto">
              No outing permits match the selected filter. Click &ldquo;Apply for Gate Pass&rdquo; to create a new departure request.
            </p>
            <button
              onClick={onOpenApplyModal}
              className="mt-2 px-4 py-2 bg-burgundy-900 text-latte-50 text-xs font-bold rounded-xl hover:bg-burgundy-800 transition-colors shadow-sm"
            >
              Create Gate Pass Request
            </button>
          </div>
        ) : (
          filteredPasses.map((pass) => {
            const badge = getStatusBadge(pass.status);
            const StatusIcon = badge.icon;
            const isStudentOwner = currentUser.uid === pass.studentUid;

            return (
              <div
                key={pass.id}
                className="bg-white rounded-3xl border border-mocha-200/90 shadow-subtle overflow-hidden hover:shadow-card transition-all"
              >
                {/* Top Boarding-Pass-Style Header Strip */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-latte-50 via-mocha-50/70 to-burgundy-50/40 border-b border-mocha-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs sm:text-sm font-extrabold text-burgundy-950 bg-white px-3 py-1 rounded-xl border border-mocha-200 shadow-sm">
                      {pass.passNumber}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full border ${badge.bg}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{pass.status}</span>
                    </span>
                    {isStudentOwner && (
                      <span className="text-[10px] font-mono bg-burgundy-900 text-latte-50 px-2 py-0.5 rounded-md font-bold">
                        My Application
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-mocha-600 font-mono">
                    <span>Applied: {new Date(pass.appliedAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => copyPassCode(pass.passNumber)}
                      title="Copy Pass Number"
                      className="p-1.5 bg-white border border-mocha-200 hover:bg-latte-100 rounded-lg text-mocha-700 transition-colors"
                    >
                      {copiedId === pass.passNumber ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Main Pass Body: 2 Columns (Details + Digital QR Pass) */}
                <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Details Grid */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Student Info Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-3.5 bg-latte-50/70 rounded-2xl border border-mocha-200/70">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-mocha-500 font-bold block">
                          Student Name
                        </span>
                        <span className="text-xs font-extrabold text-burgundy-950 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-burgundy-700" />
                          {pass.name}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase text-mocha-500 font-bold block">
                          Roll Number
                        </span>
                        <span className="text-xs font-mono font-bold text-burgundy-950 mt-0.5 block">
                          {pass.rollNo}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase text-mocha-500 font-bold block">
                          Room & Hostel
                        </span>
                        <span className="text-xs font-bold text-mocha-900 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-mocha-500" />
                          {pass.roomNo}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase text-mocha-500 font-bold block">
                          Course
                        </span>
                        <span className="text-xs font-medium text-mocha-800 flex items-center gap-1 mt-0.5 truncate">
                          <GraduationCap className="w-3 h-3 text-mocha-500 flex-shrink-0" />
                          <span className="truncate">{pass.course.split(' ')[0]}</span>
                        </span>
                      </div>
                    </div>

                    {/* Schedule Timing Box */}
                    <div className="p-4 bg-white rounded-2xl border border-mocha-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-mocha-500 block">
                          Departure (From Campus)
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm font-extrabold text-burgundy-950">
                          <Calendar className="w-4 h-4 text-burgundy-700" />
                          <span>{new Date(pass.dateFrom).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-mocha-100 text-burgundy-900 flex-shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </div>

                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-mocha-500 block">
                          Expected Return (To Campus)
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm font-extrabold text-burgundy-950">
                          <Calendar className="w-4 h-4 text-emerald-700" />
                          <span>{new Date(pass.dateTo).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Destination Address & Purpose */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      <div className="p-3.5 bg-mocha-50/50 rounded-2xl border border-mocha-200/70">
                        <span className="text-[10px] font-mono font-bold uppercase text-mocha-500 block mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-burgundy-700" />
                          Place of Visit (Destination)
                        </span>
                        <p className="text-mocha-900 font-medium leading-relaxed">
                          {pass.visitAddress}
                        </p>
                      </div>

                      <div className="p-3.5 bg-mocha-50/50 rounded-2xl border border-mocha-200/70">
                        <span className="text-[10px] font-mono font-bold uppercase text-mocha-500 block mb-1">
                          Purpose of Outing
                        </span>
                        <p className="text-mocha-900 font-medium leading-relaxed">
                          {pass.purpose}
                        </p>
                      </div>
                    </div>

                    {/* Contacts & Telephones */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-mocha-700 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-mocha-500" />
                        <span>Parent / Guardian:</span>
                        <strong className="font-mono text-burgundy-950">{pass.parentPhone}</strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-mocha-500" />
                        <span>Student Mobile:</span>
                        <strong className="font-mono text-burgundy-950">{pass.studentPhone}</strong>
                      </div>
                    </div>

                    {/* Rejection / Warning Note if Rejected */}
                    {pass.status === 'Rejected' && pass.rejectionReason && (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs space-y-1">
                        <span className="font-extrabold uppercase font-mono text-[10px]">Warden Rejection Reason:</span>
                        <p className="font-medium">{pass.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Digital QR Boarding Card & Security Console */}
                  <div className="bg-gradient-to-br from-mocha-50 to-latte-100 rounded-2xl border-2 border-dashed border-mocha-300 p-5 flex flex-col justify-between text-center relative">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-mocha-200 mb-3">
                        <div className="text-left">
                          <span className="text-[9px] uppercase font-mono font-extrabold text-burgundy-900 block">
                            Campus Security
                          </span>
                          <span className="text-xs font-bold text-burgundy-950">Gate 1 Clearance</span>
                        </div>
                        <ShieldCheck className="w-5 h-5 text-burgundy-800" />
                      </div>

                      {/* Simulated QR Code Box */}
                      <div className="p-3 bg-white rounded-2xl border border-mocha-200 shadow-sm max-w-[150px] mx-auto mb-3">
                        <div className="aspect-square bg-burgundy-950 text-latte-50 rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
                          <QrCode className="w-16 h-16 text-latte-50" />
                          <span className="text-[8px] font-mono tracking-widest text-mocha-300 mt-1">
                            {pass.passNumber}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] font-mono text-mocha-700 font-bold">
                        {pass.status === 'Approved' ? 'SCAN TO EXIT / ENTER' : pass.status.toUpperCase()}
                      </p>

                      {/* Warden Signature / Approval Badge */}
                      {pass.approvedByWardenName && (
                        <div className="mt-3 p-2 bg-emerald-50/90 border border-emerald-200 rounded-xl text-left">
                          <span className="text-[9px] font-mono uppercase text-emerald-800 font-bold block">
                            Digitally Endorsed By:
                          </span>
                          <span className="text-xs font-bold text-emerald-950 block">
                            {pass.approvedByWardenName}
                          </span>
                          {pass.approvedAt && (
                            <span className="text-[9px] text-emerald-700 font-mono">
                              {new Date(pass.approvedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Security Timings */}
                      {(pass.securityCheckOutTime || pass.securityCheckInTime) && (
                        <div className="mt-2 text-left space-y-1 text-[11px] text-mocha-800 font-mono bg-white p-2 rounded-xl border border-mocha-200">
                          {pass.securityCheckOutTime && <div>Gate Exit: {pass.securityCheckOutTime}</div>}
                          {pass.securityCheckInTime && <div>Gate Return: {pass.securityCheckInTime}</div>}
                        </div>
                      )}
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-mocha-200 space-y-2">
                      {/* Warden Controls */}
                      {isWardenOrAdmin && pass.status === 'Pending Warden Approval' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onReviewGatePass(pass.id, 'Approved')}
                            className="flex-1 py-2 px-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
                          >
                            Approve Pass
                          </button>
                          <button
                            onClick={() => setRejectingPassId(pass.id)}
                            className="py-2 px-3 bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 rounded-xl text-xs font-bold transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {/* Security Guard Controls */}
                      {(isSecurityStaff || isWardenOrAdmin) && pass.status === 'Approved' && (
                        <button
                          onClick={() => onRecordSecurityStatus(pass.id, 'checkout')}
                          className="w-full py-2 px-3 bg-burgundy-900 hover:bg-burgundy-800 text-latte-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <LogOut className="w-3.5 h-3.5 text-mocha-300" />
                          <span>Security Check-Out</span>
                        </button>
                      )}

                      {(isSecurityStaff || isWardenOrAdmin) && pass.status === 'Out of Campus' && (
                        <button
                          onClick={() => onRecordSecurityStatus(pass.id, 'checkin')}
                          className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Security Check-In (Returned)</span>
                        </button>
                      )}

                      {/* Student Print / Show Button */}
                      <button
                        onClick={() => window.print()}
                        className="w-full py-2 px-3 bg-white hover:bg-latte-100 text-mocha-800 border border-mocha-200 rounded-xl text-xs font-bold shadow-subtle transition-all flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-mocha-500" />
                        <span>Print Digital Pass</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Rejection Reason Input if rejecting */}
                {rejectingPassId === pass.id && (
                  <div className="p-4 bg-rose-50 border-t border-rose-200 space-y-2">
                    <p className="text-xs font-bold text-rose-950">Specify Reason for Gate Pass Rejection:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g., Institutional examination week / Attendance below 75%"
                        className="flex-1 text-xs p-2.5 bg-white border border-rose-300 rounded-xl focus:ring-1 focus:ring-rose-500"
                      />
                      <button
                        onClick={() => handleRejectSubmit(pass.id)}
                        className="px-4 py-2 bg-rose-700 text-white text-xs font-bold rounded-xl hover:bg-rose-600"
                      >
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => setRejectingPassId(null)}
                        className="px-3 py-2 bg-white text-mocha-700 text-xs font-bold rounded-xl border border-mocha-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default GatePassView;
