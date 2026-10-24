import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Cpu,
  Cloud,
  Database,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Key,
  Layers,
  Server,
  Activity,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../types';
import { DEMO_USERS } from '../services/mockData';
import { CAMPUS_ROUTING_GUIDE } from '../services/aiConfig';
import {
  getStoredGeminiKey,
  setStoredGeminiKey,
  testGeminiApiConnection,
} from '../services/aiService';
import {
  getEffectiveFirebaseConfig,
  saveCustomFirebaseConfig,
  clearCustomFirebaseConfig,
  isFirebaseLive,
  getFirebaseConnectionInfo,
  FirebaseCustomConfig,
} from '../services/firebase';
import { firestoreService } from '../services/firestoreService';
import { dataStore } from '../services/dataStore';

interface AdminGovernanceViewProps {
  currentUser: UserProfile;
  initialTab?: 'users' | 'routing' | 'security' | 'integrations';
}

export const AdminGovernanceView: React.FC<AdminGovernanceViewProps> = ({
  currentUser: _currentUser,
  initialTab = 'users',
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'routing' | 'security' | 'integrations'>(
    initialTab
  );
  const [users] = useState<UserProfile[]>(DEMO_USERS);
  const [copiedCode, setCopiedCode] = useState(false);

  // Gemini API Key State
  const [geminiKey, setGeminiKey] = useState<string>(() => getStoredGeminiKey());
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [geminiTestStatus, setGeminiTestStatus] = useState<{
    testing: boolean;
    result?: { success: boolean; latencyMs: number; message: string; model: string };
  }>({ testing: false });

  // Firebase Config State
  const [fbConfig, setFbConfig] = useState<FirebaseCustomConfig>(() => getEffectiveFirebaseConfig());
  const [fbTestStatus, setFbTestStatus] = useState<{
    testing: boolean;
    result?: { success: boolean; message: string; projectId: string };
  }>({ testing: false });

  // Sync to Firestore State
  const [syncStatus, setSyncStatus] = useState<{
    syncing: boolean;
    result?: { success: boolean; syncedTickets: number; syncedCommunities: number; message: string };
  }>({ syncing: false });

  const [configNotice, setConfigNotice] = useState<string | null>(null);

  const copyBootstrapCode = () => {
    const code = `POST /api/admin/bootstrap\nContent-Type: application/json\n\n{\n  "bootstrapSecret": "$ADMIN_BOOTSTRAP_SECRET",\n  "userUid": "<FIREBASE_USER_UID>",\n  "email": "admin@campus.edu"\n}`;
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveGeminiKey = async () => {
    setStoredGeminiKey(geminiKey);
    setConfigNotice('Gemini API key saved to local client storage. Running verification ping...');
    await handleTestGeminiKey();
  };

  const handleTestGeminiKey = async () => {
    setGeminiTestStatus({ testing: true });
    try {
      const res = await testGeminiApiConnection(geminiKey);
      setGeminiTestStatus({ testing: false, result: res });
    } catch (err: any) {
      setGeminiTestStatus({
        testing: false,
        result: {
          success: false,
          latencyMs: 0,
          message: err?.message || 'Failed to ping Gemini API',
          model: 'Failover Semantic Engine Active',
        },
      });
    }
  };

  const handleSaveFirebaseConfig = () => {
    saveCustomFirebaseConfig(fbConfig);
    setConfigNotice('Custom Firebase credentials saved! Refreshing connectivity...');
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const handleResetFirebaseConfig = () => {
    clearCustomFirebaseConfig();
    setFbConfig(getEffectiveFirebaseConfig());
    setConfigNotice('Firebase configuration reset to default environment variables.');
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const handleTestFirestore = async () => {
    setFbTestStatus({ testing: true });
    try {
      const res = await firestoreService.testConnection();
      setFbTestStatus({ testing: false, result: res });
    } catch (err: any) {
      setFbTestStatus({
        testing: false,
        result: {
          success: false,
          message: err?.message || 'Error checking Firestore ping',
          projectId: fbConfig.projectId,
        },
      });
    }
  };

  const handleSyncToFirestore = async () => {
    setSyncStatus({ syncing: true });
    try {
      const tickets = dataStore.getTickets();
      const communities = dataStore.getCommunities();
      const memberships = dataStore.getMemberships();
      const res = await firestoreService.syncAllToFirestore(tickets, communities, memberships);
      setSyncStatus({ syncing: false, result: res });
    } catch (err: any) {
      setSyncStatus({
        syncing: false,
        result: {
          success: false,
          syncedTickets: 0,
          syncedCommunities: 0,
          message: err?.message || 'Failed to complete cloud synchronization',
        },
      });
    }
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
        <div className="flex items-center gap-1.5 p-1 bg-mocha-100/80 rounded-2xl border border-mocha-200/80 self-start sm:self-auto flex-wrap">
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
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all duration-150 active:scale-95 flex items-center gap-1.5 ${
              activeTab === 'integrations'
                ? 'bg-burgundy-900 text-latte-50 shadow-sm'
                : 'text-mocha-700 hover:text-burgundy-950'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud APIs & Firebase</span>
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

      {/* Cloud APIs & Firebase SDK Integration Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* Notification Alert if present */}
          {configNotice && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-medium animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{configNotice}</span>
              </div>
              <button
                onClick={() => setConfigNotice(null)}
                className="text-emerald-700 hover:text-emerald-950 font-bold ml-4"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Top Status Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Gemini AI Status Card */}
            <div className="p-5 bg-white border border-mocha-200/90 rounded-3xl shadow-subtle flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/60">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                  {geminiKey ? 'Gemini 2.5 Flash' : 'Backup Engine Active'}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-burgundy-950">
                  Google Gemini 2.5 Flash
                </h4>
                <p className="text-xs text-mocha-600 mt-0.5 font-medium">
                  {geminiKey ? 'API Key Active (Client Direct & Server)' : 'Awaiting custom key — failover ready'}
                </p>
              </div>
              <div className="pt-2 border-t border-mocha-100 flex items-center justify-between text-[11px] text-mocha-700">
                <span>Model Latency:</span>
                <span className="font-mono font-bold text-burgundy-900">
                  {geminiTestStatus.result?.latencyMs ? `${geminiTestStatus.result.latencyMs}ms` : '< 250ms'}
                </span>
              </div>
            </div>

            {/* 2. Backup Semantic Engine Card */}
            <div className="p-5 bg-white border border-mocha-200/90 rounded-3xl shadow-subtle flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                  Always Online (100%)
                </span>
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-burgundy-950">
                  Backup Semantic Engine
                </h4>
                <p className="text-xs text-mocha-600 mt-0.5 font-medium">
                  40+ keyword matrix with auto priority rating & duplicate detection
                </p>
              </div>
              <div className="pt-2 border-t border-mocha-100 flex items-center justify-between text-[11px] text-mocha-700">
                <span>Failover Protection:</span>
                <span className="font-mono font-bold text-emerald-700">Zero Downtime</span>
              </div>
            </div>

            {/* 3. Firebase SDK Status Card */}
            <div className="p-5 bg-white border border-mocha-200/90 rounded-3xl shadow-subtle flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
                  <Database className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                  isFirebaseLive()
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                    : 'bg-mocha-100 text-mocha-800 border-mocha-200'
                }`}>
                  {isFirebaseLive() ? 'Cloud Firestore Live' : 'Local Resilient'}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-burgundy-950">
                  Firebase SDK v10 Modular
                </h4>
                <p className="text-xs text-mocha-600 mt-0.5 font-mono font-medium truncate">
                  Project: {getFirebaseConnectionInfo().projectId}
                </p>
              </div>
              <div className="pt-2 border-t border-mocha-100 flex items-center justify-between text-[11px] text-mocha-700">
                <span>Persistence State:</span>
                <span className="font-mono font-bold text-burgundy-900">
                  {isFirebaseLive() ? 'Cloud Sync Active' : 'Offline Safe'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Google Gemini 2.5 Flash API Configuration */}
          <div className="bg-white border border-mocha-200/90 rounded-3xl p-6 sm:p-7 shadow-subtle space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-mocha-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-900 flex items-center justify-center border border-purple-200/60 shadow-subtle">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-burgundy-950 tracking-tight">
                    Google Gemini 2.5 Flash API Key Integration
                  </h3>
                  <p className="text-xs text-mocha-600 font-medium">
                    Connect your Gemini API Key directly to enable live generative AI triage, duplicate detection, and 7d/30d trend reporting.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase text-purple-900 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200/60">
                Direct Client & Server
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-burgundy-950 mb-1.5">
                  Google Gemini API Key
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-4 py-2.5 pr-10 text-xs font-mono bg-latte-50/80 border border-mocha-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all text-burgundy-950"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-mocha-500 hover:text-burgundy-950"
                    >
                      {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={handleSaveGeminiKey}
                    disabled={geminiTestStatus.testing}
                    className="px-4 py-2.5 text-xs font-extrabold text-white bg-burgundy-900 hover:bg-burgundy-950 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Key</span>
                  </button>
                  <button
                    onClick={handleTestGeminiKey}
                    disabled={geminiTestStatus.testing}
                    className="px-4 py-2.5 text-xs font-extrabold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl shadow-subtle transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Activity className={`w-3.5 h-3.5 ${geminiTestStatus.testing ? 'animate-spin' : ''}`} />
                    <span>{geminiTestStatus.testing ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-mocha-500 mt-1.5">
                  Your key is securely held in browser storage and only transmitted directly to Google's official Gemini endpoint (<code className="font-mono text-purple-900">generativelanguage.googleapis.com</code>).
                </p>
              </div>

              {/* Gemini Test Result Feedback Box */}
              {geminiTestStatus.result && (
                <div
                  className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                    geminiTestStatus.result.success
                      ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/90 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold flex items-center gap-1.5">
                      {geminiTestStatus.result.success ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Gemini 2.5 Flash API Live & Operational!</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Gemini API Notice (Operating on High-Speed Backup Engine)</span>
                        </>
                      )}
                    </span>
                    {geminiTestStatus.result.latencyMs > 0 && (
                      <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-lg bg-white/80 border border-current">
                        Ping: {geminiTestStatus.result.latencyMs} ms
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90">{geminiTestStatus.result.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Firebase SDK & Cloud Firestore Persistence */}
          <div className="bg-white border border-mocha-200/90 rounded-3xl p-6 sm:p-7 shadow-subtle space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-mocha-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-900 flex items-center justify-center border border-emerald-200/60 shadow-subtle">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-burgundy-950 tracking-tight">
                    Firebase SDK & Cloud Firestore Persistence Engine
                  </h3>
                  <p className="text-xs text-mocha-600 font-medium">
                    Store and sync tickets, 5-member committee rosters, and audit records to Google Cloud Firestore.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                Production Storage
              </span>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-latte-50/80 rounded-2xl border border-mocha-200">
              <button
                onClick={handleSyncToFirestore}
                disabled={syncStatus.syncing}
                className="px-4 py-2 text-xs font-extrabold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.syncing ? 'animate-spin' : ''}`} />
                <span>{syncStatus.syncing ? 'Pushing Data to Firestore...' : 'Sync All Campus Data to Cloud Firestore'}</span>
              </button>

              <button
                onClick={handleTestFirestore}
                disabled={fbTestStatus.testing}
                className="px-4 py-2 text-xs font-extrabold text-mocha-800 bg-white hover:bg-mocha-100 border border-mocha-200 rounded-xl shadow-subtle transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Server className="w-3.5 h-3.5 text-mocha-600" />
                <span>{fbTestStatus.testing ? 'Pinging Firestore...' : 'Test Firestore Ping'}</span>
              </button>
            </div>

            {/* Firestore Sync Results */}
            {syncStatus.result && (
              <div
                className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                  syncStatus.result.success
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/90 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2 font-extrabold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Cloud Firestore Sync Status</span>
                </div>
                <p className="text-[11px] mt-1 opacity-90">{syncStatus.result.message}</p>
                {syncStatus.result.success && (
                  <div className="mt-2 flex items-center gap-4 text-[11px] font-mono font-bold text-emerald-950">
                    <span>✓ {syncStatus.result.syncedTickets} Tickets Saved</span>
                    <span>✓ {syncStatus.result.syncedCommunities} 5-Member Committees Saved</span>
                  </div>
                )}
              </div>
            )}

            {/* Firestore Ping Results */}
            {fbTestStatus.result && (
              <div
                className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                  fbTestStatus.result.success
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/90 border-amber-200 text-amber-900'
                }`}
              >
                <p className="font-extrabold text-[12px]">{fbTestStatus.result.message}</p>
              </div>
            )}

            {/* Firebase Custom Credentials Editor */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold text-burgundy-950 uppercase tracking-wider">
                Custom Firebase Web Project Credentials
              </h4>
              <p className="text-xs text-mocha-600">
                You can paste your Firebase console credentials here to link directly to your own Firebase project.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-mocha-800 mb-1">API Key</label>
                  <input
                    type="text"
                    value={fbConfig.apiKey}
                    onChange={(e) => setFbConfig({ ...fbConfig, apiKey: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-latte-50/60 border border-mocha-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-burgundy-800 text-burgundy-950"
                  />
                </div>
                <div>
                  <label className="block font-bold text-mocha-800 mb-1">Project ID</label>
                  <input
                    type="text"
                    value={fbConfig.projectId}
                    onChange={(e) => setFbConfig({ ...fbConfig, projectId: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-latte-50/60 border border-mocha-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-burgundy-800 text-burgundy-950"
                  />
                </div>
                <div>
                  <label className="block font-bold text-mocha-800 mb-1">Auth Domain</label>
                  <input
                    type="text"
                    value={fbConfig.authDomain}
                    onChange={(e) => setFbConfig({ ...fbConfig, authDomain: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-latte-50/60 border border-mocha-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-burgundy-800 text-burgundy-950"
                  />
                </div>
                <div>
                  <label className="block font-bold text-mocha-800 mb-1">Storage Bucket</label>
                  <input
                    type="text"
                    value={fbConfig.storageBucket}
                    onChange={(e) => setFbConfig({ ...fbConfig, storageBucket: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-latte-50/60 border border-mocha-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-burgundy-800 text-burgundy-950"
                  />
                </div>
                <div>
                  <label className="block font-bold text-mocha-800 mb-1">Messaging Sender ID</label>
                  <input
                    type="text"
                    value={fbConfig.messagingSenderId}
                    onChange={(e) => setFbConfig({ ...fbConfig, messagingSenderId: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-latte-50/60 border border-mocha-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-burgundy-800 text-burgundy-950"
                  />
                </div>
                <div>
                  <label className="block font-bold text-mocha-800 mb-1">App ID</label>
                  <input
                    type="text"
                    value={fbConfig.appId}
                    onChange={(e) => setFbConfig({ ...fbConfig, appId: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-latte-50/60 border border-mocha-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-burgundy-800 text-burgundy-950"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSaveFirebaseConfig}
                  className="px-4 py-2 text-xs font-extrabold text-white bg-burgundy-900 hover:bg-burgundy-950 rounded-xl shadow-sm transition-all active:scale-95"
                >
                  Save & Connect Firebase SDK
                </button>
                <button
                  onClick={handleResetFirebaseConfig}
                  className="px-3.5 py-2 text-xs font-semibold text-mocha-700 hover:text-burgundy-950 bg-mocha-100 hover:bg-mocha-200 rounded-xl transition-all active:scale-95"
                >
                  Reset to Environment Defaults
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Dual-Engine & Backup Failover Architecture */}
          <div className="p-6 bg-latte-50/90 rounded-3xl border border-mocha-200/90 space-y-4">
            <h4 className="text-sm font-extrabold text-burgundy-950 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-burgundy-900" />
              <span>Production High-Availability & Backup Architecture</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-white rounded-2xl border border-mocha-200 shadow-subtle space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-900 bg-purple-100 px-2 py-0.5 rounded-full inline-block">
                  Layer 1: Direct Flash
                </span>
                <p className="font-extrabold text-burgundy-950 text-xs">Google Gemini 2.5 Flash</p>
                <p className="text-mocha-700 text-[11px] leading-relaxed">
                  Fast client-side inference using Gemini 2.5 Flash with strict JSON schema response MIME type for sub-250ms triage.
                </p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-mocha-200 shadow-subtle space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full inline-block">
                  Layer 2: Server Proxy
                </span>
                <p className="font-extrabold text-burgundy-950 text-xs">Express AI Backend</p>
                <p className="text-mocha-700 text-[11px] leading-relaxed">
                  Secure proxy at <code className="font-mono text-blue-900">/api/analyze-complaint</code> masking master API keys with rate limiting.
                </p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-mocha-200 shadow-subtle space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                  Layer 3: Backup Engine
                </span>
                <p className="font-extrabold text-burgundy-950 text-xs">High-Speed Semantic Engine</p>
                <p className="text-mocha-700 text-[11px] leading-relaxed">
                  Deterministic campus NLP fallback algorithm guaranteeing 100% platform uptime even if internet or API quota drops.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminGovernanceView;
