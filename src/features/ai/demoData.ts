import { Ticket } from '../../types';

// Sample base64 SVG test images
const SVG_BEFORE_SOCKET =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23fef2f2"/><rect x="80" y="50" width="240" height="200" rx="12" fill="%23ffffff" stroke="%23dc2626" stroke-width="4"/><circle cx="150" cy="140" r="14" fill="%23991b1b"/><circle cx="250" cy="140" r="14" fill="%23991b1b"/><rect x="185" y="170" width="30" height="40" rx="4" fill="%237f1d1d"/><path d="M140 100 Q150 70 170 80 Q190 90 200 60" stroke="%23b91c1c" stroke-width="4" fill="none"/><text x="200" y="275" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23991b1b" text-anchor="middle">DEFECTIVE FIXTURE - SCORCHED & DAMAGED</text></svg>';

const SVG_AFTER_SOCKET =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0fdf4"/><rect x="80" y="50" width="240" height="200" rx="12" fill="%23ffffff" stroke="%2316a34a" stroke-width="4"/><circle cx="150" cy="140" r="14" fill="%2316a34a"/><circle cx="250" cy="140" r="14" fill="%2316a34a"/><rect x="185" y="170" width="30" height="40" rx="4" fill="%2322c55e"/><text x="200" y="275" font-family="sans-serif" font-size="14" font-weight="bold" fill="%2315803d" text-anchor="middle">REPAIRED FIXTURE - VERIFIED CLEAN</text></svg>';

const SVG_BEFORE_WATER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23eff6ff"/><path d="M160 80 L240 80 L230 160 L170 160 Z" fill="%2393c5fd" stroke="%232563eb" stroke-width="3"/><circle cx="200" cy="200" r="16" fill="%233b82f6"/><path d="M190 220 C190 250 210 250 210 220 Z" fill="%2360a5fa"/><text x="200" y="275" font-family="sans-serif" font-size="14" font-weight="bold" fill="%231e40af" text-anchor="middle">LEAKING COOLER VALVE - HIGH PRESSURE DRIP</text></svg>';

const SVG_AFTER_WATER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0fdf4"/><path d="M160 80 L240 80 L230 160 L170 160 Z" fill="%2386efac" stroke="%2316a34a" stroke-width="3"/><rect x="175" y="180" width="50" height="20" rx="6" fill="%2322c55e"/><text x="200" y="275" font-family="sans-serif" font-size="14" font-weight="bold" fill="%2315803d" text-anchor="middle">NEW CERAMIC CARTRIDGE - ZERO LEAKS</text></svg>';

