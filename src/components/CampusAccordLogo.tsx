import React from 'react';

interface CampusAccordLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  tagline?: string;
}

/**
 * CampusAccord Official Vector Brand Emblem
 * Light Green & White Theme
 * Depicts the classic campus colonnade dome, orbiting accord resolution swoosh,
 * and the verified complaint card.
 */
export const CampusAccordEmblem: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="CampusAccord Logo"
    >
      <defs>
        {/* Soft light green gradients */}
        <linearGradient id="ca-green-grad" x1="16" y1="8" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <linearGradient id="ca-swoosh-grad" x1="4" y1="38" x2="60" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <linearGradient id="ca-card-bg" x1="10" y1="30" x2="38" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F0FDF4" />
        </linearGradient>

        <filter id="ca-glow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#059669" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Flag on top of dome */}
      <path
        d="M32 7V13"
        stroke="#059669"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M32 7.5C34.5 7 36 8.5 39 8C39 10.5 37.5 11.5 32 11.5"
        fill="#10B981"
        stroke="#059669"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Classical Campus Pediment / Dome Roof */}
      <path
        d="M21.5 19L32 12.5L42.5 19H21.5Z"
        fill="url(#ca-green-grad)"
        stroke="#047857"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Architrave / Lintel Bar */}
      <rect
        x="20.5"
        y="19"
        width="23"
        height="2.5"
        rx="1"
        fill="#10B981"
      />

      {/* 4 Colonnade Pillars */}
      <rect x="23" y="22.5" width="2.4" height="9.5" rx="1.2" fill="#059669" />
      <rect x="28.5" y="22.5" width="2.4" height="9.5" rx="1.2" fill="#10B981" />
      <rect x="34" y="22.5" width="2.4" height="9.5" rx="1.2" fill="#10B981" />
      <rect x="39.5" y="22.5" width="2.4" height="9.5" rx="1.2" fill="#059669" />

      {/* Base Foundation Step */}
      <rect
        x="19"
        y="32"
        width="26"
        height="2.5"
        rx="1.2"
        fill="#047857"
      />

      {/* Orbiting Accord Swoosh Arc (bottom dynamic loop) */}
      <path
        d="M7 47C11 54 26 58 43 53.5C53.5 50.7 58 44.5 57 39C56 34 50 31.5 45 32.5C41 33.3 38.5 36 40 38.5C41.5 41 45.5 40.5 49 41.5C53 42.6 54.5 45.5 51 47.5C45.5 50.5 28 52.5 13 46C10 44.7 8 43.5 7 47Z"
        fill="url(#ca-swoosh-grad)"
        opacity="0.95"
      />

      {/* Resolution Ticket / Complaint Accord Card with shadow */}
      <g filter="url(#ca-glow)">
        <rect
          x="10"
          y="31"
          width="27"
          height="18"
          rx="4"
          fill="url(#ca-card-bg)"
          stroke="#10B981"
          strokeWidth="1.6"
        />

        {/* Circular Alert / Verified Badge inside card */}
        <circle cx="17.5" cy="40" r="4.2" fill="#10B981" />
        <path
          d="M17.5 37.8V40.4"
          stroke="#FFFFFF"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="17.5" cy="42.2" r="0.75" fill="#FFFFFF" />

        {/* Ticket Content Lines */}
        <line
          x1="24"
          y1="37"
          x2="33"
          y2="37"
          stroke="#059669"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="24"
          y1="40.5"
          x2="31.5"
          y2="40.5"
          stroke="#34D399"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <line
          x1="24"
          y1="44"
          x2="28"
          y2="44"
          stroke="#A7F3D0"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export const CampusAccordLogo: React.FC<CampusAccordLogoProps> = ({
  className = '',
  size = 40,
  showText = true,
  tagline = 'Every concern heard. Every action tracked.',
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon Badge - Clean Light Green & White with subtle depth */}
      <div className="relative group/logo">
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-emerald-200/90 shadow-[0_4px_16px_rgba(16,185,129,0.18)] ring-1 ring-emerald-500/20 flex items-center justify-center transition-all duration-300 group-hover/logo:scale-105 group-hover/logo:shadow-[0_6px_20px_rgba(16,185,129,0.28)] group-hover/logo:border-emerald-300 active:scale-95 overflow-hidden"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          {/* Subtle light mint gradient glow in the card background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-50/70 via-white to-emerald-100/40 pointer-events-none" />
          <div className="relative z-10 flex items-center justify-center">
            <CampusAccordEmblem size={Math.round(size * 0.95)} />
          </div>
        </div>

        {/* Live operational status dot */}
        <span
          className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm ring-1 ring-emerald-400/40"
          title="CampusAccord Core System Active"
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[17px] sm:text-[18px] tracking-tight text-emerald-950 font-sans leading-none">
              Campus<span className="text-emerald-600">Accord</span>
            </span>
          </div>
          {tagline && (
            <p className="hidden md:block text-[11px] text-emerald-800/75 font-medium tracking-normal mt-1 leading-tight">
              {tagline}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
