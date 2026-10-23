import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Cpu,
} from 'lucide-react';
import { UserProfile } from '../types';
import { DEMO_USERS } from '../services/mockData';
import { CAMPUS_ROUTING_GUIDE } from '../services/aiConfig';

interface AdminGovernanceViewProps {
  currentUser: UserProfile;
}

export const AdminGovernanceView: React.FC<AdminGovernanceViewProps> = ({ currentUser: _currentUser }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'routing' | 'security'>('users');
  const [users] = useState<UserProfile[]>(DEMO_USERS);
  const [copiedCode, setCopiedCode] = useState(false);

  const copyBootstrapCode = () => {
    const code = `POST /api/admin/bootstrap\nContent-Type: application/json\n\n{\n  "bootstrapSecret": "$ADMIN_BOOTSTRAP_SECRET",\n  "userUid": "<FIREBASE_USER_UID>",\n  "email": "admin@campus.edu"\n}`;
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 text-left pb-8">
      {/* Header */}
      <div className="p-6 bg-white rounded-3xl border border-mocha-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-burgundy-100 text-burgundy-900 flex items-center justify-center border border-burgundy-200/70">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-burgundy-950 tracking-tight">
              Campus Governance & System Administration
            </h2>
          </div>
          <p className="text-xs text-mocha-600 mt-1 font-medium">
            Account provisioning, AI department routing policies, and cryptographic security isolation.
          </p>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-mocha-100/80 rounded-2xl border border-mocha-200/80 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-150 active:scale-95 ${
              activeTab === 'users'
                ? 'bg-burgundy-900 text-latte-50 shadow-sm'
                : 'text-mocha-700 hover:text-burgundy-950'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('routing')}
            className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-150 active:scale-95 ${
              activeTab === 'routing'
                ? 'bg-burgundy-900 text-latte-50 shadow-sm'
                : 'text-mocha-700 hover:text-burgundy-950'
            }`}
          >
            AI Routing Rules
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-150 active:scale-95 ${
              activeTab === 'security'
                ? 'bg-burgundy-900 text-latte-50 shadow-sm'
                : 'text-mocha-700 hover:text-burgundy-950'
            }`}
          >
            Security & Secrets
          </button>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white border border-mocha-200/90 rounded-3xl p-5 sm:p-6 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-mocha-100 pb-4">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-burgundy-950 tracking-tight">
                Authorized Campus Identity Directory
              </h3>
              <p className="text-xs text-mocha-600 font-medium">
                Server-enforced role assignments. Zero client-side privilege elevation permitted.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-mocha-800 bg-mocha-100 px-3 py-1 rounded-xl border border-mocha-200 self-start sm:self-auto">
              Active Institutional Directory
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-latte-100/90 text-mocha-600 font-mono font-extrabold uppercase text-[10px] tracking-wider border-b border-mocha-200/80">
                <tr>
                  <th className="py-3 px-3.5">Campus Member</th>
                  <th className="py-3 px-3.5">Security Role</th>
                  <th className="py-3 px-3.5">Designation / Room</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mocha-100 font-medium">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-latte-50/80 transition-colors">
                    <td className="py-3.5 px-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-mocha-200 shadow-subtle"
                        />
                        <div>
                          <p className="font-bold text-burgundy-950 text-xs sm:text-[13px]">{u.name}</p>
                          <p className="text-[11px] text-mocha-500 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3.5">
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wide border ${
                          u.role === 'Admin'
                            ? 'bg-burgundy-900 text-latte-100 border-burgundy-800'
                            : u.role === 'Campus Staff'
                            ? 'bg-mocha-200 text-mocha-900 border-mocha-300'
                            : 'bg-latte-100 text-burgundy-900 border-mocha-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3.5 text-mocha-800 font-bold">
                      {u.designation || u.roomNumber || '—'}
                    </td>
                    <td className="py-3.5 px-3.5">
                      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] border border-emerald-200/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-3.5 text-mocha-500 font-mono">{u.joinedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Routing Rules Tab */}
      {activeTab === 'routing' && (
        <div className="bg-white border border-mocha-200/90 rounded-3xl p-5 sm:p-6 shadow-subtle space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-burgundy-800" />
              <h3 className="text-sm sm:text-base font-extrabold text-burgundy-950 tracking-tight">
                Gemini Department Routing & Keyword Taxonomy
              </h3>
            </div>
            <p className="text-xs text-mocha-600 font-medium mt-0.5">
              Defines semantic routing instructions passed to Google Gemini (`gemini-2.5-flash`) for multi-department triage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CAMPUS_ROUTING_GUIDE.map((rule) => (
              <div
                key={rule.category}
                className="p-5 rounded-2xl border border-mocha-200/90 bg-latte-50/70 space-y-2.5 shadow-subtle hover:border-mocha-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-burgundy-950">{rule.category}</span>
                  <span className="text-[10px] bg-white border border-mocha-200 text-burgundy-900 font-bold px-2.5 py-0.5 rounded-full font-mono shadow-subtle">
                    Dispatch: {rule.defaultStaffDesignation}
                  </span>
                </div>
                <p className="text-xs text-mocha-700 leading-relaxed font-medium">{rule.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {rule.keywords.slice(0, 8).map((kw) => (
                    <span
                      key={kw}
                      className="text-[10px] bg-white border border-mocha-200/80 px-2 py-0.5 rounded-md text-mocha-700 font-mono font-medium shadow-subtle"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security & Bootstrap Tab */}
      {activeTab === 'security' && (
        <div className="bg-white border border-mocha-200/90 rounded-3xl p-6 sm:p-7 shadow-subtle space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-mocha-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-burgundy-50 text-burgundy-900 flex items-center justify-center border border-burgundy-200/60 shadow-subtle">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-burgundy-950 tracking-tight">
                  Security Architecture & First-Admin Protocol
                </h3>
                <p className="text-xs text-mocha-600 font-medium">
                  Verified server-side secret isolation and authorization barrier.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase text-burgundy-900 bg-burgundy-50 px-2.5 py-1 rounded-full border border-burgundy-200/60">
              Zero Client Leakage
            </span>
          </div>

          <div className="space-y-4 text-xs text-mocha-800 leading-relaxed font-medium">
            <div className="p-5 bg-latte-50/90 rounded-2xl border border-mocha-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-extrabold text-burgundy-950 text-xs sm:text-[13px]">
                  1. Server-Side First Administrator Bootstrap
                </p>
                <button
                  onClick={copyBootstrapCode}
                  className="flex items-center gap-1.5 text-xs text-mocha-700 hover:text-burgundy-950 bg-white border border-mocha-200 px-2.5 py-1 rounded-lg shadow-subtle transition-all active:scale-95"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy cURL'}</span>
                </button>
              </div>
              <p className="text-mocha-700">
                To prevent hardcoded administrator credentials in Git, the first administrator is provisioned via a server-side endpoint with token verification:
              </p>
              <pre className="p-4 bg-burgundy-950 text-latte-100 rounded-2xl font-mono text-[11px] overflow-x-auto shadow-inner border border-burgundy-900 leading-relaxed">
{`POST /api/admin/bootstrap
Content-Type: application/json

{
  "bootstrapSecret": "$ADMIN_BOOTSTRAP_SECRET",
  "userUid": "<FIREBASE_USER_UID>",
  "email": "admin@campus.edu"
}`}
              </pre>
              <p className="text-mocha-500 text-[11px]">
                After initializing your production environment, remove <code className="bg-mocha-100 px-1.5 py-0.5 rounded font-mono font-bold text-burgundy-950 border border-mocha-200">ADMIN_BOOTSTRAP_SECRET</code> from the server to permanently seal the bootstrap route.
              </p>
            </div>

            <div className="p-5 bg-latte-50/90 rounded-2xl border border-mocha-200/90 space-y-3">
              <p className="font-extrabold text-burgundy-950 text-xs sm:text-[13px]">
                2. Environment Secrets Isolation Protocol
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-4 bg-white rounded-xl border border-mocha-200 shadow-subtle space-y-1">
                  <span className="font-mono text-burgundy-900 font-bold text-[11px] block">
                    VITE_FIREBASE_API_KEY
                  </span>
                  <p className="text-mocha-700 text-[11px]">
                    Public web client credential for Firebase authentication and Cloud Firestore. Locked by HTTP referrers in Google Cloud Console.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-mocha-200 shadow-subtle space-y-1">
                  <span className="font-mono text-mocha-900 font-bold text-[11px] block">
                    GEMINI_API_KEY (Server Only)
                  </span>
                  <p className="text-mocha-700 text-[11px]">
                    Private Google AI Studio secret kept strictly on the Node Express / Cloud Function backend. Excluded from client bundles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminGovernanceView;
