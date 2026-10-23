import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Layers,
  Droplets,
  Zap,
  Building,
  CheckCircle2,
  ChevronDown,
  Info,
} from 'lucide-react';
import {
  CAMPUS_BLOCKS,
  INFRASTRUCTURE_SYSTEMS,
  formatStructuredLocation,
  StructuredLocationParams,
  CampusBlock,
} from '../data/campusLocations';

interface CampusBlueprintPickerProps {
  value: string;
  onChange: (locationString: string, details: StructuredLocationParams) => void;
  defaultRoom?: string;
}

export const CampusBlueprintPicker: React.FC<CampusBlueprintPickerProps> = ({
  value,
  onChange,
  defaultRoom,
}) => {
  // Layer toggles on the blueprint
  const [activeLayer, setActiveLayer] = useState<'all' | 'pipeline' | 'electrical'>('all');
  
  // Selected location states
  const [selectedBlockId, setSelectedBlockId] = useState<string>('boys-hostel');
  const [selectedFloor, setSelectedFloor] = useState<string>('2nd Floor');
  const [selectedRoom, setSelectedRoom] = useState<string>(defaultRoom || 'Room B-204');
  const [selectedInfra, setSelectedInfra] = useState<string>('water-pipeline');
  
  // Hovered block on blueprint
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);

  const currentBlock: CampusBlock =
    CAMPUS_BLOCKS.find((b) => b.id === selectedBlockId) || CAMPUS_BLOCKS[4];

  // Update room list when floor or block changes
  const availableFloors = currentBlock.floors;
  const availableRooms = currentBlock.roomsByFloor[selectedFloor] || currentBlock.roomsByFloor[availableFloors[0]] || [];

  // When block changes, adjust floor and room if needed
  const handleBlockChange = (blockId: string) => {
    setSelectedBlockId(blockId);
    const block = CAMPUS_BLOCKS.find((b) => b.id === blockId);
    if (block) {
      const firstFloor = block.floors.includes(selectedFloor) ? selectedFloor : block.floors[0];
      setSelectedFloor(firstFloor);
      const rooms = block.roomsByFloor[firstFloor] || [];
      const newRoom = rooms[0] || 'Main Area';
      setSelectedRoom(newRoom);
      
      const newLoc = formatStructuredLocation({
        blockId,
        floor: firstFloor,
        room: newRoom,
        infrastructureId: selectedInfra,
      });
      onChange(newLoc, {
        blockId,
        floor: firstFloor,
        room: newRoom,
        infrastructureId: selectedInfra,
      });
    }
  };

  const handleFloorChange = (floor: string) => {
    setSelectedFloor(floor);
    const rooms = currentBlock.roomsByFloor[floor] || [];
    const newRoom = rooms[0] || 'Main Area';
    setSelectedRoom(newRoom);

    const newLoc = formatStructuredLocation({
      blockId: selectedBlockId,
      floor,
      room: newRoom,
      infrastructureId: selectedInfra,
    });
    onChange(newLoc, {
      blockId: selectedBlockId,
      floor,
      room: newRoom,
      infrastructureId: selectedInfra,
    });
  };

  const handleRoomChange = (room: string) => {
    setSelectedRoom(room);
    const newLoc = formatStructuredLocation({
      blockId: selectedBlockId,
      floor: selectedFloor,
      room,
      infrastructureId: selectedInfra,
    });
    onChange(newLoc, {
      blockId: selectedBlockId,
      floor: selectedFloor,
      room,
      infrastructureId: selectedInfra,
    });
  };

  const handleInfraChange = (infraId: string) => {
    setSelectedInfra(infraId);
    const newLoc = formatStructuredLocation({
      blockId: selectedBlockId,
      floor: selectedFloor,
      room: selectedRoom,
      infrastructureId: infraId,
    });
    onChange(newLoc, {
      blockId: selectedBlockId,
      floor: selectedFloor,
      room: selectedRoom,
      infrastructureId: infraId,
    });
  };

  // Sync initial state on mount
  useEffect(() => {
    if (!value || value.includes('Hostel 3, Room')) {
      const initial = formatStructuredLocation({
        blockId: selectedBlockId,
        floor: selectedFloor,
        room: selectedRoom,
        infrastructureId: selectedInfra,
      });
      onChange(initial, {
        blockId: selectedBlockId,
        floor: selectedFloor,
        room: selectedRoom,
        infrastructureId: selectedInfra,
      });
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* 2D Blueprint Header & View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Building className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">
            Campus 2D Infrastructure Blueprint
          </span>
        </div>

        {/* Blueprint Layer Filter Tabs */}
        <div className="flex items-center gap-1 bg-mocha-100/90 p-1 rounded-xl text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setActiveLayer('all')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              activeLayer === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-mocha-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Full Layout</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('pipeline')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              activeLayer === 'pipeline'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-sky-700 hover:text-sky-900'
            }`}
          >
            <Droplets className="w-3 h-3" />
            <span>Pipelines</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('electrical')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              activeLayer === 'electrical'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-700 hover:text-amber-900'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Wiring Grid</span>
          </button>
        </div>
      </div>

      {/* Interactive 2D SVG Blueprint Canvas */}
      <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-700/80 bg-[#0B192C] shadow-inner select-none">
        {/* Architectural Blueprint Grid Pattern */}
        <svg
          viewBox="0 0 600 420"
          className="w-full h-auto cursor-pointer block"
          style={{ maxHeight: '280px' }}
        >
          <defs>
            {/* Fine Blueprint Grid */}
            <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="rgba(56, 189, 248, 0.09)"
                strokeWidth="1"
              />
            </pattern>
            {/* Water Pipeline Glow */}
            <filter id="pipe-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {/* Electrical Glow */}
            <filter id="wire-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid background */}
          <rect width="600" height="420" fill="#0B192C" />
          <rect width="600" height="420" fill="url(#blueprint-grid)" />

          {/* Blueprint Title Box (Engineering standard) */}
          <rect x="15" y="15" width="200" height="24" fill="#0F2847" rx="4" stroke="#1E4976" strokeWidth="1" />
          <text x="25" y="31" fill="#38BDF8" fontSize="10" fontFamily="monospace" fontWeight="bold">
            CAMPUS FACILITY BLUEPRINT 2.0
          </text>

          {/* --- WATER PIPELINE INFRASTRUCTURE OVERLAY --- */}
          {(activeLayer === 'all' || activeLayer === 'pipeline') && (
            <g id="pipelines-layer">
              {/* Main Spine Pipeline (Header Line) */}
              <path
                d="M 120 95 L 300 95 L 480 95 L 480 225 L 300 225 L 120 225 Z"
                fill="none"
                stroke="#0284C7"
                strokeWidth="3.5"
                strokeDasharray="6 3"
                filter="url(#pipe-glow)"
              />
              {/* Feeder to Boys Hostel */}
              <line x1="120" y1="225" x2="120" y2="280" stroke="#0284C7" strokeWidth="3" />
              {/* Feeder to Girls Hostel */}
              <line x1="480" y1="225" x2="480" y2="280" stroke="#0284C7" strokeWidth="3" />
              {/* Feeder to Mess Water Storage */}
              <line x1="300" y1="225" x2="300" y2="180" stroke="#0284C7" strokeWidth="3" />

              {/* Water Nodes (Valves / Pumps) */}
              <circle cx="120" cy="95" r="4" fill="#38BDF8" />
              <circle cx="300" cy="95" r="4" fill="#38BDF8" />
              <circle cx="480" cy="95" r="4" fill="#38BDF8" />
              <circle cx="120" cy="225" r="4" fill="#38BDF8" />
              <circle cx="480" cy="225" r="4" fill="#38BDF8" />
            </g>
          )}

          {/* --- ELECTRICAL WIRING CONDUIT OVERLAY --- */}
          {(activeLayer === 'all' || activeLayer === 'electrical') && (
            <g id="electrical-layer">
              {/* High Voltage Bus Conduit */}
              <path
                d="M 60 40 L 540 40 L 540 400 L 60 400 Z"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeDasharray="4 4"
                filter="url(#wire-glow)"
              />
              {/* Sub-panel links */}
              <line x1="300" y1="40" x2="300" y2="180" stroke="#F59E0B" strokeWidth="2" />
              <line x1="190" y1="335" x2="230" y2="335" stroke="#F59E0B" strokeWidth="2" />

              {/* Power Nodes */}
              <rect x="295" y="35" width="10" height="10" fill="#FBBF24" rx="2" />
              <rect x="55" y="395" width="10" height="10" fill="#FBBF24" rx="2" />
              <rect x="535" y="395" width="10" height="10" fill="#FBBF24" rx="2" />
            </g>
          )}

          {/* --- CAMPUS BLOCKS / BUILDINGS --- */}
          {CAMPUS_BLOCKS.map((block) => {
            const isSelected = selectedBlockId === block.id;
            const isHovered = hoveredBlockId === block.id;
            const { x, y, width, height, label } = block.blueprintCoords;

            return (
              <g
                key={block.id}
                onClick={() => handleBlockChange(block.id)}
                onMouseEnter={() => setHoveredBlockId(block.id)}
                onMouseLeave={() => setHoveredBlockId(null)}
                className="transition-all duration-150 cursor-pointer"
              >
                {/* Block Footprint Rectangle */}
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  rx="8"
                  fill={
                    isSelected
                      ? 'rgba(34, 197, 94, 0.28)'
                      : isHovered
                      ? 'rgba(56, 189, 248, 0.22)'
                      : 'rgba(15, 40, 71, 0.75)'
                  }
                  stroke={
                    isSelected
                      ? '#22C55E'
                      : isHovered
                      ? '#38BDF8'
                      : '#1E4976'
                  }
                  strokeWidth={isSelected ? 3 : isHovered ? 2 : 1.5}
                />

                {/* Corner blueprint registration marks */}
                <path
                  d={`M ${x} ${y + 8} L ${x} ${y} L ${x + 8} ${y}`}
                  fill="none"
                  stroke={isSelected ? '#22C55E' : '#38BDF8'}
                  strokeWidth="1.5"
                />
                <path
                  d={`M ${x + width - 8} ${y} L ${x + width} ${y} L ${x + width} ${y + 8}`}
                  fill="none"
                  stroke={isSelected ? '#22C55E' : '#38BDF8'}
                  strokeWidth="1.5"
                />

                {/* Building Code & Name Label */}
                <text
                  x={x + width / 2}
                  y={y + height / 2 - 4}
                  fill={isSelected ? '#86EFAC' : '#F1F5F9'}
                  fontSize="11"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {label}
                </text>
                <text
                  x={x + width / 2}
                  y={y + height / 2 + 12}
                  fill={isSelected ? '#4ADE80' : '#94A3B8'}
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  [{block.code}] • {block.floors.length} Levels
                </text>

                {/* Selected Status Pin */}
                {isSelected && (
                  <g transform={`translate(${x + width - 18}, ${y + 6})`}>
                    <circle cx="6" cy="6" r="6" fill="#22C55E" />
                    <path
                      d="M 3.5 6 L 5.5 8 L 8.5 4"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Blueprint Footer Help Badge */}
        <div className="px-3 py-1.5 bg-[#091424] border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
          <span className="flex items-center gap-1.5">
            <Info className="w-3 h-3 text-cyan-400" />
            <span>Interactive Blueprint: Click any block or zone to target repair dispatch</span>
          </span>
          <span className="text-emerald-400 font-bold">
            Selected: {currentBlock.code}
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 4 Cascading Dropdown Selectors (Eliminates All Random Text / "Flaana")   */}
      {/* ---------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Dropdown 1: Campus Block */}
        <div>
          <label className="block text-[11px] font-bold text-mocha-800 uppercase tracking-wider font-mono mb-1">
            1. College Block / Area <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedBlockId}
              onChange={(e) => handleBlockChange(e.target.value)}
              className="w-full appearance-none bg-white border border-mocha-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 pr-8 shadow-sm cursor-pointer"
            >
              {CAMPUS_BLOCKS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-mocha-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Dropdown 2: Floor Level */}
        <div>
          <label className="block text-[11px] font-bold text-mocha-800 uppercase tracking-wider font-mono mb-1">
            2. Floor Level <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedFloor}
              onChange={(e) => handleFloorChange(e.target.value)}
              className="w-full appearance-none bg-white border border-mocha-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 pr-8 shadow-sm cursor-pointer"
            >
              {availableFloors.map((fl) => (
                <option key={fl} value={fl}>
                  {fl}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-mocha-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Dropdown 3: Room / Specific Sub-Area */}
        <div>
          <label className="block text-[11px] font-bold text-mocha-800 uppercase tracking-wider font-mono mb-1">
            3. Room / Spot <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedRoom}
              onChange={(e) => handleRoomChange(e.target.value)}
              className="w-full appearance-none bg-white border border-mocha-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 pr-8 shadow-sm cursor-pointer"
            >
              {availableRooms.map((rm) => (
                <option key={rm} value={rm}>
                  {rm}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-mocha-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Dropdown 4: Infrastructure / Structuring System */}
        <div>
          <label className="block text-[11px] font-bold text-mocha-800 uppercase tracking-wider font-mono mb-1">
            4. Blueprint System <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedInfra}
              onChange={(e) => handleInfraChange(e.target.value)}
              className="w-full appearance-none bg-white border border-mocha-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 pr-8 shadow-sm cursor-pointer"
            >
              {INFRASTRUCTURE_SYSTEMS.map((sys) => (
                <option key={sys.id} value={sys.id}>
                  {sys.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-mocha-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Verified Standardized Location Badge */}
      <div className="p-3 bg-emerald-50/90 rounded-2xl border border-emerald-200/90 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-800 uppercase font-mono block">
              Verified Blueprint Location (Standardized)
            </span>
            <p className="font-bold text-emerald-950 truncate">
              {formatStructuredLocation({
                blockId: selectedBlockId,
                floor: selectedFloor,
                room: selectedRoom,
                infrastructureId: selectedInfra,
              })}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 flex-shrink-0 font-mono">
          Anti-Randomness Locked
        </span>
      </div>
    </div>
  );
};

export default CampusBlueprintPicker;
