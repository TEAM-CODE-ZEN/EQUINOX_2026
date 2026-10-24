import React, { useState, useEffect, useMemo } from 'react';
import {
  Network,
  RefreshCw,
  Wrench,
  CheckCircle2,
  Sparkles,
  Building2,
  ExternalLink,
  Copy,
  Check,
  Filter,
} from 'lucide-react';
import { Ticket } from '../../../types';
import { RootCauseCluster } from '../types';
import { detectRootCauses } from '../aiClient';
import { useTranslation } from '../../../i18n';

interface RootCauseViewProps {
  tickets: Ticket[];
  onOpenTicket: (ticket: Ticket) => void;
  onCreateMaintenanceTask: (cluster: RootCauseCluster) => void;
  onTagTicketsToCluster?: (ticketIds: string[], clusterId: string) => void;
}

const STORAGE_KEY = 'campusaccord_root_causes_v1';

export const RootCauseView: React.FC<RootCauseViewProps> = ({
  tickets,
  onOpenTicket,
  onCreateMaintenanceTask,
}) => {
  const { t } = useTranslation();
  const [clusters, setClusters] = useState<RootCauseCluster[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastAnalyzedTime, setLastAnalyzedTime] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [copiedClusterId, setCopiedClusterId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Load from cache on initial mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.clusters) && parsed.clusters.length > 0) {
          setClusters(parsed.clusters);
          setLastAnalyzedTime(parsed.lastAnalyzed || '');
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached root causes:', e);
    }

    // If no cache, perform initial scan
    handleAnalyze();
  }, [tickets.length]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setActionNotice(null);
    try {
      const results = await detectRootCauses(tickets);
      setClusters(results);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastAnalyzedTime(timeStr);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ clusters: results, lastAnalyzed: timeStr })
      );
    } catch (err) {
      console.error('Failed to run root-cause analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = (cluster: RootCauseCluster) => {
    onCreateMaintenanceTask(cluster);
    // Mark cluster status as Mitigating in local state and cache
    const updated = clusters.map((c) =>
      c.id === cluster.id ? { ...c, status: 'Mitigating' as const } : c
    );
    setClusters(updated);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ clusters: updated, lastAnalyzed: lastAnalyzedTime })
      );
    } catch {}
    setActionNotice(
      `Master Maintenance Task created for "${cluster.title}". ${cluster.related_ticket_ids.length} complaints linked.`
    );
    setTimeout(() => setActionNotice(null), 6000);
  };

  const handleDismissCluster = (clusterId: string) => {
    const updated = clusters.map((c) =>
      c.id === clusterId ? { ...c, status: 'Resolved' as const } : c
    );
    setClusters(updated);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ clusters: updated, lastAnalyzed: lastAnalyzedTime })
      );
    } catch {}
  };

  const handleCopySummary = (cluster: RootCauseCluster) => {
    const text = `Root Cause Cluster: ${cluster.title}
Severity: ${cluster.severity} | Confidence: ${cluster.confidence}%
Scope: ${cluster.location_scope} (${cluster.affected_locations.join(', ')})
Recommended Permanent Fix: ${cluster.recommended_permanent_fix}
Evidence:
${cluster.evidence.map((e) => `• ${e}`).join('\n')}
Linked Tickets: ${cluster.related_ticket_ids.join(', ')}`;

    navigator.clipboard?.writeText(text);
    setCopiedClusterId(cluster.id);
    setTimeout(() => setCopiedClusterId(null), 2500);
  };

  // Filtered clusters
  const filteredClusters = useMemo(() => {
    return clusters.filter((c) => {
      if (selectedSeverity !== 'All' && c.severity !== selectedSeverity) return false;
      const st = c.status || 'Active';
      if (selectedStatus !== 'All' && st !== selectedStatus) return false;
      return true;
    });
  }, [clusters, selectedSeverity, selectedStatus]);

  // Summary Metrics
  const totalClusters = clusters.length;
  const totalLinkedTickets = clusters.reduce((sum, c) => sum + (c.related_ticket_ids?.length || 0), 0);
  const criticalHighCount = clusters.filter(
    (c) => c.severity === 'High'
  ).length;

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Medium':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Mitigating':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Resolved':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Top Hero / Header */}
      <div className="bg-white rounded-3xl border border-mocha-200/90 shadow-subtle p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
              <Network className="w-3.5 h-3.5 text-emerald-600" />
              <span>Campus Infrastructure AI</span>
            </span>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
              Admin & Governance View
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-2">
            {t('rootCausesTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-mocha-600 mt-1 max-w-3xl">
            {t('rootCausesSubtitle')}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start lg:self-center">
          {lastAnalyzedTime && (
            <span className="text-xs font-mono text-mocha-500 hidden sm:inline">
              {t('lastAnalyzed')}: {lastAnalyzedTime}
            </span>
          )}
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? t('loading') : t('reanalyzeRootCauses')}</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-900 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs underline"
          >
            {t('close')}
          </button>
        </div>
      )}

      {/* Summary KPI Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1 */}
        <div className="p-4 bg-white rounded-2xl border border-mocha-200/90 shadow-subtle">
          <span className="text-[10px] font-bold text-mocha-400 uppercase tracking-wider font-mono block">
            {t('clustersFound')}
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-gray-900 mt-1">
            {totalClusters}
          </p>
          <p className="text-[11px] text-mocha-600 font-medium mt-1">
            Correlated campus fault patterns
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-white rounded-2xl border border-mocha-200/90 shadow-subtle">
          <span className="text-[10px] font-bold text-mocha-400 uppercase tracking-wider font-mono block">
            {t('ticketsLinked')}
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700 mt-1">
            {totalLinkedTickets}
          </p>
          <p className="text-[11px] text-mocha-600 font-medium mt-1">
            Individual student grievances
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-white rounded-2xl border border-mocha-200/90 shadow-subtle">
          <span className="text-[10px] font-bold text-mocha-400 uppercase tracking-wider font-mono block">
            {t('highSeverityClusters')}
          </span>
          <p
            className={`text-2xl sm:text-3xl font-extrabold font-mono mt-1 ${
              criticalHighCount > 0 ? 'text-amber-700' : 'text-gray-900'
            }`}
          >
            {criticalHighCount}
          </p>
          <p className="text-[11px] text-mocha-600 font-medium mt-1">
            Requires capital or engineering intervention
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-white rounded-2xl border border-mocha-200/90 shadow-subtle">
          <span className="text-[10px] font-bold text-mocha-400 uppercase tracking-wider font-mono block">
            Analysis Method
          </span>
          <p className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-800 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>Cross-Zone</span>
          </p>
          <p className="text-[11px] text-mocha-600 font-medium mt-1">
            Spatial-temporal clustering
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-mocha-200/90 shadow-subtle p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Severity:
          </span>
          {['All', 'High', 'Medium', 'Low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedSeverity === sev
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-500 mr-1">Status:</span>
          {['All', 'Active', 'Mitigating', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === st
                  ? 'bg-emerald-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Clusters List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-16 bg-white rounded-3xl border border-mocha-200/90 text-center space-y-3 shadow-subtle">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <h3 className="text-base font-extrabold text-gray-900">
              {t('loading')}
            </h3>
            <p className="text-xs text-mocha-600 max-w-sm mx-auto">
              Scanning recurring tickets, hostel electrical panels, plumbing lines, and network routers for cross-zone failure patterns...
            </p>
          </div>
        ) : filteredClusters.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-mocha-200/90 text-center space-y-3 shadow-subtle">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-extrabold text-gray-900">
              No Root Cause Clusters Active
            </h3>
            <p className="text-xs text-mocha-600 max-w-md mx-auto">
              No systemic or multi-complaint infrastructure failures detected matching your filter criteria.
            </p>
          </div>
        ) : (
          filteredClusters.map((cluster) => {
            const isMitigating = cluster.status === 'Mitigating';
            const isResolved = cluster.status === 'Resolved';
            const statusLabel = cluster.status || 'Active';

            return (
              <div
                key={cluster.id}
                className="bg-white rounded-3xl border border-mocha-200/90 shadow-subtle p-5 sm:p-6 space-y-4 hover:border-emerald-300 transition-all"
              >
                {/* Cluster Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-mocha-100 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Severity */}
                      <span
                        className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${getSeverityBadgeClass(
                          cluster.severity
                        )}`}
                      >
                        {cluster.severity} Severity
                      </span>
                      {/* Category */}
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                        {cluster.category}
                      </span>
                      {/* Status */}
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                          cluster.status
                        )}`}
                      >
                        {statusLabel}
                      </span>
                      {/* Scope Badge */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                        <Building2 className="w-3 h-3 text-gray-500" />
                        <span>
                          {cluster.location_scope} Scope • {cluster.affected_locations.join(', ')}
                        </span>
                        <span className="text-gray-400 font-normal">
                          ({cluster.related_ticket_ids.length} tickets)
                        </span>
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
                      {cluster.title}
                    </h2>
                  </div>

                  {/* Confidence Bar (single-color neutral) */}
                  <div className="sm:text-right flex-shrink-0">
                    <div className="flex items-center sm:justify-end gap-2 text-xs font-mono font-bold text-gray-700 mb-1">
                      <span>{t('confidence')}:</span>
                      <span className="text-emerald-700 font-extrabold">{cluster.confidence}%</span>
                    </div>
                    <div className="w-36 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${cluster.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Evidence Bullets */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-gray-800 tracking-tight block">
                    Diagnostic Evidence & Correlation:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {cluster.evidence.map((ev, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700 font-medium"
                      >
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Linked Ticket Chips */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 tracking-tight">
                      Linked Student Grievances ({cluster.related_ticket_ids.length}):
                    </span>
                    <span className="text-[11px] text-mocha-500">
                      Click any ticket to inspect
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cluster.related_ticket_ids.map((tId: string) => {
                      const matchedTicket = tickets.find(
                        (t) => t.id === tId || t.ticketNumber === tId
                      );
                      const displayNum = matchedTicket ? matchedTicket.ticketNumber : tId;
                      const titleSnippet = matchedTicket
                        ? matchedTicket.title
                        : 'Complaint Record';

                      return (
                        <button
                          key={tId}
                          onClick={() => {
                            if (matchedTicket) {
                              onOpenTicket(matchedTicket);
                            }
                          }}
                          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-800 hover:text-emerald-900 border border-gray-200 hover:border-emerald-300 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer"
                          title={titleSnippet}
                        >
                          <span className="text-emerald-700">{displayNum}</span>
                          <span className="text-gray-400 font-sans font-normal truncate max-w-[140px]">
                            {titleSnippet}
                          </span>
                          <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-emerald-600 ml-0.5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recommended Permanent Engineering Fix Box */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide">
                        {t('permanentFix')}
                      </span>
                    </div>
                    {/* Cost Band Badge */}
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white text-emerald-900 border border-emerald-300 shadow-2xs">
                      {t('costBand')}: {cluster.estimated_cost_band}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                    {cluster.recommended_permanent_fix}
                  </p>
                </div>

                {/* Bottom Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopySummary(cluster)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                    >
                      {copiedClusterId === cluster.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-500" />
                          <span>Copy Report</span>
                        </>
                      )}
                    </button>

                    {!isResolved && (
                      <button
                        onClick={() => handleDismissCluster(cluster.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-600 transition-colors cursor-pointer"
                      >
                        {t('dismiss')}
                      </button>
                    )}
                  </div>

                  {/* Primary Action Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCreateTask(cluster)}
                      disabled={isMitigating || isResolved}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
                        isMitigating
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200 cursor-not-allowed'
                          : isResolved
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-[#16A34A] hover:bg-[#15803D] text-white active:scale-95 cursor-pointer'
                      }`}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>
                        {isMitigating
                          ? 'Task In Progress'
                          : isResolved
                          ? 'Resolved'
                          : t('createTask')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Advisory */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center text-xs text-gray-600 font-medium">
        <p>{t('aiNotice')}</p>
      </div>
    </div>
  );
};
