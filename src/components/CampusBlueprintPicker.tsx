import React, { useState, useEffect } from 'react';
import {
  Building,
  CheckCircle2,
  ChevronDown,
  Info,
  Layers,
  Hash,
} from 'lucide-react';
import {
  CAMPUS_BLOCKS,
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
  // Extract digits from default room if available (e.g. "B-304" -> "304")
  const initialRoomNumber = defaultRoom ? defaultRoom.replace(/\D/g, '') : '204';

  // Selected location states
  const [selectedBlockId, setSelectedBlockId] = useState<string>('boys-hostel');
  const [selectedFloor, setSelectedFloor] = useState<string>('2nd Floor');
  const [roomNumber, setRoomNumber] = useState<string>(initialRoomNumber);

  // Hovered block on 2D map
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);

  const currentBlock: CampusBlock =
    CAMPUS_BLOCKS.find((b) => b.id === selectedBlockId) || CAMPUS_BLOCKS[4];

  // Available floors for current block (e.g. 1st to 6th floor)
  const availableFloors = currentBlock.floors;

  // When block changes
  const handleBlockChange = (blockId: string) => {
    setSelectedBlockId(blockId);
    const block = CAMPUS_BLOCKS.find((b) => b.id === blockId);
    if (block) {
      const nextFloor = block.floors.includes(selectedFloor) ? selectedFloor : block.floors[0];
      setSelectedFloor(nextFloor);

      const newLoc = formatStructuredLocation({
        blockId,
        floor: nextFloor,
        roomNumber: block.hasRooms ? roomNumber : undefined,
      });
      onChange(newLoc, {
        blockId,
        floor: nextFloor,
        roomNumber: block.hasRooms ? roomNumber : undefined,
      });
    }
  };

  // When floor changes
  const handleFloorChange = (floor: string) => {
    setSelectedFloor(floor);
    const newLoc = formatStructuredLocation({
      blockId: selectedBlockId,
      floor,
      roomNumber: currentBlock.hasRooms ? roomNumber : undefined,
    });
    onChange(newLoc, {
      blockId: selectedBlockId,
      floor,
      roomNumber: currentBlock.hasRooms ? roomNumber : undefined,
    });
  };

  // When room number changes (STRICTLY NUMERIC / INTEGERS ONLY)
  const handleRoomNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip everything except numbers (0-9)
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
    setRoomNumber(digitsOnly);

    const newLoc = formatStructuredLocation({
      blockId: selectedBlockId,
      floor: selectedFloor,
      roomNumber: digitsOnly,
    });
    onChange(newLoc, {
      blockId: selectedBlockId,
      floor: selectedFloor,
      roomNumber: digitsOnly,
    });
  };

  // Sync initial state on mount
  useEffect(() => {
    if (!value || value.includes('Hostel 3, Room')) {
      const initial = formatStructuredLocation({
        blockId: selectedBlockId,
        floor: selectedFloor,
        roomNumber: currentBlock.hasRooms ? roomNumber : undefined,
      });
      onChange(initial, {
        blockId: selectedBlockId,
        floor: selectedFloor,
        roomNumber: currentBlock.hasRooms ? roomNumber : undefined,
      });
    }
  }, []);

  return (
    <div className="space-y-3.5">
      {/* 2D Map Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Building className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-gray-900 uppercase tracking-wider font-mono">
            College 2D Campus Map
          </span>
        </div>
        <span className="text-[11px] text-mocha-600 font-medium">
          Click any block on the map to select
        </span>
      </div>

      {/* Clean 2D Campus Blueprint SVG (No Mixed/Spaghetti Lines) */}
      <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-700/70 bg-[#0B192C] shadow-inner select-none">
        <svg
          viewBox="0 0 600 420"
          className="w-full h-auto cursor-pointer block"
          style={{ maxHeight: '250px' }}
        >
          <defs>
            {/* Fine Blueprint Grid */}
            <pattern id="clean-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="rgba(56, 189, 248, 0.08)"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          {/* Grid background */}
          <rect width="600" height="420" fill="#0B192C" />
          <rect width="600" height="420" fill="url(#clean-grid)" />

          {/* Blueprint Title Header */}
          <rect x="15" y="12" width="180" height="20" fill="#0F2847" rx="4" stroke="#1E4976" strokeWidth="1" />
          <text x="25" y="26" fill="#38BDF8" fontSize="9" fontFamily="monospace" fontWeight="bold">
            CAMPUS 2D MASTER LAYOUT
          </text>

          {/* Walking Pathways / Roads connecting buildings */}
          <path
            d="M 112 135 L 112 280 M 297 135 L 297 170 M 297 255 L 297 285 M 482 135 L 482 280 M 112 170 L 482 170"
            fill="none"
            stroke="rgba(148, 163, 184, 0.25)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Campus Blocks / Buildings */}
          {CAMPUS_BLOCKS.map((block) => {
            const isSelected = selectedBlockId === block.id;
            const isHovered = hoveredBlockId === block.id;
            const { x, y, width, height, label, sublabel } = block.blueprintCoords;

            return (
              <g
                key={block.id}
                onClick={() => handleBlockChange(block.id)}
                onMouseEnter={() => setHoveredBlockId(block.id)}
                onMouseLeave={() => setHoveredBlockId(null)}
                className="transition-all duration-150 cursor-pointer"
              >
                {/* Building Box */}
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  rx="10"
                  fill={
                    isSelected
                      ? 'rgba(34, 197, 94, 0.28)'
                      : isHovered
                      ? 'rgba(56, 189, 248, 0.22)'
                      : 'rgba(15, 40, 71, 0.85)'
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

                {/* Corner blueprint marks */}
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

                {/* Building Main Label */}
                <text
                  x={x + width / 2}
                  y={y + height / 2 - 5}
                  fill={isSelected ? '#86EFAC' : '#F8FAFC'}
                  fontSize="12"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {label}
                </text>

                {/* Sub-label (Function / Floors) */}
                <text
                  x={x + width / 2}
                  y={y + height / 2 + 12}
                  fill={isSelected ? '#4ADE80' : '#94A3B8'}
                  fontSize="8.5"
                  fontFamily="sans-serif"
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {sublabel}
                </text>

                {/* Selection Pin Badge */}
                {isSelected && (
                  <g transform={`translate(${x + width - 20}, ${y + 8})`}>
                    <circle cx="6" cy="6" r="7" fill="#22C55E" />
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

        {/* Blueprint Footer Indicator */}
        <div className="px-3 py-1.5 bg-[#091424] border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between font-mono">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Map active: click any block above or choose below</span>
          </span>
          <span className="text-emerald-400 font-bold">
            Selected: {currentBlock.code}
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 3 Clean Fields: Block Dropdown, Floors Dropdown, Room Number (Digits)    */}
      {/* ---------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Field 1: College Block / Area Dropdown */}
        <div>
          <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider font-mono mb-1">
            1. College Block / Hostel <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedBlockId}
              onChange={(e) => handleBlockChange(e.target.value)}
              className="w-full appearance-none bg-white border border-mocha-300 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 pr-8 shadow-sm cursor-pointer"
            >
              {CAMPUS_BLOCKS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-mocha-500 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Field 2: Floor Level Dropdown (Ground to 6th Floor) */}
        <div>
          <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider font-mono mb-1">
            2. Floor Level <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedFloor}
              onChange={(e) => handleFloorChange(e.target.value)}
              className="w-full appearance-none bg-white border border-mocha-300 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 pr-8 shadow-sm cursor-pointer"
            >
              {availableFloors.map((fl) => (
                <option key={fl} value={fl}>
                  {fl}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-mocha-500 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Field 3: Room Number Input (ONLY INTEGERS / DIGITS ALLOWED) */}
        <div>
          <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider font-mono mb-1 flex items-center justify-between">
            <span>3. Room Number {currentBlock.hasRooms && <span className="text-red-500">*</span>}</span>
            <span className="text-[10px] text-mocha-500 lowercase font-sans font-normal">(numbers only)</span>
          </label>
          <div className="relative">
            <Hash className="w-4 h-4 text-mocha-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={roomNumber}
              onChange={handleRoomNumberChange}
              disabled={!currentBlock.hasRooms}
              placeholder={currentBlock.hasRooms ? 'e.g. 204' : 'N/A (Outdoor)'}
              className="w-full bg-white border border-mocha-300 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-sm placeholder:text-mocha-400 placeholder:font-normal disabled:bg-mocha-100/60 disabled:cursor-not-allowed font-mono"
            />
          </div>
        </div>
      </div>

      {/* Clean Verified Standardized Location Badge */}
      <div className="p-3 bg-emerald-50/90 rounded-2xl border border-emerald-200/90 flex items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-800 uppercase font-mono block">
              Verified Location
            </span>
            <p className="font-bold text-emerald-950 truncate">
              {formatStructuredLocation({
                blockId: selectedBlockId,
                floor: selectedFloor,
                roomNumber: currentBlock.hasRooms ? roomNumber : undefined,
              })}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200 flex-shrink-0 font-mono">
          Locked
        </span>
      </div>
    </div>
  );
};

export default CampusBlueprintPicker;
