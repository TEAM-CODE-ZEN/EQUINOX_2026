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

    // Title generation
    let title = 'Campus Infrastructure Report';
    if (category === 'Mess') {
      title = 'Mess Quality & Dining Service Issue';
    } else if (category === 'Internet / Connectivity') {
      title = 'Hostel Wi-Fi Network Outage';
    } else if (category === 'Security') {
      title = 'Campus Security & Access Concern';
    } else if (text.includes('cooler')) {
      title = 'Drinking Water Cooler Malfunction';
    } else if (text.includes('tap') || text.includes('pipe') || text.includes('leak')) {
      title = 'Plumbing Pipe & Tap Leakage';
    } else if (text.includes('ac') || text.includes('cooling')) {
      title = 'Air Conditioning & Ventilation Fault';
    } else if (text.includes('light') || text.includes('fan') || text.includes('switch')) {
      title = 'Electrical Fixture Malfunction';
    }

    const summary = complaint.length > 120 ? complaint.substring(0, 117) + '...' : complaint;

    let visibleEvidence: string | undefined = undefined;
    if (photoBase64) {
      visibleEvidence = 'Visible physical fixture and contextual damage observed in uploaded photograph.';
    }

    return {
      title: `${location ? location.split(',')[0].trim() + ' — ' : ''}${title}`,
      summary: summary,
      category,
      suggestedCommunity,
      priority,
      priorityReason,
      locationExtracted: location,
      missingInfo,
      visibleEvidence,
    };
  }
}

export const aiService = new AiService();
