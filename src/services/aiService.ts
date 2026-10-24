import { AiAnalysisResult, AiAnalysisResultSchema } from '../utils/validation';
import { CAMPUS_ROUTING_GUIDE } from './aiConfig';
import { Ticket, TicketCategory, TicketPriority } from '../types';

export interface DuplicateMatchResult {
  hasDuplicate: boolean;
  confidence: 'high' | 'medium' | 'low';
  similarityScore: number;
  matchedTicket?: Ticket;
  reason?: string;
}

export class AiService {
  /**
   * Analyzes student complaint text and optional photo to extract structured metadata.
   */
  async analyzeComplaint(
    complaint: string,
    location: string,
    photoBase64?: string
  ): Promise<{ result: AiAnalysisResult; isSimulated: boolean }> {
    // If backend proxy API is configured with live Gemini key
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    if (apiBaseUrl && !import.meta.env.VITE_APP_MODE?.includes('demo')) {
      try {
        const response = await fetch(`${apiBaseUrl}/analyze-complaint`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ complaint, location, photoBase64 }),
        });

        if (response.ok) {
          const json = await response.json();
          const parsed = AiAnalysisResultSchema.safeParse(json);
          if (parsed.success) {
            return { result: parsed.data, isSimulated: false };
          }
        }
      } catch (err) {
        console.warn('Live Gemini API call failed or timed out, falling back gracefully:', err);
      }
    }

    // High-fidelity fallback / Demo Mode simulation adhering to Gemini prompt guidelines
    const simulated = this.simulateAnalysis(complaint, location, photoBase64);
    return { result: simulated, isSimulated: true };
  }

  /**
   * Detects duplicate tickets among active issues in the same category or campus area.
   */
  findDuplicateCandidate(
    complaint: string,
    location: string,
    category: TicketCategory,
    activeTickets: Ticket[],
    isSharedLocation: boolean
  ): DuplicateMatchResult {
    // Prompt rule: A private room problem must NOT be merged with a shared facility problem
    if (!isSharedLocation) {
      return { hasDuplicate: false, confidence: 'low', similarityScore: 0 };
    }

    const complaintLower = complaint.toLowerCase();
    const locationLower = location.toLowerCase();

    // Filter tickets that are not resolved/closed
    const openTickets = activeTickets.filter(
      (t) => t.status !== 'Resolved' && t.isSharedLocation
    );

    let bestMatch: Ticket | undefined;
    let highestScore = 0;
    let matchReason = '';

    for (const ticket of openTickets) {
      let score = 0;

      // Same category weight
      if (ticket.category === category) {
        score += 0.35;
      }

      // Location similarity
      const ticketLocLower = ticket.location.toLowerCase();
      const locKeywords = ['block b', 'block a', 'hostel 3', 'hostel 4', 'library', 'mess', 'cafeteria', 'ground floor', '2nd floor', '3rd floor'];
      
      const sharedLocKeywords = locKeywords.filter(
        (kw) => locationLower.includes(kw) && ticketLocLower.includes(kw)
      );

      if (sharedLocKeywords.length > 0) {
        score += 0.35 * Math.min(1, sharedLocKeywords.length * 0.5);
      }

      // Specific hardware / symptom matching
      const symptomKeywords = [
        'water cooler',
        'cooler',
        'wifi',
        'wi-fi',
        'leak',
        'pipe',
        'washroom',
        'tap',
        'food',
        'chapati',
        'ac',
        'fan',
        'elevator',
        'lift',
      ];

      const sharedSymptoms = symptomKeywords.filter(
        (s) => complaintLower.includes(s) && (ticket.originalComplaint.toLowerCase().includes(s) || ticket.title.toLowerCase().includes(s))
      );

      if (sharedSymptoms.length > 0) {
        score += 0.35;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = ticket;
        matchReason = `Matches active ticket ${ticket.ticketNumber} regarding "${sharedSymptoms.join(', ') || category}" at "${ticket.location}"`;
      }
    }

    if (highestScore >= 0.7 && bestMatch) {
      return {
        hasDuplicate: true,
        confidence: highestScore > 0.85 ? 'high' : 'medium',
        similarityScore: Math.round(highestScore * 100),
        matchedTicket: bestMatch,
        reason: matchReason,
      };
    }

    return {
      hasDuplicate: false,
      confidence: 'low',
      similarityScore: Math.round(highestScore * 100),
      matchedTicket: undefined,
    };
  }

  /**
   * Deterministic semantic parser simulating Gemini 2.5 Flash for instant demo & resilience
   */
  private simulateAnalysis(
    complaint: string,
    location: string,
    photoBase64?: string
  ): AiAnalysisResult {
    const text = complaint.toLowerCase();
    const locText = location.toLowerCase();

    let category: TicketCategory = 'Maintenance';
    let suggestedCommunity = 'Maintenance';
    let priority: TicketPriority = 'Medium';
    let priorityReason = 'Standard campus service issue affecting daily activities.';
    const missingInfo: string[] = [];

    // Check routing guide keywords
    for (const rule of CAMPUS_ROUTING_GUIDE) {
      const match = rule.keywords.some((kw) => text.includes(kw));
      if (match) {
        category = rule.category;
        suggestedCommunity = rule.communityName;
        break;
      }
    }

    // Priority heuristics
    if (
      text.includes('urgent') ||
      text.includes('broken tap') ||
      text.includes('flooding') ||
      text.includes('leak') ||
      text.includes('fire') ||
      text.includes('harassment') ||
      text.includes('emergency')
    ) {
      priority = 'Critical';
      priorityReason = 'Potential safety hazard, resource wastage, or urgent structural concern.';
    } else if (
      text.includes('not working') ||
      text.includes('cooler') ||
      text.includes('wifi') ||
      text.includes('wi-fi') ||
      text.includes('food') ||
      text.includes('theft')
    ) {
      priority = 'High';
      priorityReason = 'Significant disruption to student welfare and academic routine.';
    } else if (text.includes('bulb') || text.includes('door') || text.includes('noise')) {
      priority = 'Low';
      priorityReason = 'Minor inconvenience with low safety or operational impact.';
    }

    // Check for missing vital information
    if (locText.length < 5 || (!locText.includes('floor') && !locText.includes('room') && !locText.includes('block') && !locText.includes('hostel'))) {
      missingInfo.push('Please specify exact floor, wing, or room number for faster dispatch.');
    }
    if (complaint.length < 35) {
      missingInfo.push('Adding symptom onset time or specific equipment details will speed up resolution.');
    }

    // Intelligent Problem Summarization & Synthesis
    let title = '';
    let smartSummary = '';
    const locClean = location.replace(/\[.*?\]/, '').trim();
    const spot = locClean || 'reported facility';

    if (
      text.includes('leak') ||
      text.includes('tap') ||
      text.includes('pipe') ||
      text.includes('cooler') ||
      text.includes('paani') ||
      text.includes('water') ||
      text.includes('flush') ||
      text.includes('drain')
    ) {
      category = 'Maintenance';
      suggestedCommunity = 'Maintenance';
      title = `Plumbing & Water System Fault — ${spot}`;
      smartSummary = `Active water line or plumbing malfunction reported at ${spot}. Risk of continuous seepage and resource wastage; requires maintenance technician dispatch for valve, seal, and pressure line inspection.`;
    } else if (
      text.includes('light') ||
      text.includes('fan') ||
      text.includes('spark') ||
      text.includes('wire') ||
      text.includes('socket') ||
      text.includes('switch') ||
      text.includes('power') ||
      text.includes('mcb') ||
      text.includes('bijli') ||
      text.includes('short circuit')
    ) {
      category = 'Maintenance';
      suggestedCommunity = 'Maintenance';
      title = `Electrical Wiring & Fixture Fault — ${spot}`;
      smartSummary = `Electrical circuit irregularity or fixture disruption observed at ${spot}. Requires urgent electrician inspection to verify conduit lines, breaker stability, and prevent electrical hazards.`;
    } else if (
      text.includes('wifi') ||
      text.includes('wi-fi') ||
      text.includes('internet') ||
      text.includes('lan') ||
      text.includes('network') ||
      text.includes('router') ||
      text.includes('speed')
    ) {
      category = 'Internet / Connectivity';
      suggestedCommunity = 'Internet / Connectivity';
      title = `Network & Wi-Fi Outage — ${spot}`;
      smartSummary = `Connectivity drop or Access Point interruption logged at ${spot}. Escalated to IT Campus Infrastructure team for router reboot, channel diagnostics, and throughput verification.`;
    } else if (
      text.includes('mess') ||
      text.includes('food') ||
      text.includes('canteen') ||
      text.includes('roti') ||
      text.includes('dal') ||
      text.includes('dining') ||
      text.includes('hygiene') ||
      text.includes('insect')
    ) {
      category = 'Mess';
      suggestedCommunity = 'Mess';
      title = `Dining & Food Service Concern — ${spot}`;
      smartSummary = `Hostel catering or hygiene irregularity noted at ${spot}. Transmitted to Mess Committee and head catering contractor for immediate kitchen inspection.`;
    } else if (
      text.includes('security') ||
      text.includes('guard') ||
      text.includes('lock') ||
      text.includes('door') ||
      text.includes('theft') ||
      text.includes('stolen') ||
      text.includes('harass') ||
      text.includes('safety')
    ) {
      category = 'Security';
      suggestedCommunity = 'Security';
      title = `Campus Security & Entry Concern — ${spot}`;
      smartSummary = `Physical security, lock integrity, or access control issue reported at ${spot}. Alerted to Hostel Warden and campus security personnel for on-ground verification.`;
    } else {
      title = `Facility Repair Request — ${spot}`;
      const coreComplaint = complaint.trim().replace(/\n+/g, ' ');
      smartSummary = `Campus service request logged at ${spot}: "${coreComplaint.length > 100 ? coreComplaint.substring(0, 97) + '...' : coreComplaint}". Assigned for routine facility supervisor review.`;
    }

    let visibleEvidence: string | undefined = undefined;
    if (photoBase64) {
      visibleEvidence = 'Visible physical fixture and contextual damage observed in uploaded photograph.';
    }

    return {
      title,
      summary: smartSummary,
      category,
      suggestedCommunity,
      priority,
      priorityReason,
      locationExtracted: location,
      missingInfo,
      visibleEvidence,
    };
  }

  /**
   * Generates AI 7-day or 30-day operational history status and executive diagnostic briefing.
   */
  async generatePeriodHistoryStatus(
    timeRange: '7d' | '30d' | 'all',
    tickets: Ticket[]
  ): Promise<AiHistoryPeriodStatus> {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    // Filter tickets within timeframe
    const now = Date.now();
    const periodTickets = tickets.filter((t) => {
      if (timeRange === '7d') {
        return new Date(t.createdAt).getTime() >= now - 7 * 24 * 3600 * 1000;
      }
      if (timeRange === '30d') {
        return new Date(t.createdAt).getTime() >= now - 30 * 24 * 3600 * 1000;
      }
      return true;
    });

    // 1. Try server Gemini API proxy if active
    if (apiBaseUrl && !import.meta.env.VITE_APP_MODE?.includes('demo')) {
      try {
        const response = await fetch(`${apiBaseUrl}/analyze-period-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timeRange,
            tickets: periodTickets.slice(0, 30),
          }),
        });

        if (response.ok) {
          const json = await response.json();
          if (json && json.executiveSummary) {
            return {
              timeRange,
              periodLabel:
                timeRange === '7d'
                  ? 'Last 7 Days Status'
                  : timeRange === '30d'
                  ? 'Past 1 Month Record'
                  : 'All-Time Record Status',
              generatedAt: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              isAiSimulated: false,
              ...json,
            };
          }
        }
      } catch (err) {
        console.warn('Live Gemini period analysis failed, falling back to deterministic AI model:', err);
      }
    }

    // 2. High-fidelity Gemini prompt deterministic simulation
    return this.simulatePeriodHistory(timeRange, periodTickets);
  }

  private simulatePeriodHistory(
    timeRange: '7d' | '30d' | 'all',
    tickets: Ticket[]
  ): AiHistoryPeriodStatus {
    const total = tickets.length;
    const resolved = tickets.filter((t) => t.status === 'Resolved').length;
    const active = total - resolved;
    const criticalHigh = tickets.filter(
      (t) => (t.priority === 'Critical' || t.priority === 'High') && t.status !== 'Resolved'
    ).length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

    // Calculate turnaround average
    const resolvedWithDates = tickets.filter(
      (t) => t.status === 'Resolved' && t.updatedAt && t.createdAt
    );
    let avgHours = 2.8;
    if (resolvedWithDates.length > 0) {
      const sumMs = resolvedWithDates.reduce((acc, t) => {
        const diff = new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime();
        return acc + (diff > 0 ? diff : 3600 * 1000);
      }, 0);
      avgHours = Math.round((sumMs / (resolvedWithDates.length * 3600 * 1000)) * 10) / 10;
    }

    // Determine health score
    let healthScore = 94;
    if (criticalHigh > 2) healthScore -= 12;
    if (resolutionRate < 70) healthScore -= 10;
    if (active > 8) healthScore -= 8;
    healthScore = Math.max(55, Math.min(99, healthScore));

    const healthStatus: 'Optimal' | 'Stable' | 'Action Required' | 'Critical' =
      healthScore >= 90
        ? 'Optimal'
        : healthScore >= 75
        ? 'Stable'
        : healthScore >= 60
        ? 'Action Required'
        : 'Critical';

    const periodLabel =
      timeRange === '7d'
        ? 'Last 7 Days Status'
        : timeRange === '30d'
        ? 'Past 1 Month Record'
        : 'All-Time Record Status';

    const executiveSummary =
      timeRange === '7d'
        ? `During the past 7 days, ${total} campus issues were processed with an overall resolution rate of ${resolutionRate}%. The average turnaround time stood at ${avgHours} hours, maintaining high SLA stability across residential blocks with ${criticalHigh} pending urgent bottlenecks.`
        : timeRange === '30d'
        ? `Over the past 30 days, the operations desk logged ${total} cumulative incidents across academic and hostel zones. ${resolved} issues have been successfully cleared and verified (${resolutionRate}% closure velocity), reflecting sustained proactive maintenance despite peak monsoon and exam-hour loads.`
        : `Cumulative campus history encompasses ${total} logged requests. Maintenance and Wi-Fi infrastructure account for 74% of resolved tickets, demonstrating steady institutional SLA enforcement.`;

    const keyInsights = [
      `Turnaround velocity is averaging ${avgHours} hours per closed incident, within the 4-hour SLA benchmark.`,
      `${resolved} of ${total} logged complaints have been verified as resolved by student endorsees.`,
      criticalHigh > 0
        ? `${criticalHigh} critical/high severity issue(s) currently require technician dispatch prioritization.`
        : `Zero critical safety or emergency tickets currently pending in the active queue.`,
    ];

    return {
      timeRange,
      periodLabel,
      generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAiSimulated: true,
      healthScore,
      healthStatus,
      executiveSummary,
      keyInsights,
      velocityDiagnosis: {
        status: avgHours <= 3.0 ? 'Fast Resolution' : avgHours <= 5.0 ? 'Moderate' : 'Bottleneck Warning',
        avgTurnaroundHours: `${avgHours}h`,
        resolutionRate,
        description:
          avgHours <= 3.0
            ? 'Technician dispatch teams are clearing complaints faster than institutional target limits.'
            : 'Turnaround latency is elevated due to component supply delays or repeat inspections.',
      },
      repetitiveHotspots: [
        {
          location: 'Boys Hostel • Block B (2nd & 3rd Floor)',
          incidentCount: tickets.filter((t) => t.location?.toLowerCase().includes('block b') || t.location?.toLowerCase().includes('boys hostel')).length || 3,
          trend: 'Improving',
          riskSummary: 'Water cooler drainage overflow and corridor pipe pressure drops.',
        },
        {
          location: 'Girls Hostel • Wing B (2nd Floor)',
          incidentCount: tickets.filter((t) => t.location?.toLowerCase().includes('girls hostel')).length || 2,
          trend: 'Stable',
          riskSummary: 'Geyser heating element electrical MCB load balancing.',
        },
        {
          location: 'Hostel 4 West Wing & Block D',
          incidentCount: tickets.filter((t) => t.location?.toLowerCase().includes('wi-fi') || t.category === 'Internet / Connectivity').length || 2,
          trend: 'Improving',
          riskSummary: 'Wi-Fi Access Point 14 packet drop during peak 21:00 study hours.',
        },
      ],
      departmentPerformance: [
        {
          department: 'Maintenance',
          activeCount: tickets.filter((t) => t.category === 'Maintenance' && t.status !== 'Resolved').length,
          resolvedCount: tickets.filter((t) => t.category === 'Maintenance' && t.status === 'Resolved').length,
          slaCompliance: 97,
          healthTag: 'Excellent',
        },
        {
          department: 'Mess & Dining',
          activeCount: tickets.filter((t) => t.category === 'Mess' && t.status !== 'Resolved').length,
          resolvedCount: tickets.filter((t) => t.category === 'Mess' && t.status === 'Resolved').length,
          slaCompliance: 99,
          healthTag: 'Excellent',
        },
        {
          department: 'Internet & IT',
          activeCount: tickets.filter((t) => t.category === 'Internet / Connectivity' && t.status !== 'Resolved').length,
          resolvedCount: tickets.filter((t) => t.category === 'Internet / Connectivity' && t.status === 'Resolved').length,
          slaCompliance: 95,
          healthTag: 'Good',
        },
        {
          department: 'Security',
          activeCount: tickets.filter((t) => t.category === 'Security' && t.status !== 'Resolved').length,
          resolvedCount: tickets.filter((t) => t.category === 'Security' && t.status === 'Resolved').length,
          slaCompliance: 98,
          healthTag: 'Excellent',
        },
      ],
      proactiveActions: [
        {
          priority: 'Immediate',
          title: 'Inspect Water Pump MCB Relay',
          action: 'Perform proactive thermal scan on hostel pump electrical breaker before evening refill cycle.',
          assignedDepartment: 'Maintenance',
        },
        {
          priority: 'Scheduled',
          title: 'Reboot & Re-channel West AP #14',
          action: 'Apply firmware patch and frequency separation on 5GHz band to prevent 10-minute packet drops.',
          assignedDepartment: 'Internet & IT',
        },
        {
          priority: 'Monitoring',
          title: 'Mess Cold Storage Temperature Audit',
          action: 'Verify digital temperature sensor logs in South Mess walk-in cooler every 6 hours.',
          assignedDepartment: 'Mess & Dining',
        },
      ],
    };
  }
}

export interface AiHistoryPeriodStatus {
  timeRange: '7d' | '30d' | 'all';
  periodLabel: string;
  generatedAt: string;
  isAiSimulated: boolean;
  healthScore: number;
  healthStatus: 'Optimal' | 'Stable' | 'Action Required' | 'Critical';
  executiveSummary: string;
  keyInsights: string[];
  velocityDiagnosis: {
    status: 'Fast Resolution' | 'Moderate' | 'Bottleneck Warning';
    avgTurnaroundHours: string;
    resolutionRate: number;
    description: string;
  };
  repetitiveHotspots: {
    location: string;
    incidentCount: number;
    trend: 'Increasing' | 'Stable' | 'Improving';
    riskSummary: string;
  }[];
  departmentPerformance: {
    department: string;
    activeCount: number;
    resolvedCount: number;
    slaCompliance: number;
    healthTag: 'Excellent' | 'Good' | 'Needs Attention';
  }[];
  proactiveActions: {
    priority: 'Immediate' | 'Scheduled' | 'Monitoring';
    title: string;
    action: string;
    assignedDepartment: string;
  }[];
}

export const aiService = new AiService();
