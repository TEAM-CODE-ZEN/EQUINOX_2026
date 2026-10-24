import { TicketCategory, StaffDesignation } from '../types';

export interface CampusRoutingRule {
  category: TicketCategory;
  communityId: string;
  communityName: string;
  defaultStaffDesignation: StaffDesignation;
  keywords: string[];
  description: string;
}

export const CAMPUS_ROUTING_GUIDE: CampusRoutingRule[] = [
  {
    category: 'Mess',
    communityId: 'comm-mess',
    communityName: 'Mess',
    defaultStaffDesignation: 'Mess Staff',
    keywords: ['food', 'mess', 'dining', 'meal', 'lunch', 'dinner', 'breakfast', 'canteen', 'roti', 'dal', 'hygiene'],
    description: 'Issues regarding food quality, dining hall cleanliness, catering timings, and cutlery.',
  },
  {
    category: 'Security',
    communityId: 'comm-sec',
    communityName: 'Security',
    defaultStaffDesignation: 'Security Guard',
    keywords: ['theft', 'stolen', 'refrigerator', 'cctv', 'lost', 'trespass', 'gate', 'guard', 'safety', 'harassment'],
    description: 'Campus safety concerns, theft reports, CCTV verification requests, and perimeter security.',
  },
  {
    category: 'Maintenance',
    communityId: 'comm-maint',
    communityName: 'Maintenance',
    defaultStaffDesignation: 'Maintenance Worker',
    keywords: ['cooler', 'water', 'leak', 'pipe', 'plumbing', 'tap', 'ac', 'fan', 'light', 'electricity', 'switch', 'flush', 'lift', 'elevator'],
    description: 'Hostel and campus infrastructure, water coolers, plumbing, electrical repairs, and civil works.',
  },
  {
    category: 'Internet / Connectivity',
    communityId: 'comm-net',
    communityName: 'Internet / Connectivity',
    defaultStaffDesignation: 'Other',
    keywords: ['wifi', 'wi-fi', 'internet', 'router', 'ethernet', 'lan', 'connection', 'dns', 'portal', 'speed'],
    description: 'Hostel and campus Wi-Fi outages, network speed drops, and student portal connectivity.',
  },
];

export const AI_CONFIG = {
  provider: 'google-genai' as const,
  // Model can be changed via GEMINI_MODEL server env variable without touching UI components
  defaultModel: 'gemini-2.5-flash',
  temperature: 0.2,
  topP: 0.95,
  maxOutputTokens: 1024,
  timeoutMs: 12000,
  maxRetries: 2,
  featureFlags: {
    enablePhotographAnalysis: true,
    enableDuplicateDetection: true,
    enableConversationalClarification: true,
    allowManualFallbackOnFailure: true,
  },
};