export const generateAiDemoTickets = (): Ticket[] => {
  const now = Date.now();
  const isoTime = (minsAgo: number) => new Date(now - minsAgo * 60 * 1000).toISOString();

  return [
    // -------------------------------------------------------------------------
    // 1. Cluster of 6 Electrical Tickets in Block B 3rd Floor (Root-Cause & Investigator)
    // -------------------------------------------------------------------------
    {
      id: 'demo-elec-101',
      ticketNumber: 'TKT-9101',
      title: 'Repeated MCB trip whenever kettle or iron is used in Room 302',
      originalComplaint:
        'The main breaker on our corridor keeps tripping instantly. Every time anyone turns on a study lamp or kettle, Room 302 goes completely black.',
      summary: 'Corridor MCB trip under moderate load in Room 302',
      category: 'Maintenance',
      communityId: 'comm-maint',
      location: 'Block B, 3rd Floor, Room 302',
      isSharedLocation: false,
      isSensitive: false,
      reporterUid: 'user-student-1',
      reporterName: 'Aarav Sharma',
      reporterRoom: '302',
      createdAt: isoTime(120),
      updatedAt: isoTime(10),
      status: 'In Progress',
      priority: 'High',
      affectedCount: 3,
      endorsedUserIds: ['user-student-1', 'user-student-2'],
      assignedStaffName: 'Rajesh Kumar (Electrician)',
      assignedToStaffUid: 'user-staff-maint-1',
      reopenCount: 0,
      beforeImage: SVG_BEFORE_SOCKET,
      photoUrls: [SVG_BEFORE_SOCKET],
      demo: true,
    },
    {
      id: 'demo-elec-102',
      ticketNumber: 'TKT-9102',
      title: 'Phase-2 voltage spike causing laptop charger sparks in Room 305',
      originalComplaint:
        'Voltage surged suddenly to 260V. Sparks flew out of the multi-plug socket near the study table. Need electrician before laptops get fried.',
      summary: 'Severe voltage fluctuation and wall socket sparking in Room 305',
      category: 'Maintenance',
      communityId: 'comm-maint',
      location: 'Block B, 3rd Floor, Room 305',
      isSharedLocation: false,
      isSensitive: false,
      reporterUid: 'user-student-3',
      reporterName: 'Kunal Verma',
      reporterRoom: '305',
      createdAt: isoTime(95),
      updatedAt: isoTime(30),
      status: 'Open',
      priority: 'Critical',
      affectedCount: 2,
      endorsedUserIds: ['user-student-3'],
      reopenCount: 0,
      beforeImage: SVG_BEFORE_SOCKET,
      photoUrls: [SVG_BEFORE_SOCKET],
      demo: true,
    },
    {
      id: 'demo-elec-103',
      ticketNumber: 'TKT-9103',
      title: 'Sub-distribution board buzzing loudly and corridor lights flickering',
      originalComplaint:
        'The metal electrical panel near Room 308 is vibrating with an audible 50Hz hum and smells hot. Ceiling lights in the corridor dim whenever water heaters switch on.',
      summary: 'Sub-distribution board overheating and phase unbalance on 3rd floor',
      category: 'Maintenance',
      communityId: 'comm-maint',
      location: 'Block B, 3rd Floor, Corridor Wing',
      isSharedLocation: true,
      isSensitive: false,
      reporterUid: 'user-student-4',
      reporterName: 'Vikram Joshi',
      reporterRoom: '308',
      createdAt: isoTime(80),
      updatedAt: isoTime(20),
      status: 'In Progress',
      priority: 'Critical',
      affectedCount: 8,
      endorsedUserIds: ['user-student-4', 'user-student-1', 'user-student-3'],
      assignedStaffName: 'Rajesh Kumar (Electrician)',
      assignedToStaffUid: 'user-staff-maint-1',
      reopenCount: 0,
      beforeImage: SVG_BEFORE_SOCKET,
      photoUrls: [SVG_BEFORE_SOCKET],
      demo: true,
    },
    {
      id: 'demo-elec-104',
      ticketNumber: 'TKT-9104',
      title: 'Wall socket burnt odor and black residue near Room 310',
      originalComplaint:
        'There is charred plastic odor coming from the power point in Room 310. We had to shut off the switch manually.',
      summary: 'Charred socket and thermal degradation in Room 310',
      category: 'Maintenance',
      communityId: 'comm-maint',
      location: 'Block B, 3rd Floor, Room 310',
      isSharedLocation: false,
      isSensitive: false,
      reporterUid: 'user-student-5',
      reporterName: 'Priya Patel',
      reporterRoom: '310',
      createdAt: isoTime(65),
      updatedAt: isoTime(15),
      status: 'Open',
      priority: 'High',
      affectedCount: 2,
      endorsedUserIds: ['user-student-5'],
      reopenCount: 0,
      beforeImage: SVG_BEFORE_SOCKET,
      photoUrls: [SVG_BEFORE_SOCKET],
      demo: true,
    },
    {
      id: 'demo-elec-105',
      ticketNumber: 'TKT-9105',
      title: 'Ceiling fan humming loudly with erratic speed changes in Room 311',
      originalComplaint:
        'The fan speed fluctuates between slow crawl and high speed without anyone touching the regulator. Correlates with the voltage dip on our floor.',
      summary: 'Motor speed instability due to voltage drop on floor phase',
      category: 'Maintenance',
      communityId: 'comm-maint',
      location: 'Block B, 3rd Floor, Room 311',
      isSharedLocation: false,
      isSensitive: false,
      reporterUid: 'user-student-6',
      reporterName: 'Siddharth Rao',
      reporterRoom: '311',
      createdAt: isoTime(45),
      updatedAt: isoTime(10),
      status: 'Open',
      priority: 'Medium',
      affectedCount: 1,
      endorsedUserIds: ['user-student-6'],
      reopenCount: 0,
      demo: true,
    },
    {
      id: 'demo-elec-106',
      ticketNumber: 'TKT-9106',
      title: 'No power on entire right wall outlets in Room 314',
      originalComplaint:
        'Both dual 16A sockets on the right side of room 314 are completely dead. Breaker did not reset after being toggled.',
      summary: 'Open circuit or tripped isolator on branch loop in Room 314',
      category: 'Maintenance',
      communityId: 'comm-maint',
      location: 'Block B, 3rd Floor, Room 314',
      isSharedLocation: false,
      isSensitive: false,
      reporterUid: 'user-student-7',
      reporterName: 'Ananya Deshmukh',
      reporterRoom: '314',
      createdAt: isoTime(30),
      updatedAt: isoTime(5),
      status: 'Open',
      priority: 'High',
      affectedCount: 2,
      endorsedUserIds: ['user-student-7'],
      reopenCount: 0,
      beforeImage: SVG_BEFORE_SOCKET,
      photoUrls: [SVG_BEFORE_SOCKET],
      demo: true,
    },

    // -------------------------------------------------------------------------
    // 2. Verification Workflow Demo: Awaiting Student Confirmation with Photos
    // -------------------------------------------------------------------------
    {
      id: 'demo-verif-201',
      ticketNumber: 'TKT-9201',
      title: 'Water cooler tap cracked and flooding corridor floor',
      originalComplaint:
        'The cold water dispenser tap lever broke in half. Water is leaking continuously and pooling across the hallway tiles.',
      summary: 'Flooding cold water dispenser tap in central dining wing',
      category: 'Maintenance',
      communityId: 'comm-maint',
      location: 'Central Mess & Dining, North Corridor',
      isSharedLocation: true,
      isSensitive: false,
      reporterUid: 'user-student-1',
      reporterName: 'Aarav Sharma',
      reporterRoom: '302',
      createdAt: isoTime(360),
      updatedAt: isoTime(25),
      status: 'Awaiting Student Confirmation',
      priority: 'High',
      affectedCount: 14,
      endorsedUserIds: ['user-student-1', 'user-student-2', 'user-student-3'],
      assignedStaffName: 'Sunil Verma (Plumbing Supervisor)',
      assignedToStaffUid: 'user-staff-maint-2',
      reopenCount: 0,
      beforeImage: SVG_BEFORE_WATER,
      afterImage: SVG_AFTER_WATER,
      photoUrls: [SVG_BEFORE_WATER],
      resolutionNote:
        'Fitted new heavy-duty brass push tap with food-grade silicone seal. Replaced cracked connector elbow and torqued to 30 N-m. Pressurized and confirmed zero drip.',
      resolutionNotes:
        'Fitted new heavy-duty brass push tap with food-grade silicone seal. Replaced cracked connector elbow and torqued to 30 N-m. Pressurized and confirmed zero drip.',
      verification: {
        verdict: 'Verified',
        confidence: 94,
        what_was_wrong: 'Cracked, leaking water valve causing hazardous hallway flooding.',
        what_changed: 'Installed brand-new chrome ceramic lever assembly with dry drip tray.',
        reasoning:
          'High-confidence multimodal visual verification. The defective leaking nozzle in the before photograph has been completely replaced with an aligned, newly seated valve assembly with zero active moisture pooling.',
        checks: [
          { item: 'Photographic evidence matches reported water fixture', passed: true },
          { item: 'Defective cracked nozzle physically replaced', passed: true },
          { item: 'No active leakage or standing water visible', passed: true },
          { item: 'Surrounding floor dried and safe for pedestrian traffic', passed: true },
        ],
        red_flags: [],
        checkedAt: isoTime(25),
      },
      demo: true,
    },

    // -------------------------------------------------------------------------
    // 3. Verification Workflow Demo: Ready for Technician "Mark Fixed" Test
    // -------------------------------------------------------------------------
    {
      id: 'demo-verif-202',
      ticketNumber: 'TKT-9202',
      title: 'Scorched AC power outlet tripping master circuit in Room 402',
      originalComplaint:
        'The 25A AC power outlet made a loud pop and has charred marks on the faceplate. Needs complete socket replacement.',
      summary: 'Burnt 25A air conditioner socket with scorched faceplate in Room 402',
      category: 'Maintenance',
      communityId: 'comm-maint',
      location: 'Block A, 4th Floor, Room 402',
      isSharedLocation: false,
      isSensitive: false,
      reporterUid: 'user-student-2',
      reporterName: 'Neha Gupta',
      reporterRoom: '402',
      createdAt: isoTime(180),
      updatedAt: isoTime(60),
      status: 'In Progress',
      priority: 'High',
      affectedCount: 2,
      endorsedUserIds: ['user-student-2'],
      assignedStaffName: 'Rajesh Kumar (Electrician)',
      assignedToStaffUid: 'user-staff-maint-1',
      reopenCount: 0,
      beforeImage: SVG_BEFORE_SOCKET,
      photoUrls: [SVG_BEFORE_SOCKET],
      demo: true,
    },

    // -------------------------------------------------------------------------
    // 4. Reopened Ticket Demo: Student Rejected Fix -> Priority Escalated
    // -------------------------------------------------------------------------
    {
      id: 'demo-reopen-301',
      ticketNumber: 'TKT-9301',
      title: 'High-frequency disconnects on 5GHz Wi-Fi in Library Quiet Wing',
      originalComplaint:
        'Wi-Fi signal shows full bars but drops every 3-4 minutes when reading research papers. DNS requests time out completely.',
      summary: 'Corridor AP-07 packet dropping in Library Quiet Wing',
      category: 'Internet / Connectivity',
      communityId: 'comm-it',
      location: 'Library & Common Lawns, 2nd Floor Quiet Study Wing',
      isSharedLocation: true,
      isSensitive: false,
      reporterUid: 'user-student-1',
      reporterName: 'Aarav Sharma',
      reporterRoom: '302',
      createdAt: isoTime(480),
      updatedAt: isoTime(40),
      status: 'Reopened',
      priority: 'Critical',
      affectedCount: 19,
      endorsedUserIds: ['user-student-1', 'user-student-4', 'user-student-6'],
      assignedStaffName: 'Deepak Verma (Network Admin)',
      assignedToStaffUid: 'user-staff-it-1',
      reopenCount: 1,
      resolutionNote: 'Rebooted PoE switch port from central network console.',
      resolutionNotes: 'Rebooted PoE switch port from central network console.',
      demo: true,
    },
  ];
};
