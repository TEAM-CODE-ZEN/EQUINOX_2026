import { Ticket } from '../../types';
import {
  InvestigationReport,
  RootCauseCluster,
  ResolutionVerificationResult,
} from './types';

export const getMockInvestigationReport = (
  ticket: Ticket,
  relatedTickets: Ticket[] = []
): InvestigationReport => {
  const cat = ticket.category;
  const loc = ticket.location || 'Campus Facility';
  const similarIds = relatedTickets
    .filter((t) => t.id !== ticket.id)
    .slice(0, 3)
    .map((t) => t.id);

  if (cat === 'Maintenance' || cat === 'Security') {
    return {
      summary: `Technical diagnostic for ${ticket.title} at ${loc}. High probability of localized hardware fatigue or electrical load variation.`,
      likely_causes: [
        {
          cause: 'Capacitor or switch contact degradation from continuous duty',
          likelihood: 68,
          reasoning: 'Symptoms match typical thermal wear and intermittent contact failure observed in high-occupancy campus blocks.',
        },
        {
          cause: 'Loose terminal screw or neutral line resistance surge',
          likelihood: 22,
          reasoning: 'Reported flicker and humming indicates fluctuating impedance at the sub-distribution junction.',
        },
        {
          cause: 'Upstream circuit breaker tripping threshold drift',
          likelihood: 10,
          reasoning: 'May be an auxiliary effect if multiple loads are drawn simultaneously in adjacent rooms.',
        },
      ],
      what_to_check_first: [
        `Isolate the local circuit breaker in ${loc} before physical contact.`,
        'Inspect terminal block with a calibrated digital multimeter for voltage drop (>5%).',
        'Verify grounding continuity and inspect for heat discoloration or charring.',
        'Check mechanical fasteners and conduit seals for vibration looseness.',
      ],
      questions_for_student: [
        'Did you notice any burning smell, clicking sound, or sparks prior to the malfunction?',
        'Is this issue continuous, or does it happen primarily during peak hours (evening/morning)?',
      ],
      required_skills: ['Licensed Electrician / HVAC Specialist', 'High-Voltage Safety Protocol'],
      tools_and_parts: [
        'Digital Multimeter (CAT III 600V)',
        'Insulated Screwdriver Set (1000V rated)',
        'Replacement 16A MCB / Heavy-duty terminal block',
        'Infrared Thermal Thermometer',
      ],
      safety_warnings: [
        'CRITICAL SAFETY WARNING: De-energize and lock-out/tag-out (LOTO) breaker before opening enclosures.',
        'Beware of residual capacitor charge in motors or ballast units.',
      ],
      similar_ticket_ids: similarIds,
      is_recurring: similarIds.length > 0,
      recurrence_note: similarIds.length > 0
        ? `Found ${similarIds.length} related reports in the same sector within the last 30 days.`
        : undefined,
      suggested_priority: ticket.priority === 'Critical' ? 'Urgent' : 'High',
      priority_reason: 'Impacts resident safety and routine student study conditions in the block.',
      estimated_fix_time: '45 - 60 minutes',
      suggested_department: 'Maintenance & Estate',
      next_best_actions: [
        'Dispatch authorized technician with diagnostic meter and replacement MCB kit.',
        'Post clarifying query to student via portal if access to room is locked.',
        'Verify adjacent rooms on same riser phase after completing fix.',
      ],
      isSimulated: true,
    };
  }

  // Generic fallback for Mess / Internet / Other
  return {
    summary: `Operational diagnostic for ${ticket.title} reported in ${loc}. Systematic verification recommended.`,
    likely_causes: [
      {
        cause: 'Access point or service endpoint bandwidth saturation',
        likelihood: 65,
        reasoning: 'Peak usage periods correlate with localized packet loss and response latency spikes.',
      },
      {
        cause: 'Upstream gateway DNS cache corruption or PoE renegotiation drop',
        likelihood: 25,
        reasoning: 'Reported symptoms indicate intermittent link reset rather than physical severed medium.',
      },
      {
        cause: 'Firmware state hang requiring soft reboot',
        likelihood: 10,
        reasoning: 'Occasional memory leak in older distribution switches.',
      },
    ],
    what_to_check_first: [
      'Check physical port link indicator and verify PoE voltage delivery.',
      'Ping the default campus gateway from the local subnet to measure packet drop rate.',
      'Review AP client association table for concurrent connection threshold exceeded (>45 devices).',
    ],
    questions_for_student: [
      'Does your connection drop completely, or does it stay connected with "No Internet" status?',
      'Are other students in your room/corridor experiencing the exact same behavior right now?',
    ],
    required_skills: ['Network Technician / Systems Administrator'],
    tools_and_parts: ['RJ45 Cable Tester', 'Console Cable / Laptop', 'Spare Cat6 Patch Cord'],
    safety_warnings: ['Ensure ladder safety when servicing ceiling-mounted hardware.'],
    similar_ticket_ids: similarIds,
    is_recurring: similarIds.length > 0,
    recurrence_note: similarIds.length > 0 ? 'Multiple similar tickets reported in this zone.' : undefined,
    suggested_priority: 'Medium',
    priority_reason: 'Disrupts academic connectivity during semester coursework.',
    estimated_fix_time: '30 minutes',
    suggested_department: 'Internet & IT Infrastructure',
    next_best_actions: [
      'Remotely reboot local edge switch port and re-test throughput.',
      'Send direct update to student confirming triage in progress.',
    ],
    isSimulated: true,
  };
};

