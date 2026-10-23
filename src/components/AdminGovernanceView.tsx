import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Lock,
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

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Campus Administration & Governance
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            System configuration, user accounts, AI routing policies, and security controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'users' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('routing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'routing' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            AI Routing Rules
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'security' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Security & Bootstrap
          </button>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Registered Campus Accounts</h3>
              <p className="text-xs text-slate-500">
                Role-based access is enforced server-side. Users cannot elevate their own permissions.
              </p>
            </div>
            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              Active Target: 500 Campus Users
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Name & Email</th>
                  <th className="py-2.5 px-3">Account Type</th>
                  <th className="py-2.5 px-3">Designation / Room</th>
                  <th className="py-2.5 px-3">Account Status</th>
                  <th className="py-2.5 px-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          u.role === 'Admin'
                            ? 'bg-purple-100 text-purple-700'
                            : u.role === 'Campus Staff'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {u.designation || u.roomNumber || '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-700 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{u.joinedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Routing Rules Tab */}
      {activeTab === 'routing' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Configured Campus AI Routing Guide
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Defines how student complaints are categorized and directed to responsible campus departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CAMPUS_ROUTING_GUIDE.map((rule) => (
              <div
                key={rule.category}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{rule.category}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                    Target: {rule.defaultStaffDesignation}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rule.description}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {rule.keywords.slice(0, 6).map((kw) => (
                    <span
                      key={kw}
                      className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.2 rounded text-slate-600 font-mono"
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-subtle space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Lock className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Security Architecture & First-Admin Provisioning
              </h3>
              <p className="text-xs text-slate-500">
                Verified server-side bootstrap protocol and token validation rules.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="font-bold text-slate-900">1. Admin Bootstrap Mechanism:</p>
              <p>
                No administrator passwords or elevated tokens are hardcoded into the frontend code.
                The initial system administrator is provisioned via the secure server-side endpoint:
              </p>
              <pre className="p-2.5 bg-slate-900 text-teal-300 rounded-lg font-mono text-[11px] overflow-x-auto">
                POST /api/admin/bootstrap&#10;&#123; "bootstrapSecret": "$ADMIN_BOOTSTRAP_SECRET", "userUid": "...", "email": "..." &#125;
              </pre>
              <p className="text-slate-500 text-[11px]">
                After initial setup, remove <code className="bg-slate-200 px-1 rounded">ADMIN_BOOTSTRAP_SECRET</code> from the server environment to disable the bootstrap door completely.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="font-bold text-slate-900">2. Client vs Server Secrets Separation:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>
                  <strong className="text-slate-800">VITE_FIREBASE_API_KEY</strong>: Public web client identifier for Firebase auth/storage services. Restrictable in Google Cloud Console.
                </li>
                <li>
                  <strong className="text-slate-800">GEMINI_API_KEY</strong>: Private Google AI Studio key kept strictly on the Node/Firebase backend. Never exposed to browser bundles or network payloads.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
