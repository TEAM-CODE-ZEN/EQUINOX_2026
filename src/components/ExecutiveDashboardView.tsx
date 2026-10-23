import React, { useState } from 'react';
import {
  Settings,
  Plus,
  MoreVertical,
  ArrowUpRight,
  HelpCircle,
  Users2,
  BookOpen,
  BarChart2,
  MessageSquare,
  GraduationCap,
  Play,
  QrCode,
  Inbox,
  Clock,
  Sparkles,
  ChevronDown,
  Layers,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Ticket, GatePass, UserProfile } from '../types';

interface ExecutiveDashboardViewProps {
  tickets: Ticket[];
  gatePasses: GatePass[];
  currentUser: UserProfile;
  onApplyGatePass: () => void;
  onReportConcern: () => void;
  onSelectTicket: (ticket: Ticket) => void;
  onNavigateTab: (tab: string) => void;
  openIssuesCount: number;
  gatePassCount: number;
  onOpenSettings?: () => void;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardViewProps> = ({
  tickets,
  gatePasses,
  currentUser,
  onApplyGatePass,
  onReportConcern,
  onSelectTicket,
  onNavigateTab,
  openIssuesCount,
  gatePassCount,
  onOpenSettings,
}) => {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Stats
  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter((t) => t.status === 'Resolved').length;
  const resolutionPercentage = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 82;

  const totalPasses = gatePasses.length;
  const approvedPasses = gatePasses.filter(
    (g) => g.status === 'Approved' || g.status === 'Out of Campus' || g.status === 'Returned'
  ).length;
  const passApprovalRate = totalPasses > 0 ? Math.round((approvedPasses / totalPasses) * 100) : 68;

  // Dual-bar statistics data matching the image layout (8 days)
  const chartData = [
    {
      day: '27 Jun',
      operations: 0.85,
      gatePasses: 0.48,
      opCount: 17,
      gpCount: 9,
      dashed: false,
    },
    {
      day: '28 Jun',
      operations: 0.68,
      gatePasses: 0.34,
      opCount: 14,
      gpCount: 7,
      dashed: false,
    },
    {
      day: '29 Jun',
      operations: 0.74,
      gatePasses: 0.22,
      opCount: 15,
      gpCount: 4,
      dashed: false,
    },
    {
      day: '30 Jun',
      operations: 0.92,
      gatePasses: 0.60,
      opCount: 19,
      gpCount: 12,
      dashed: true, // Dashed pole as in image
    },
    {
      day: '1 Jul',
      operations: 0.94,
      gatePasses: 0.42,
      opCount: 22,
      gpCount: 10,
      dashed: false,
      badgeTop: '87%',
      badgeBottom: '32%',
    },
    {
      day: '2 Jul',
      operations: 0.88,
      gatePasses: 0.55,
      opCount: 18,
      gpCount: 11,
      dashed: true, // Dashed pole as in image
    },
    {
      day: '3 Jul',
      operations: 0.78,
      gatePasses: 0.52,
      opCount: 16,
      gpCount: 10,
      dashed: false,
    },
    {
      day: '4 Jul',
      operations: 0.70,
      gatePasses: 0.38,
      opCount: 13,
      gpCount: 8,
      dashed: false,
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* ---------------------------------------------------------------------- */}
      {/* 1. Header Section: Expressive Title + Actions                         */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-sans font-light tracking-tight text-[#14532D] leading-[1.15]">
            <span className="font-normal">Managing</span>{' '}
            <span className="inline-flex items-center justify-center align-middle w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-mocha-200 shadow-sm mx-1 text-mocha-700">
              <span className="text-sm">🏨</span>
            </span>{' '}
            <span className="font-semibold text-[#15803D]">Hostel Life</span>
            <br />
            <span className="font-normal">and</span>{' '}
            <span className="inline-flex items-center justify-center align-middle w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EAD890] border border-mocha-300 shadow-sm mx-1 text-emerald-950">
              <Sparkles className="w-4 h-4 text-emerald-800 fill-emerald-700" />
            </span>{' '}
            <span className="font-semibold text-[#15803D]">Workflows</span>
          </h1>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3 self-start md:self-center">
          <button
            onClick={onOpenSettings}
            title="Settings & Switch User"
            className="w-11 h-11 rounded-2xl bg-white hover:bg-latte-50 text-mocha-700 hover:text-emerald-800 border border-mocha-200/90 shadow-sm flex items-center justify-center transition-all active:scale-95 duration-150"
          >
            <Settings className="w-5 h-5 stroke-[1.8]" />
          </button>

          <button
            onClick={onApplyGatePass}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#16A34A] hover:bg-[#22C55E] text-white text-xs sm:text-sm font-semibold tracking-tight shadow-[0_4px_16px_rgba(22,163,74,0.35)] transition-all duration-200 active:scale-95 group"
          >
            <Plus className="w-4 h-4 stroke-[2.5] text-latte-100 group-hover:rotate-90 transition-transform duration-200" />
            <span>Apply for Gate Pass</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. Horizontal Sub-Navigation Pills (Matching Screenshot Row)           */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => onNavigateTab('overview')}
          className="px-5 py-2 rounded-full bg-[#16A34A] text-white text-xs font-semibold shadow-sm transition-all flex-shrink-0"
        >
          Overview
        </button>

        <button
          onClick={() => onNavigateTab('gate-pass')}
          className="px-4 py-2 rounded-full bg-white hover:bg-latte-50 text-mocha-800 hover:text-burgundy-950 border border-mocha-200/90 text-xs font-medium transition-all flex-shrink-0 flex items-center gap-1.5"
        >
          <span>Gate Passes</span>
          {gatePassCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-burgundy-600"></span>
          )}
        </button>

        <button
          onClick={() => onNavigateTab('feed')}
          className="px-4 py-2 rounded-full bg-white hover:bg-latte-50 text-mocha-800 hover:text-burgundy-950 border border-mocha-200/90 text-xs font-medium transition-all flex-shrink-0"
        >
          Campus Feed
        </button>

        <button
          onClick={() => onNavigateTab('my-issues')}
          className="px-4 py-2 rounded-full bg-white hover:bg-latte-50 text-mocha-800 hover:text-burgundy-950 border border-mocha-200/90 text-xs font-medium transition-all flex-shrink-0"
        >
          My Requests
        </button>

        <button
          onClick={() => onNavigateTab('communities')}
          className="px-4 py-2 rounded-full bg-white hover:bg-latte-50 text-mocha-800 hover:text-burgundy-950 border border-mocha-200/90 text-xs font-medium transition-all flex-shrink-0"
        >
          Communities
        </button>

        <button
          onClick={() => onNavigateTab('events')}
          className="px-4 py-2 rounded-full bg-white hover:bg-latte-50 text-mocha-800 hover:text-burgundy-950 border border-mocha-200/90 text-xs font-medium transition-all flex-shrink-0"
        >
          Notices & Events
        </button>

        <button
          onClick={() => onNavigateTab('help-safety')}
          className="px-4 py-2 rounded-full bg-white hover:bg-latte-50 text-burgundy-800 hover:text-burgundy-950 border border-mocha-200/90 text-xs font-medium transition-all flex-shrink-0"
        >
          24/7 Helplines
        </button>

        {(currentUser.role === 'Campus Staff' || currentUser.role === 'Admin') && (
          <button
            onClick={() => onNavigateTab('staff-dashboard')}
            className="px-4 py-2 rounded-full bg-white hover:bg-latte-50 text-mocha-800 hover:text-burgundy-950 border border-mocha-200/90 text-xs font-medium transition-all flex-shrink-0"
          >
            Staff Board
          </button>
        )}
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. Top Executive Metric Cards (3 Cards)                                */}
      {/* ---------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Operations (Crisp White Card with Pill Progress) */}
        <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-mocha-200/90 shadow-[0_2px_12px_rgba(61,6,16,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-mocha-100 flex items-center justify-center text-mocha-700">
                <Settings className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-sm font-semibold text-burgundy-950">Operations</span>
            </div>
            <button className="text-mocha-400 hover:text-mocha-700 p-1">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="my-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EAF5D8] border border-[#CDE5A8] text-[#335C15] text-[11px] font-bold">
                <span>{resolutionPercentage}%</span>
                <span className="w-2.5 h-2.5 rounded-full border border-[#335C15]"></span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-sans font-light tracking-tight text-burgundy-950">
                {780 + totalTickets}
              </span>
              <span className="text-xs text-mocha-400 font-medium">/ 1 000</span>
            </div>
          </div>

          {/* 8 Capsule Progress Bars matching image */}
          <div className="flex items-center gap-1.5 pt-1">
            <div className="h-9 w-4 rounded-full bg-[#22C55E]"></div>
            <div className="h-9 w-4 rounded-full bg-[#22C55E]"></div>
            <div className="h-9 w-4 rounded-full bg-[#22C55E]"></div>
            <div className="h-9 w-4 rounded-full bg-[#22C55E]"></div>
            <div className="h-9 w-4 rounded-full bg-[#22C55E]"></div>
            <div className="h-9 w-4 rounded-full bg-mocha-100 border border-mocha-200"></div>
            <div className="h-9 w-4 rounded-full bg-mocha-100 border border-mocha-200"></div>
            <div className="h-9 w-4 rounded-full bg-mocha-100 border border-mocha-200"></div>
          </div>
        </div>

        {/* Card 2: Gate Pass / Data Transfer (Warm Luminous Mocha Cream Card) */}
        <div className="bg-[#F2EDDC] rounded-[28px] p-5 sm:p-6 border border-[#E4DCBF] shadow-[0_2px_12px_rgba(61,6,16,0.04)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-burgundy-900 shadow-xs">
                <QrCode className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-sm font-semibold text-burgundy-950">Gate Pass Clearance</span>
            </div>
            <button className="text-mocha-500 hover:text-mocha-800 p-1">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="my-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 border border-mocha-200 text-burgundy-950 text-[11px] font-bold">
                <span>{passApprovalRate}%</span>
                <span className="w-2.5 h-2.5 rounded-full border border-burgundy-900"></span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-sans font-light tracking-tight text-burgundy-950">
                {163 + totalPasses}
              </span>
              <span className="text-xs text-mocha-600 font-medium">/ 512.0 Passes</span>
            </div>
          </div>

          {/* 8 Capsule Progress Bars matching image */}
          <div className="flex items-center gap-1.5 pt-1">
            <div className="h-9 w-4 rounded-full bg-[#22C55E]"></div>
            <div className="h-9 w-4 rounded-full bg-[#22C55E]"></div>
            <div className="h-9 w-4 rounded-full bg-[#22C55E]"></div>
            <div className="h-9 w-4 rounded-full bg-[#22C55E]"></div>
            <div className="h-9 w-4 rounded-full bg-white/60 border border-mocha-300"></div>
            <div className="h-9 w-4 rounded-full bg-white/60 border border-mocha-300"></div>
            <div className="h-9 w-4 rounded-full bg-white/60 border border-mocha-300"></div>
            <div className="h-9 w-4 rounded-full bg-white/60 border border-mocha-300"></div>
          </div>
        </div>

        {/* Card 3: Take Your Automation to the Next Level (Vibrant Light Green Gradient) */}
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#14532D] via-[#16A34A] to-[#22C55E] p-5 sm:p-6 text-latte-50 shadow-[0_8px_24px_rgba(22,163,74,0.3)] flex flex-col justify-between border border-emerald-400/40">
          {/* Subtle glow circle and background artwork accent */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full border border-white/20 pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 text-xs text-mocha-100 font-medium">
                <span>Take You</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-mocha-100" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-sans font-light tracking-tight text-white mt-1 leading-snug">
              Automation <br />
              <span className="font-semibold text-white">to the Next Level</span>
            </h3>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              onClick={onApplyGatePass}
              className="px-6 py-2.5 rounded-full bg-white hover:bg-latte-100 text-[#15803D] text-xs font-bold tracking-tight shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Upgrade</span>
              <Play className="w-3 h-3 fill-[#15803D] stroke-none" />
            </button>

            {/* Glowing avatar ring indicator */}
            <div className="w-10 h-10 rounded-full border-2 border-mocha-300/40 p-0.5 bg-burgundy-950/80 flex items-center justify-center">
              <img
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                alt={currentUser.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 4. Split Grid: Dual-Capsule Statistics Chart & Right Resource Column    */}
      {/* ---------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left / Center Chart Card (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-[28px] p-5 sm:p-7 border border-mocha-200/90 shadow-[0_2px_12px_rgba(61,6,16,0.04)] flex flex-col justify-between">
          {/* Chart Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-mocha-100 flex items-center justify-center text-mocha-700">
                <BarChart2 className="w-4 h-4 stroke-[2]" />
              </div>
              <h2 className="text-lg font-sans font-medium text-burgundy-950">Statistics</h2>
            </div>

            {/* Legend & Year Selector */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]"></span>
                <span className="text-mocha-700 font-medium">Operations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EAD890]"></span>
                <span className="text-mocha-700 font-medium">Data transfer</span>
              </div>

              {/* Year Dropdown */}
              <div className="relative inline-flex items-center">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1 rounded-full bg-mocha-50 hover:bg-mocha-100 border border-mocha-200 text-xs font-semibold text-mocha-800 cursor-pointer transition-colors"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-mocha-500 absolute right-2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Interactive Dual-Capsule Chart */}
          <div className="relative h-64 sm:h-72 w-full flex flex-col justify-between select-none">
            {/* Horizontal guidelines 1.0 down to 0.1 */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
              {['1.0', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1'].map((tick) => (
                <div key={tick} className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-mocha-400 w-5 text-right">{tick}</span>
                  <div className="flex-1 border-b border-mocha-200/60"></div>
                </div>
              ))}
            </div>

            {/* Bars Column Container */}
            <div className="relative z-10 pl-8 pr-2 h-full flex items-end justify-between gap-2 sm:gap-4">
              {chartData.map((item, idx) => {
                const isHovered = hoveredDay === item.day;
                return (
                  <div
                    key={item.day}
                    onMouseEnter={() => setHoveredDay(item.day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="flex-1 h-full flex flex-col items-center justify-end relative group cursor-pointer"
                  >
                    {/* Hover Floating Details Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-12 z-30 px-3 py-1.5 rounded-xl bg-[#134229] text-latte-50 text-[11px] font-mono shadow-xl border border-emerald-500/50 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                        <span className="font-bold text-emerald-300">{item.day}: </span>
                        <span>{item.opCount} Ops</span> • <span>{item.gpCount} Passes</span>
                      </div>
                    )}

                    {/* Peak Floating Badges (Matching Screenshot) */}
                    {item.badgeTop && (
                      <div className="absolute top-[18%] -right-1 z-20 px-1.5 py-0.5 rounded-md bg-[#16A34A] text-white text-[10px] font-bold font-mono shadow-sm">
                        {item.badgeTop}
                      </div>
                    )}
                    {item.badgeBottom && (
                      <div className="absolute bottom-[44%] -left-1 z-20 px-1.5 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D] text-[10px] font-bold font-mono shadow-sm border border-emerald-300">
                        {item.badgeBottom}
                      </div>
                    )}

                    {/* The Capsule Column */}
                    {item.dashed ? (
                      /* Dashed guideline pole */
                      <div className="w-5 sm:w-6 h-[85%] flex flex-col items-center justify-between py-1 relative">
                        <div className="w-2 h-2 rounded-full bg-mocha-400"></div>
                        <div className="w-0.5 h-full border-r-2 border-dashed border-mocha-300"></div>
                        <div className="w-2 h-2 rounded-full bg-mocha-300"></div>
                      </div>
                    ) : (
                      /* Dual Capsule Overlapping Bars */
                      <div className="w-5 sm:w-7 flex flex-col items-center relative transition-transform duration-200 group-hover:scale-105">
                        {/* Upper Vibrant Light Green Capsule */}
                        <div
                          style={{ height: `${item.operations * 180}px` }}
                          className="w-full rounded-full bg-[#22C55E] relative flex flex-col items-center justify-start pt-1.5 shadow-sm"
                        >
                          <span className="w-2 h-2 rounded-full bg-white/90"></span>
                        </div>

                        {/* Lower Soft Cream Capsule (Overlapping) */}
                        <div
                          style={{ height: `${item.gatePasses * 160}px` }}
                          className="-mt-8 w-full rounded-full bg-[#EAD890] relative flex flex-col items-center justify-start pt-1.5 shadow-sm border border-mocha-300/40"
                        >
                          <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
                        </div>
                      </div>
                    )}

                    {/* Date label at bottom */}
                    <span
                      className={`text-[11px] font-mono mt-3 transition-colors ${
                        item.day === '1 Jul'
                          ? 'font-bold text-[#15803D]'
                          : 'text-mocha-500 group-hover:text-mocha-900'
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Resource Column (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Top 2 Rounded Square Action Cards */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateTab('communities')}
              className="p-4 rounded-[24px] bg-[#F4EBE2]/60 hover:bg-[#F4EBE2] border border-mocha-200/90 text-left transition-all active:scale-95 group flex flex-col justify-between h-28"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-mocha-700 shadow-2xs group-hover:scale-105 transition-transform">
                <MessageSquare className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-burgundy-950">Community</span>
            </button>

            <button
              onClick={() => onNavigateTab('communities')}
              className="p-4 rounded-[24px] bg-[#F4EBE2]/60 hover:bg-[#F4EBE2] border border-mocha-200/90 text-left transition-all active:scale-95 group flex flex-col justify-between h-28"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-mocha-700 shadow-2xs group-hover:scale-105 transition-transform">
                <GraduationCap className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-burgundy-950">Academy</span>
            </button>
          </div>

          {/* 4 Interactive Vertical Resource Cards with ↗ Arrow */}
          <div className="space-y-2.5">
            {/* Help Center */}
            <div
              onClick={() => onNavigateTab('help-safety')}
              className="p-4 rounded-[22px] bg-white hover:bg-latte-50 border border-mocha-200/90 shadow-[0_1px_4px_rgba(61,6,16,0.03)] cursor-pointer transition-all hover:shadow-subtle group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-7 h-7 rounded-full bg-mocha-100 flex items-center justify-center text-mocha-700 flex-shrink-0">
                  <span className="text-xs font-bold">?</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-mocha-400 group-hover:text-burgundy-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <h4 className="text-xs font-bold text-burgundy-950 mt-2">Help Center</h4>
              <p className="text-[11px] text-mocha-600 line-clamp-1 mt-0.5">
                Explore our detailed documentation and protocols...
              </p>
            </div>

            {/* Partner Directory / Warden Directory */}
            <div
              onClick={() => onNavigateTab('communities')}
              className="p-4 rounded-[22px] bg-white hover:bg-latte-50 border border-mocha-200/90 shadow-[0_1px_4px_rgba(61,6,16,0.03)] cursor-pointer transition-all hover:shadow-subtle group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-7 h-7 rounded-full bg-mocha-100 flex items-center justify-center text-mocha-700 flex-shrink-0">
                  <Users2 className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-mocha-400 group-hover:text-burgundy-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <h4 className="text-xs font-bold text-burgundy-950 mt-2">Partner Directory</h4>
              <p className="text-[11px] text-mocha-600 line-clamp-1 mt-0.5">
                Find the perfect partner to support hostel life...
              </p>
            </div>

            {/* Blog / Hostel Handbook */}
            <div
              onClick={() => onNavigateTab('events')}
              className="p-4 rounded-[22px] bg-white hover:bg-latte-50 border border-mocha-200/90 shadow-[0_1px_4px_rgba(61,6,16,0.03)] cursor-pointer transition-all hover:shadow-subtle group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-7 h-7 rounded-full bg-mocha-100 flex items-center justify-center text-mocha-700 flex-shrink-0">
                  <BookOpen className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-mocha-400 group-hover:text-burgundy-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <h4 className="text-xs font-bold text-burgundy-950 mt-2">Blog & Circulars</h4>
              <p className="text-[11px] text-mocha-600 line-clamp-1 mt-0.5">
                Access popular guides & stories about campus...
              </p>
            </div>

            {/* Use Cases / 24-7 Helplines */}
            <div
              onClick={() => onNavigateTab('help-safety')}
              className="p-4 rounded-[22px] bg-white hover:bg-latte-50 border border-mocha-200/90 shadow-[0_1px_4px_rgba(61,6,16,0.03)] cursor-pointer transition-all hover:shadow-subtle group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-7 h-7 rounded-full bg-mocha-100 flex items-center justify-center text-mocha-700 flex-shrink-0">
                  <BarChart2 className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-mocha-400 group-hover:text-burgundy-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <h4 className="text-xs font-bold text-burgundy-950 mt-2">Use Cases & Safety</h4>
              <p className="text-[11px] text-mocha-600 line-clamp-1 mt-0.5">
                Get inspired by all the ways you can resolve issues...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 5. Live Feed Preview & Quick Actions                                    */}
      {/* ---------------------------------------------------------------------- */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-sans font-semibold text-burgundy-950">
              Recent Campus Activity & Urgent Tickets
            </h3>
            <p className="text-xs text-mocha-600">
              Real-time issues reported across campus residences and facilities.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('feed')}
            className="text-xs font-bold text-burgundy-800 hover:text-burgundy-950 flex items-center gap-1 group"
          >
            <span>View All Tickets</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {tickets.slice(0, 4).map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onSelectTicket(ticket)}
              className="p-4 rounded-2xl bg-white hover:bg-latte-50/70 border border-mocha-200/90 shadow-subtle hover:shadow-card cursor-pointer transition-all flex items-start justify-between gap-3 group"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-mocha-100 text-mocha-800">
                    {ticket.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ticket.priority === 'Critical'
                        ? 'bg-burgundy-100 text-burgundy-900 font-extrabold'
                        : ticket.priority === 'High'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-mocha-100 text-mocha-800'
                    }`}
                  >
                    {ticket.priority}
                  </span>
                  <span className="text-[10px] text-mocha-500 font-medium truncate">
                    {ticket.location}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-burgundy-950 group-hover:text-burgundy-800 transition-colors truncate">
                  {ticket.title}
                </h4>
                <p className="text-[11px] text-mocha-600 line-clamp-1">
                  {ticket.summary || ticket.originalComplaint}
                </p>
              </div>

              <div className="flex flex-col items-end justify-between self-stretch flex-shrink-0 text-[10px] text-mocha-500 font-mono">
                <span className="font-semibold px-2 py-0.5 rounded-md bg-mocha-50 text-mocha-700">
                  {ticket.status}
                </span>
                <span className="text-[10px] text-mocha-400">
                  +{ticket.affectedCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
