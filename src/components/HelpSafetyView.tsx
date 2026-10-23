import React, { useState } from 'react';
import {
  PhoneCall,
  Mail,
  ShieldCheck,
  AlertOctagon,
  Lock,
  Building,
  Ambulance,
  Check,
  Copy,
} from 'lucide-react';

export const HelpSafetyView: React.FC = () => {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const copyToClipboard = (num: string) => {
    navigator.clipboard?.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto pb-8">
      {/* Disclaimer Banner */}
      <div className="p-5 bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-[#560917] border border-burgundy-800/80 rounded-3xl flex items-start gap-3.5 shadow-lg text-latte-50">
        <div className="w-10 h-10 rounded-2xl bg-burgundy-800 text-latte-100 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5 border border-burgundy-700">
          <AlertOctagon className="w-5 h-5 text-mocha-300" />
        </div>
        <div className="text-xs leading-relaxed">
          <p className="font-extrabold uppercase tracking-wider text-latte-100 font-mono text-[11px]">
            Immediate Crisis & Safety Protocol
          </p>
          <p className="mt-1 text-latte-200/90 font-medium">
            CampusAccord is a non-emergency campus facility tracking system.{' '}
            <strong className="text-latte-50">If you or anyone on campus is facing immediate physical danger, severe distress, or harassment</strong>, bypass automated ticketing and reach out directly to the official 24/7 helplines below.
          </p>
        </div>
      </div>

      {/* Official External National Helplines */}
      <div className="bg-white border border-mocha-200/90 rounded-3xl p-6 sm:p-7 shadow-subtle space-y-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-burgundy-600 animate-pulse"></div>
            <h3 className="text-base sm:text-lg font-extrabold text-burgundy-950 tracking-tight">
              Verified 24/7 National Helplines (External & Free)
            </h3>
          </div>
          <p className="text-xs text-mocha-600 mt-1 font-medium">
            Government-recognized confidential counseling, crisis intervention, and anti-ragging support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* National Anti-Ragging Helpline */}
          <div className="p-6 bg-gradient-to-br from-latte-50 to-mocha-100/50 rounded-2xl border border-mocha-200/90 flex flex-col justify-between shadow-subtle hover:border-mocha-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold text-burgundy-900 bg-burgundy-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono border border-burgundy-200/60">
                  UGC • Ministry of Education
                </span>
                <span className="text-xs font-bold text-burgundy-800 bg-white px-2 py-0.5 rounded-md border border-mocha-200/80 shadow-sm font-mono">
                  Toll-Free
                </span>
              </div>
              <h4 className="text-base font-extrabold text-burgundy-950 tracking-tight">
                National Anti-Ragging Helpline
              </h4>
              <p className="text-xs text-mocha-700 mt-1.5 leading-relaxed font-medium">
                Official confidential reporting, rapid grievance redressal, and institutional protection for higher education students across India.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-mocha-200/80 space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <a
                  href="tel:18001805522"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-burgundy-900 hover:bg-burgundy-800 text-latte-50 rounded-xl font-bold transition-all shadow-md active:scale-95"
                >
                  <PhoneCall className="w-4 h-4 text-mocha-300" />
                  <span>Call 1800-180-5522</span>
                </a>
                <button
                  onClick={() => copyToClipboard('18001805522')}
                  title="Copy telephone number"
                  className="p-2.5 bg-white border border-mocha-200 hover:bg-latte-100 rounded-xl text-mocha-700 transition-colors shadow-subtle"
                >
                  {copiedNumber === '18001805522' ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <a
                href="mailto:helpline@antiragging.in"
                className="flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-latte-100 rounded-xl border border-mocha-200 text-mocha-800 font-bold transition-colors shadow-subtle"
              >
                <Mail className="w-4 h-4 text-mocha-400" />
                <span>helpline@antiragging.in</span>
              </a>
            </div>
          </div>

          {/* Tele-MANAS */}
          <div className="p-6 bg-gradient-to-br from-latte-50 to-mocha-100/50 rounded-2xl border border-mocha-200/90 flex flex-col justify-between shadow-subtle hover:border-mocha-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold text-mocha-900 bg-mocha-200/90 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono border border-mocha-300/60">
                  MoHFW • Govt. of India
                </span>
                <span className="text-xs font-bold text-mocha-800 bg-white px-2 py-0.5 rounded-md border border-mocha-200/80 shadow-sm font-mono">
                  24/7 Free
                </span>
              </div>
              <h4 className="text-base font-extrabold text-burgundy-950 tracking-tight">
                Tele-MANAS Mental Health Support
              </h4>
              <p className="text-xs text-mocha-700 mt-1.5 leading-relaxed font-medium">
                Round-the-clock professional psychological counseling, academic stress management, and emotional crisis intervention in 20+ regional languages.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-mocha-200/80 space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <a
                  href="tel:14416"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-burgundy-900 hover:bg-burgundy-800 text-latte-50 rounded-xl font-bold transition-all shadow-md active:scale-95"
                >
                  <PhoneCall className="w-4 h-4 text-mocha-300" />
                  <span>Call 14416 (Short Code)</span>
                </a>
                <button
                  onClick={() => copyToClipboard('14416')}
                  title="Copy telephone number"
                  className="p-2.5 bg-white border border-mocha-200 hover:bg-latte-100 rounded-xl text-mocha-700 transition-colors shadow-subtle"
                >
                  {copiedNumber === '14416' ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <a
                href="tel:18008914416"
                className="flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-latte-100 rounded-xl border border-mocha-200 text-burgundy-900 font-bold transition-colors shadow-subtle"
              >
                <PhoneCall className="w-4 h-4 text-burgundy-800" />
                <span>1800-891-4416 (Toll-Free Backup)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Campus Emergency Contacts */}
      <div className="bg-white border border-mocha-200/90 rounded-3xl p-6 sm:p-7 shadow-subtle space-y-5">
        <div>
          <div className="flex items-center gap-2.5">
            <Building className="w-4 h-4 text-burgundy-950" />
            <h3 className="text-base sm:text-lg font-extrabold text-burgundy-950 tracking-tight">
              Apex Institute of Technology Campus Emergency Desks
            </h3>
          </div>
          <p className="text-xs text-mocha-600 mt-1 font-medium">
            Dedicated on-campus personnel for physical emergency response and healthcare.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="p-4 bg-latte-50/90 rounded-2xl border border-mocha-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-burgundy-950 mb-1">
                <ShieldCheck className="w-4 h-4 text-burgundy-700" />
                <span>Main Security Gate</span>
              </div>
              <p className="text-mocha-600 font-medium">Gate 1 Control Room Desk</p>
              <p className="font-mono text-burgundy-950 font-extrabold mt-2 text-sm">
                +91 80-2345-6701
              </p>
            </div>
            <span className="text-[10px] text-burgundy-900 font-bold bg-burgundy-50 border border-burgundy-200/60 px-2 py-0.5 rounded-md mt-3 inline-block self-start font-mono">
              24/7 Security Guard On Duty
            </span>
          </div>

          <div className="p-4 bg-latte-50/90 rounded-2xl border border-mocha-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-burgundy-950 mb-1">
                <Ambulance className="w-4 h-4 text-burgundy-800" />
                <span>Campus Health Center</span>
              </div>
              <p className="text-mocha-600 font-medium">Behind Student Activity Center</p>
              <p className="font-mono text-burgundy-950 font-extrabold mt-2 text-sm">
                +91 80-2345-6709
              </p>
            </div>
            <span className="text-[10px] text-burgundy-900 font-bold bg-burgundy-50 border border-burgundy-200/60 px-2 py-0.5 rounded-md mt-3 inline-block self-start font-mono">
              Doctor & Ambulance on Call
            </span>
          </div>

          <div className="p-4 bg-latte-50/90 rounded-2xl border border-mocha-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-burgundy-950 mb-1">
                <Lock className="w-4 h-4 text-mocha-700" />
                <span>Chief Warden Office</span>
              </div>
              <p className="text-mocha-600 font-medium">Hostel Administrative Wing</p>
              <p className="font-mono text-burgundy-950 font-extrabold mt-2 text-sm">
                +91 80-2345-6720
              </p>
            </div>
            <span className="text-[10px] text-mocha-900 font-bold bg-mocha-100 border border-mocha-200 px-2 py-0.5 rounded-md mt-3 inline-block self-start font-mono">
              Confidential Escalations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HelpSafetyView;
