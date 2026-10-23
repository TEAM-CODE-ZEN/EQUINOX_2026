import React from 'react';
import {
  PhoneCall,
  Mail,
  ShieldCheck,
  AlertOctagon,
  Lock,
  Building,
  Ambulance,
} from 'lucide-react';

export const HelpSafetyView: React.FC = () => {
  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Disclaimer Banner */}
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
        <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-rose-900 leading-relaxed">
          <p className="font-bold uppercase tracking-wider text-rose-950">
            Immediate Assistance & Emergency Notice
          </p>
          <p className="mt-1">
            CampusAccord is an issue tracking and community coordination platform and is{' '}
            <strong>NOT an emergency response service</strong>. If you or someone else is in immediate physical danger, medical distress, or experiencing an acute crisis, contact official emergency responders or the 24/7 helplines below immediately.
          </p>
        </div>
      </div>

      {/* Official External National Helplines */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
            <h3 className="text-base font-bold text-slate-900">
              Official National Helplines (External)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Free, government-recognized 24/7 confidential counseling and grievance support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* National Anti-Ragging Helpline */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full">
                  UGC / Ministry of Education
                </span>
                <span className="text-xs text-slate-500">Toll-Free</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                National Anti-Ragging Helpline
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Confidential reporting and anti-ragging crisis intervention for higher education institutions across India.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 space-y-2 text-xs">
              <a
                href="tel:18001805522"
                className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-teal-700 hover:text-teal-900 font-bold transition-colors shadow-sm"
              >
                <PhoneCall className="w-4 h-4 text-teal-600" />
                <span>1800-180-5522 (Toll-Free)</span>
              </a>

              <a
                href="mailto:helpline@antiragging.in"
                className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-slate-700 hover:text-slate-900 font-medium transition-colors"
              >
                <Mail className="w-4 h-4 text-slate-500" />
                <span>helpline@antiragging.in</span>
              </a>
            </div>
          </div>

          {/* Tele-MANAS */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-indigo-800 bg-indigo-100/80 px-2.5 py-0.5 rounded-full">
                  Ministry of Health & Family Welfare
                </span>
                <span className="text-xs text-indigo-700 font-bold">24/7 Available</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Tele-MANAS — National Mental Health Helpline
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Round-the-clock professional psychological counseling, emotional well-being, and crisis intervention in multiple languages.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 space-y-2 text-xs">
              <a
                href="tel:14416"
                className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-indigo-700 hover:text-indigo-900 font-bold transition-colors shadow-sm"
              >
                <PhoneCall className="w-4 h-4 text-indigo-600" />
                <span>14416 (Short Code)</span>
              </a>

              <a
                href="tel:18008914416"
                className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-indigo-700 hover:text-indigo-900 font-bold transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-indigo-600" />
                <span>1800-891-4416 (Toll-Free Alternative)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Campus Emergency Contacts */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
            <h3 className="text-base font-bold text-slate-900">
              Campus Emergency Officers & Medical Desk (AIT)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Local campus administration contacts for rapid physical assistance on campus.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Main Security Gate</span>
            </div>
            <p className="text-slate-600">Main Entry Gate 1 Control Room</p>
            <p className="font-mono text-slate-800 font-bold mt-2">+91 (0) 80-2345-6701</p>
            <span className="text-[10px] text-slate-400">24/7 Security Desk</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
              <Ambulance className="w-4 h-4 text-rose-600" />
              <span>Campus Medical Health Center</span>
            </div>
            <p className="text-slate-600">Behind Student Activity Center</p>
            <p className="font-mono text-slate-800 font-bold mt-2">+91 (0) 80-2345-6709</p>
            <span className="text-[10px] text-slate-400">Resident Nurse on Duty</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
              <Building className="w-4 h-4 text-indigo-600" />
              <span>Chief Warden Office</span>
            </div>
            <p className="text-slate-600">Hostel Administration Block</p>
            <p className="font-mono text-slate-800 font-bold mt-2">+91 (0) 80-2345-6715</p>
            <span className="text-[10px] text-slate-400">Office Hours + On-Call</span>
          </div>
        </div>
      </div>

      {/* Sensitive Report Privacy Notice */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-teal-400 uppercase tracking-wider">
          <Lock className="w-4 h-4" />
          <span>Strict Confidentiality Guarantee</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          When marking a ticket as <strong>"Sensitive / Confidential"</strong> during submission, CampusAccord guarantees that the report is excluded from public feeds, general student search, and committee boards. Only verified Wardens and appointed security personnel have access to review sensitive cases.
        </p>
      </div>
    </div>
  );
};
