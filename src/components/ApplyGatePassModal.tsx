import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Calendar,
  MapPin,
  Phone,
  User,
  GraduationCap,
  Building,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, GatePass } from '../types';

interface ApplyGatePassModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onSubmitGatePass: (gatePass: GatePass) => void;
}

export const ApplyGatePassModal: React.FC<ApplyGatePassModalProps> = ({
  currentUser,
  onClose,
  onSubmitGatePass,
}) => {
  // Pre-fill student info if current persona is student
  const isStudent = currentUser.role === 'Student';

  const [name, setName] = useState(isStudent ? currentUser.name : '');
  const [roomNo, setRoomNo] = useState(isStudent ? (currentUser.roomNumber || '') : '');
  const [rollNo, setRollNo] = useState(isStudent ? '2023BCSE042' : '');
  const [course, setCourse] = useState('B.Tech Computer Science & Engineering');
  const [parentPhone, setParentPhone] = useState('+91 98765 43210');
  const [studentPhone, setStudentPhone] = useState('+91 91234 56789');

  const formatForInput = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [dateFrom, setDateFrom] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    tomorrow.setHours(9, 0, 0, 0);
    return formatForInput(tomorrow);
  });
  const [dateTo, setDateTo] = useState(() => {
    const afterTwoDays = new Date(Date.now() + 72 * 3600 * 1000);
    afterTwoDays.setHours(20, 0, 0, 0);
    return formatForInput(afterTwoDays);
  });
  const [visitAddress, setVisitAddress] = useState('');
  const [purpose, setPurpose] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const commonCourses = [
    'B.Tech Computer Science & Engineering',
    'B.Tech Electronics & Communication',
    'B.Tech Mechanical Engineering',
    'B.Tech Civil Engineering',
    'M.Tech Artificial Intelligence',
    'Master of Business Administration (MBA)',
    'M.Sc Data Science',
    'PhD Research Scholar',
  ];

  const quickPurposes = [
    'Home Visit / Semester Break',
    'Medical Consultation / Emergency',
    'Internship / Off-Campus Placement Interview',
    'Competitive Exam (GATE / CAT / GRE)',
    'Academic Conference / Inter-College Hackathon',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!name.trim()) return setErrorMsg('Student name is required.');
    if (!roomNo.trim()) return setErrorMsg('Hostel & Room number is required.');
    if (!rollNo.trim()) return setErrorMsg('Institute Roll No. is required.');
    if (!course.trim()) return setErrorMsg('Academic Course is required.');
    if (!parentPhone.trim() || parentPhone.trim().length < 8) {
      return setErrorMsg('Valid Parent / Guardian phone number is required.');
    }
    if (!studentPhone.trim() || studentPhone.trim().length < 8) {
      return setErrorMsg('Valid Student mobile number is required.');
    }
    if (!dateFrom || !dateTo) {
      return setErrorMsg('Both departure and return dates are required.');
    }
    if (new Date(dateTo).getTime() <= new Date(dateFrom).getTime()) {
      return setErrorMsg('Return date/time must be strictly after the departure date/time.');
    }
    if (!visitAddress.trim() || visitAddress.trim().length < 10) {
      return setErrorMsg('Please enter a complete destination address (minimum 10 characters).');
    }
    if (!purpose.trim() || purpose.trim().length < 6) {
      return setErrorMsg('Please explain the specific purpose of campus exit (minimum 6 characters).');
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const passNumber = `GP-2026-${randomSuffix}`;

    const newGatePass: GatePass = {
      id: `gp-${Date.now()}`,
      passNumber,
      studentUid: currentUser.uid,
      name: name.trim(),
      roomNo: roomNo.trim(),
      rollNo: rollNo.trim().toUpperCase(),
      course: course.trim(),
      parentPhone: parentPhone.trim(),
      studentPhone: studentPhone.trim(),
      dateFrom,
      dateTo,
      visitAddress: visitAddress.trim(),
      purpose: purpose.trim(),
      status: 'Pending Warden Approval',
      appliedAt: new Date().toISOString(),
      qrCodeData: `CAMPUS-ACCORD-VERIFIED:${passNumber}:${rollNo.trim().toUpperCase()}:PENDING`,
    };

    setIsSuccess(true);
    setTimeout(() => {
      onSubmitGatePass(newGatePass);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-burgundy-950/70 backdrop-blur-md animate-sonner">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-mocha-200/90 shadow-elevated overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-latte-50 via-mocha-50/50 to-burgundy-50/40 border-b border-mocha-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-burgundy-900 text-latte-50 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-mocha-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-burgundy-950 tracking-tight">
                  Apply for Campus Gate Pass
                </h2>
                <span className="text-[10px] font-mono font-bold text-burgundy-900 bg-burgundy-50 px-2 py-0.5 rounded-full border border-burgundy-200/60 uppercase">
                  Hostel Outing Clearance
                </span>
              </div>
              <p className="text-xs text-mocha-600 mt-0.5 font-medium">
                Official warden pre-approval and security barcode for campus exit & re-entry.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-mocha-400 hover:text-mocha-700 rounded-xl hover:bg-mocha-100/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-burgundy-50 border border-burgundy-200 text-burgundy-900 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-sonner">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-burgundy-700" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-sonner">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p>Gate Pass Application Submitted Successfully!</p>
                <p className="text-[11px] font-normal text-emerald-800">
                  Transmitted to Chief Warden Office for verification and QR code generation.
                </p>
              </div>
            </div>
          )}

          <form id="gate-pass-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Section 1: Student Identity */}
            <div className="p-4 bg-latte-50/80 rounded-2xl border border-mocha-200/80 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-burgundy-950 font-mono flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-burgundy-700" />
                1. Student Academic & Hostel Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-mocha-900 mb-1">
                    Student Full Name <span className="text-burgundy-700">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    required
                    className="w-full text-xs p-2.5 bg-white border border-mocha-200 rounded-xl focus:ring-2 focus:ring-burgundy-800/20 focus:border-burgundy-800 font-medium text-burgundy-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mocha-900 mb-1">
                    Institute Roll No. <span className="text-burgundy-700">*</span>
                  </label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. 2023BCSE042"
                    required
                    className="w-full text-xs p-2.5 bg-white border border-mocha-200 rounded-xl focus:ring-2 focus:ring-burgundy-800/20 focus:border-burgundy-800 font-mono font-bold text-burgundy-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mocha-900 mb-1 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-mocha-500" />
                    Hostel & Room No. <span className="text-burgundy-700">*</span>
                  </label>
                  <input
                    type="text"
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                    placeholder="e.g. B-304 (Hostel 3)"
                    required
                    className="w-full text-xs p-2.5 bg-white border border-mocha-200 rounded-xl focus:ring-2 focus:ring-burgundy-800/20 focus:border-burgundy-800 font-medium text-burgundy-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mocha-900 mb-1 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-mocha-500" />
                    Enrolled Course <span className="text-burgundy-700">*</span>
                  </label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-mocha-200 rounded-xl focus:ring-2 focus:ring-burgundy-800/20 focus:border-burgundy-800 font-medium text-burgundy-950 cursor-pointer"
                  >
                    {commonCourses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Telephones */}
            <div className="p-4 bg-latte-50/80 rounded-2xl border border-mocha-200/80 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-burgundy-950 font-mono flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-burgundy-700" />
                2. Contact Numbers (Mandatory for Outing Protocol)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-mocha-900 mb-1">
                    Parent / Guardian Phone No. <span className="text-burgundy-700">*</span>
                  </label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    required
                    className="w-full text-xs p-2.5 bg-white border border-mocha-200 rounded-xl focus:ring-2 focus:ring-burgundy-800/20 focus:border-burgundy-800 font-mono font-medium text-burgundy-950"
                  />
                  <span className="text-[10px] text-mocha-500 block mt-0.5">
                    SMS notification dispatched upon security gate departure.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-mocha-900 mb-1">
                    Student Mobile No. <span className="text-burgundy-700">*</span>
                  </label>
                  <input
                    type="tel"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    placeholder="e.g. +91 91234 56789"
                    required
                    className="w-full text-xs p-2.5 bg-white border border-mocha-200 rounded-xl focus:ring-2 focus:ring-burgundy-800/20 focus:border-burgundy-800 font-mono font-medium text-burgundy-950"
                  />
                  <span className="text-[10px] text-mocha-500 block mt-0.5">
                    Must remain reachable throughout the outing duration.
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Dates & Timings */}
            <div className="p-4 bg-latte-50/80 rounded-2xl border border-mocha-200/80 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-burgundy-950 font-mono flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-burgundy-700" />
                3. Campus Departure & Expected Return Schedule
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-mocha-900 mb-1">
                    Date & Time From (Exit) <span className="text-burgundy-700">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 bg-white border border-mocha-200 rounded-xl focus:ring-2 focus:ring-burgundy-800/20 focus:border-burgundy-800 font-medium text-burgundy-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-mocha-900 mb-1">
                    Date & Time To (Expected Return) <span className="text-burgundy-700">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 bg-white border border-mocha-200 rounded-xl focus:ring-2 focus:ring-burgundy-800/20 focus:border-burgundy-800 font-medium text-burgundy-950"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Destination Address & Purpose */}
            <div className="p-4 bg-latte-50/80 rounded-2xl border border-mocha-200/80 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-burgundy-950 font-mono flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-burgundy-700" />
                4. Destination Address & Purpose of Visit
              </h3>

              <div>
                <label className="block text-xs font-bold text-mocha-900 mb-1">
                  Complete Address of Place of Visit <span className="text-burgundy-700">*</span>
                </label>
                <textarea
                  value={visitAddress}
                  onChange={(e) => setVisitAddress(e.target.value)}
                  placeholder="e.g. Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka 560103"
                  rows={2}
                  required
                  className="w-full text-xs p-2.5 bg-white border border-mocha-200 rounded-xl focus:ring-2 focus:ring-burgundy-800/20 focus:border-burgundy-800 font-medium text-burgundy-950 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-mocha-900 mb-1 flex items-center justify-between">
                  <span>Purpose of Campus Visit / Leave <span className="text-burgundy-700">*</span></span>
                  <span className="text-[10px] text-mocha-500 font-normal">Click quick preset to populate</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {quickPurposes.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPurpose(p)}
                      className="text-[10px] font-semibold bg-white hover:bg-burgundy-50 hover:text-burgundy-900 border border-mocha-200 px-2 py-0.5 rounded-lg text-mocha-700 transition-colors"
                    >
                      + {p}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Home visit for family celebration and semester break"
                  required
                  className="w-full text-xs p-2.5 bg-white border border-mocha-200 rounded-xl focus:ring-2 focus:ring-burgundy-800/20 focus:border-burgundy-800 font-medium text-burgundy-950"
                />
              </div>
            </div>

            {/* Terms Acknowledgment */}
            <div className="p-3 bg-mocha-100/70 rounded-xl border border-mocha-200/90 text-xs text-mocha-800 flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-burgundy-800 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                I hereby declare that all details provided above are truthful. I will abide by the institutional curfew rules and present this digital pass QR code at Security Gate 1 upon departure and arrival.
              </p>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-mocha-50/90 border-t border-mocha-200/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-mocha-700 hover:bg-mocha-200/70 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="gate-pass-form"
            disabled={isSuccess}
            className="px-5 py-2.5 bg-burgundy-900 hover:bg-burgundy-800 text-latte-50 font-extrabold text-xs rounded-xl transition-all shadow-[0_4px_16px_rgba(37,3,9,0.25)] active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-mocha-300" />
            <span>Submit Gate Pass Application</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default ApplyGatePassModal;
