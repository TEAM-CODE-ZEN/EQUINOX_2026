import React, { useState, useEffect } from 'react';
import { Network, ArrowRight, Building2 } from 'lucide-react';
import { Ticket } from '../../../types';
import { RootCauseCluster } from '../types';
import { detectRootCauses } from '../aiClient';
import { useTranslation } from '../../../i18n';

interface RootCauseSummaryCardProps {
  tickets: Ticket[];
  onNavigateToRootCauses: () => void;
}

const STORAGE_KEY = 'campusaccord_root_causes_v1';

export const RootCauseSummaryCard: React.FC<RootCauseSummaryCardProps> = ({
  tickets,
  onNavigateToRootCauses,
}) => {
  const { t } = useTranslation();
  const [topCluster, setTopCluster] = useState<RootCauseCluster | null>(null);
  const [totalClusters, setTotalClusters] = useState<number>(0);
  const [linkedTicketsCount, setLinkedTicketsCount] = useState<number>(0);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.clusters) && parsed.clusters.length > 0) {
          const list: RootCauseCluster[] = parsed.clusters;
          setTotalClusters(list.length);
          setLinkedTicketsCount(
            list.reduce((sum, c) => sum + (c.related_ticket_ids?.length || 0), 0)
          );
          // Pick highest severity or first active cluster
          const active = list.find((c) => c.status !== 'Resolved') || list[0];
          setTopCluster(active);
          return;
        }
      }
    } catch (e) {
      console.warn('Error reading root causes cache in summary card:', e);
    }

    // Otherwise load asynchronous detection
    detectRootCauses(tickets).then((results) => {
      if (results && results.length > 0) {
        setTotalClusters(results.length);
        setLinkedTicketsCount(
          results.reduce((sum, c) => sum + (c.related_ticket_ids?.length || 0), 0)
        );
        const active = results.find((c) => c.status !== 'Resolved') || results[0];
        setTopCluster(active);
      }
    });
  }, [tickets.length]);

  if (!topCluster) {
    return null;
  }

  const primaryLocation = topCluster.affected_locations?.[0] || 'Campus Infrastructure';

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-[#134229] rounded-3xl p-5 text-white shadow-[0_12px_36px_rgba(19,66,41,0.3)] border border-emerald-700/50 flex flex-col md:flex-row md:items-center justify-between gap-5 text-left">
      <div className="space-y-2 max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold font-mono">
            <Network className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Root-Cause Intelligence</span>
          </span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 text-emerald-200">
            {totalClusters} Active Patterns • {linkedTicketsCount} Complaints Linked
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-latte-50">
          {topCluster.title}
        </h3>

        <div className="flex flex-wrap items-center gap-2 text-xs text-mocha-200">
          <span className="inline-flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-md">
            <Building2 className="w-3 h-3 text-emerald-400" />
            {primaryLocation}
          </span>
          <span>•</span>
          <span className="text-emerald-300 font-bold">{topCluster.confidence}% Confidence</span>
          <span>•</span>
          <span className="text-mocha-300 font-medium line-clamp-1 max-w-md">
            Fix: {topCluster.recommended_permanent_fix}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
        <button
          onClick={onNavigateToRootCauses}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#16A34A] hover:bg-[#22C55E] text-white text-xs font-extrabold rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <span>View Root Cause Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