export const getMockRootCauses = (tickets: Ticket[]): RootCauseCluster[] => {
  const existingIds = tickets.map((t) => t.id);
  const matchedElect = existingIds.filter((id) => id.includes('elec') || id.includes('tkt')).slice(0, 4);

  return [
    {
      id: 'rc-cluster-101',
      title: 'Block B 3rd Floor Phase-2 Voltage Surge & Tripping',
      probable_root_cause:
        'Loose neutral busbar junction in Floor Sub-Distribution Board (DB-3B), creating 35V floating voltage shifts whenever high-draw appliances turn on.',
      confidence: 88,
      category: 'Maintenance',
      location_scope: 'Floor',
      affected_locations: ['Block B - Floor 3', 'Rooms 301-312'],
      related_ticket_ids: matchedElect.length > 0 ? matchedElect : existingIds.slice(0, 3),
      evidence: [
        'Repeated MCB tripping across 6 adjacent rooms within 72 hours',
        'Student reports of light flickering coinciding with water heater cycle',
        'Multimeter telemetry showing phase voltage oscillating between 195V and 248V',
      ],
      severity: 'High',
      recommended_permanent_fix:
        'Tighten neutral busbar lugs to 3.5 N-m torque spec and replace scorched 40A double-pole isolator switch.',
      estimated_cost_band: 'Low',
      preventive_action:
        'Schedule bi-monthly infrared thermography on all main floor electrical distribution panels.',
      isSimulated: true,
    },
    {
      id: 'rc-cluster-102',
      title: 'Hostel Wi-Fi Roaming De-Auth Flooding',
      probable_root_cause:
        'Unbalanced transmit power (Tx Power 23dBm) on Corridor AP-04 causing sticky client thrashing and packet drop for students in odd-numbered rooms.',
      confidence: 82,
      category: 'Internet / Connectivity',
      location_scope: 'Block',
      affected_locations: ['Hostel Wing A', 'Corridor 2 & 3'],
      related_ticket_ids: existingIds.slice(3, 5),
      evidence: [
        'Concurrent complaints of disconnects during hostel study hours (8 PM - 11 PM)',
        'AP syslog indicates 180+ 802.11 deauthentication events per hour',
      ],
      severity: 'Medium',
      recommended_permanent_fix:
        'Lower Tx Power to 14dBm on 2.4GHz band and enable 802.11k/v fast BSS roaming transitions.',
      estimated_cost_band: 'Low',
      preventive_action: 'Perform quarterly RF channel survey to prevent overlapping co-channel interference.',
      isSimulated: true,
    },
  ];
};

export const getMockResolutionVerification = (
  _beforeImage?: string,
  _afterImage?: string,
  complaintText: string = '',
  _location: string = '',
  resolutionNote: string = ''
): ResolutionVerificationResult => {
  const isSatisfactory = resolutionNote.length > 10;

  if (isSatisfactory) {
    return {
      verdict: 'Verified',
      confidence: 91,
      what_was_wrong: `Reported issue: "${complaintText.slice(0, 100) || 'Damaged campus fixture'}"`,
      what_changed: `Visible restoration matching technician note: "${resolutionNote.slice(0, 100)}"`,
      checks: [
        { item: 'Evidence photograph confirms replacement/repair of defective component', passed: true },
        { item: 'Debris and hazard materials completely removed from area', passed: true },
        { item: 'Mounting hardware and seals seated securely in place', passed: true },
        { item: 'Resolution note provides actionable technical description', passed: true },
      ],
      red_flags: [],
      reasoning:
        'Multimodal inspection shows clear before-to-after transformation. Defective element replaced and area restored to standard campus operational condition.',
      recommended_action: 'Advance ticket to "Awaiting Student Confirmation" and notify student.',
      isSimulated: true,
    };
  }

  return {
    verdict: 'Inconclusive',
    confidence: 58,
    what_was_wrong: complaintText || 'Reported breakdown',
    what_changed: 'After-image does not clearly show the completed repair from the same angle',
    checks: [
      { item: 'Photographic evidence matches reported location', passed: true },
      { item: 'Clear evidence of operational testing', passed: false },
      { item: 'Resolution note details replacement parts', passed: false },
    ],
    red_flags: ['Insufficient lighting or angle variation makes verification ambiguous.'],
    reasoning:
      'The uploaded completion photo lacks sufficient clarity to definitively verify operational status without a student confirmation check.',
    recommended_action: 'Request technician upload clearer photo or obtain manual proctor signoff.',
    isSimulated: true,
  };
};
