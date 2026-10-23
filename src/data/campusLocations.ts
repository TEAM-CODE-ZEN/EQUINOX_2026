export interface CampusBlock {
  id: string;
  name: string;
  code: string;
  type: 'academic' | 'hostel' | 'outdoor' | 'facility';
  hasRooms: boolean;
  floors: string[];
  blueprintCoords: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    sublabel: string;
    color: string;
  };
}

export const STANDARD_FLOORS = [
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor',
  '5th Floor',
  '6th Floor',
];

export const OUTDOOR_FLOORS = [
  'Ground Level',
];

export const CAMPUS_BLOCKS: CampusBlock[] = [
  {
    id: 'block-a',
    name: 'Block A (Engineering & CS)',
    code: 'Block A',
    type: 'academic',
    hasRooms: true,
    floors: STANDARD_FLOORS,
    blueprintCoords: { x: 40, y: 40, width: 145, height: 95, label: 'Block A', sublabel: 'Engineering & CS (6 Floors)', color: '#3B82F6' },
  },
  {
    id: 'block-b',
    name: 'Block B (Science & Labs)',
    code: 'Block B',
    type: 'academic',
    hasRooms: true,
    floors: STANDARD_FLOORS,
    blueprintCoords: { x: 225, y: 40, width: 145, height: 95, label: 'Block B', sublabel: 'Science & Labs (6 Floors)', color: '#10B981' },
  },
  {
    id: 'block-c',
    name: 'Block C (Admin & Library)',
    code: 'Block C',
    type: 'academic',
    hasRooms: true,
    floors: STANDARD_FLOORS,
    blueprintCoords: { x: 410, y: 40, width: 145, height: 95, label: 'Block C', sublabel: 'Admin & Library (6 Floors)', color: '#8B5CF6' },
  },
  {
    id: 'block-d',
    name: 'Block D (Auditorium & Activities)',
    code: 'Block D',
    type: 'facility',
    hasRooms: true,
    floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'],
    blueprintCoords: { x: 410, y: 170, width: 145, height: 95, label: 'Block D', sublabel: 'Auditorium & Halls', color: '#EC4899' },
  },
  {
    id: 'boys-hostel',
    name: 'Boys Hostel Complex',
    code: 'Boys Hostel',
    type: 'hostel',
    hasRooms: true,
    floors: STANDARD_FLOORS,
    blueprintCoords: { x: 40, y: 280, width: 145, height: 110, label: 'Boys Hostel', sublabel: 'Wings H1 - H4 (6 Floors)', color: '#0284C7' },
  },
  {
    id: 'girls-hostel',
    name: 'Girls Hostel Complex',
    code: 'Girls Hostel',
    type: 'hostel',
    hasRooms: true,
    floors: STANDARD_FLOORS,
    blueprintCoords: { x: 410, y: 280, width: 145, height: 110, label: 'Girls Hostel', sublabel: 'Wings G1 - G3 (6 Floors)', color: '#F43F5E' },
  },
  {
    id: 'central-mess',
    name: 'Central Mess & Canteen',
    code: 'Central Mess',
    type: 'facility',
    hasRooms: false,
    floors: ['Ground Floor (Dining Hall)', '1st Floor (Night Canteen)'],
    blueprintCoords: { x: 225, y: 170, width: 145, height: 85, label: 'Central Mess', sublabel: 'Dining & Food Court', color: '#F59E0B' },
  },
  {
    id: 'garden-lawn',
    name: 'Campus Garden & Lawns',
    code: 'Garden',
    type: 'outdoor',
    hasRooms: false,
    floors: OUTDOOR_FLOORS,
    blueprintCoords: { x: 40, y: 170, width: 145, height: 75, label: 'Campus Garden', sublabel: 'Central Lawn & Gazebo', color: '#22C55E' },
  },
  {
    id: 'sports-ground',
    name: 'Sports Ground & Arena',
    code: 'Sports Ground',
    type: 'outdoor',
    hasRooms: false,
    floors: OUTDOOR_FLOORS,
    blueprintCoords: { x: 225, y: 285, width: 145, height: 105, label: 'Sports Ground', sublabel: 'Cricket & Basketball Turf', color: '#14B8A6' },
  },
];

export interface StructuredLocationParams {
  blockId: string;
  floor: string;
  roomNumber?: string;
}

export function formatStructuredLocation(params: StructuredLocationParams): string {
  const block = CAMPUS_BLOCKS.find((b) => b.id === params.blockId);
  const blockName = block ? block.code : params.blockId;

  if (params.roomNumber && params.roomNumber.trim().length > 0) {
    return `${blockName} • ${params.floor} • Room ${params.roomNumber.trim()}`;
  }

  return `${blockName} • ${params.floor}`;
}
