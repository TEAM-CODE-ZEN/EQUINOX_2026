export interface CampusBlock {
  id: string;
  name: string;
  code: string;
  type: 'academic' | 'hostel' | 'outdoor' | 'facility';
  floors: string[];
  infrastructureTypes: string[];
  roomsByFloor: Record<string, string[]>;
  blueprintCoords: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    color: string;
  };
}

export const INFRASTRUCTURE_SYSTEMS = [
  { id: 'water-pipeline', label: 'Water Pipeline & Plumbing Grid', icon: 'droplet', color: '#0284C7' },
  { id: 'electrical-wiring', label: 'Electrical Wiring & Power Conduit', icon: 'zap', color: '#D97706' },
  { id: 'wifi-network', label: 'Wi-Fi & LAN Network Line', icon: 'wifi', color: '#059669' },
  { id: 'civil-structural', label: 'Civil, Wall & Ceiling Structure', icon: 'hammer', color: '#78716C' },
  { id: 'fixtures', label: 'Room Fixtures & General Hardware', icon: 'wrench', color: '#4F46E5' },
] as const;

export const CAMPUS_BLOCKS: CampusBlock[] = [
  {
    id: 'block-a',
    name: 'Block A (Engineering & CS)',
    code: 'BLK-A',
    type: 'academic',
    floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'],
    infrastructureTypes: ['water-pipeline', 'electrical-wiring', 'wifi-network', 'civil-structural', 'fixtures'],
    roomsByFloor: {
      'Ground Floor': ['A-001 Lecture Hall', 'A-002 Robotics Lab', 'A-003 Staff Lounge', 'Restroom A-Ground', 'Water Cooler Point'],
      '1st Floor': ['A-101 CS Lab 1', 'A-102 CS Lab 2', 'A-103 AI Research Lab', 'Restroom A-1', 'Water Cooler Point'],
      '2nd Floor': ['A-201 Electronics Lab', 'A-202 Microprocessor Lab', 'A-203 Seminar Room', 'Restroom A-2', 'Water Cooler Point'],
      '3rd Floor': ['A-301 Cloud Computing Lab', 'A-302 Project Room', 'A-303 Department Library', 'Restroom A-3', 'Water Cooler Point'],
    },
    blueprintCoords: { x: 50, y: 50, width: 140, height: 90, label: 'Block A (Engg)', color: '#3B82F6' },
  },
  {
    id: 'block-b',
    name: 'Block B (Science & Labs)',
    code: 'BLK-B',
    type: 'academic',
    floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'],
    infrastructureTypes: ['water-pipeline', 'electrical-wiring', 'wifi-network', 'civil-structural', 'fixtures'],
    roomsByFloor: {
      'Ground Floor': ['B-001 Physics Lab', 'B-002 Chemistry Lab', 'B-003 Instrument Room', 'Restroom B-Ground', 'Water Cooler Point'],
      '1st Floor': ['B-101 Lecture Hall 1', 'B-102 Lecture Hall 2', 'B-103 Faculty Cabin', 'Restroom B-1', 'Water Cooler Point'],
      '2nd Floor': ['B-201 Biotech Lab', 'B-202 Material Science Lab', 'B-203 Smart Classroom', 'Restroom B-2', 'Water Cooler Point'],
      '3rd Floor': ['B-301 Mathematics Seminar', 'B-302 Research Scholar Room', 'Restroom B-3', 'Water Cooler Point'],
    },
    blueprintCoords: { x: 230, y: 50, width: 140, height: 90, label: 'Block B (Science)', color: '#10B981' },
  },
  {
    id: 'block-c',
    name: 'Block C (Admin & Central Library)',
    code: 'BLK-C',
    type: 'academic',
    floors: ['Ground Floor', '1st Floor', '2nd Floor'],
    infrastructureTypes: ['water-pipeline', 'electrical-wiring', 'wifi-network', 'civil-structural', 'fixtures'],
    roomsByFloor: {
      'Ground Floor': ['Admin Office', 'Registrar Chamber', 'Accounts Desk', 'Restroom C-Ground', 'Water Cooler Point'],
      '1st Floor': ['Central Library (Main Reading Hall)', 'Digital Library Section', 'Journal Archive', 'Restroom C-1', 'Water Cooler Point'],
      '2nd Floor': ['Conference Hall', 'Director Office', 'Placement Cell Office', 'Restroom C-2', 'Water Cooler Point'],
    },
    blueprintCoords: { x: 410, y: 50, width: 140, height: 90, label: 'Block C (Admin/Lib)', color: '#8B5CF6' },
  },
  {
    id: 'block-d',
    name: 'Block D (Auditorium & Activities)',
    code: 'BLK-D',
    type: 'facility',
    floors: ['Ground Floor', '1st Floor'],
    infrastructureTypes: ['electrical-wiring', 'wifi-network', 'civil-structural', 'fixtures'],
    roomsByFloor: {
      'Ground Floor': ['Grand Auditorium (Main Hall)', 'Green Room 1', 'Green Room 2', 'Sound Control Console', 'Restroom D-Ground'],
      '1st Floor': ['Auditorium Balcony', 'Student Council Office', 'Music Club Room', 'Photography Studio', 'Restroom D-1'],
    },
    blueprintCoords: { x: 410, y: 180, width: 140, height: 90, label: 'Block D (Audi)', color: '#EC4899' },
  },
  {
    id: 'boys-hostel',
    name: 'Boys Hostel Complex (Hostel 1 - 4)',
    code: 'BH-CMPLX',
    type: 'hostel',
    floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'],
    infrastructureTypes: ['water-pipeline', 'electrical-wiring', 'wifi-network', 'civil-structural', 'fixtures'],
    roomsByFloor: {
      'Ground Floor': ['Room B-001 to B-020', 'Warden Office', 'Common Room / TV Lounge', 'Gymnasium', 'Restroom Block (Ground)', 'Main Water Cooler'],
      '1st Floor': ['Room B-101 to B-125', 'Reading Room 1', 'Restroom Block (1st Floor)', 'Water Cooler Point'],
      '2nd Floor': ['Room B-201 to B-225', 'Indoor Games Room', 'Restroom Block (2nd Floor)', 'Water Cooler Point'],
      '3rd Floor': ['Room B-301 to B-325', 'Study Lounge 3', 'Restroom Block (3rd Floor)', 'Water Cooler Point'],
      '4th Floor': ['Room B-401 to B-425', 'Terrace Solar / Tank Unit', 'Restroom Block (4th Floor)', 'Water Cooler Point'],
    },
    blueprintCoords: { x: 50, y: 280, width: 140, height: 110, label: 'Boys Hostel', color: '#0284C7' },
  },
  {
    id: 'girls-hostel',
    name: 'Girls Hostel Complex (Hostel G1 - G2)',
    code: 'GH-CMPLX',
    type: 'hostel',
    floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor'],
    infrastructureTypes: ['water-pipeline', 'electrical-wiring', 'wifi-network', 'civil-structural', 'fixtures'],
    roomsByFloor: {
      'Ground Floor': ['Room G-001 to G-020', 'Matron Office', 'Visitor Lounge', 'Gym Area', 'Restroom Block (Ground)', 'Main Water Cooler'],
      '1st Floor': ['Room G-101 to G-125', 'Study Room 1', 'Restroom Block (1st Floor)', 'Water Cooler Point'],
      '2nd Floor': ['Room G-201 to G-225', 'Activity Room', 'Restroom Block (2nd Floor)', 'Water Cooler Point'],
      '3rd Floor': ['Room G-301 to G-325', 'Quiet Study Hall', 'Restroom Block (3rd Floor)', 'Water Cooler Point'],
      '4th Floor': ['Room G-401 to G-425', 'Terrace Unit', 'Restroom Block (4th Floor)', 'Water Cooler Point'],
    },
    blueprintCoords: { x: 410, y: 280, width: 140, height: 110, label: 'Girls Hostel', color: '#F43F5E' },
  },
  {
    id: 'central-mess',
    name: 'Central Mess & Food Court',
    code: 'MESS',
    type: 'facility',
    floors: ['Ground Floor', '1st Floor (Canteen)'],
    infrastructureTypes: ['water-pipeline', 'electrical-wiring', 'civil-structural', 'fixtures'],
    roomsByFloor: {
      'Ground Floor': ['Student Dining Hall A', 'Student Dining Hall B', 'Main Industrial Kitchen', 'Dishwashing Section', 'Handwash Area'],
      '1st Floor (Canteen)': ['Night Canteen', 'Juice Bar Corner', 'Seating Terrace', 'Vendor Counter'],
    },
    blueprintCoords: { x: 230, y: 180, width: 140, height: 90, label: 'Central Mess', color: '#F59E0B' },
  },
  {
    id: 'garden-lawn',
    name: 'Campus Central Garden & Lawns',
    code: 'GRDN',
    type: 'outdoor',
    floors: ['Ground Level'],
    infrastructureTypes: ['water-pipeline', 'electrical-wiring', 'fixtures'],
    roomsByFloor: {
      'Ground Level': ['Central Lawn', 'Botanical Garden Section', 'North Gazebo', 'Main Fountain Area', 'Walking Pathway Lighting'],
    },
    blueprintCoords: { x: 50, y: 180, width: 140, height: 70, label: 'Central Garden', color: '#22C55E' },
  },
  {
    id: 'sports-ground',
    name: 'Sports Ground & Athletics Arena',
    code: 'SPORTS',
    type: 'outdoor',
    floors: ['Ground Level'],
    infrastructureTypes: ['water-pipeline', 'electrical-wiring', 'fixtures'],
    roomsByFloor: {
      'Ground Level': ['Cricket Pitch & Field', 'Basketball Court (Floodlit)', 'Football Turf', 'Sports Pavilion & Equipment Room', 'Spectator Bleachers'],
    },
    blueprintCoords: { x: 230, y: 300, width: 140, height: 90, label: 'Sports Ground', color: '#14B8A6' },
  },
];

// Helper to format structured location
export interface StructuredLocationParams {
  blockId: string;
  floor: string;
  room: string;
  infrastructureId: string;
}

export function formatStructuredLocation(params: StructuredLocationParams): string {
  const block = CAMPUS_BLOCKS.find((b) => b.id === params.blockId);
  const blockName = block ? block.name.split(' (')[0] : params.blockId;
  const infra = INFRASTRUCTURE_SYSTEMS.find((i) => i.id === params.infrastructureId);
  const infraLabel = infra ? infra.label.split(' & ')[0] : 'General';

  return `${blockName} • ${params.floor} • ${params.room} [${infraLabel}]`;
}
