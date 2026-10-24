export interface LikelyCause {
  cause: string;
  likelihood: number; // 0 - 100
  reasoning: string;
}

export interface InvestigationReport {
  summary: string;
  likely_causes: LikelyCause[];
  what_to_check_first: string[];
  questions_for_student: string[];
  required_skills: string[];
  tools_and_parts: string[];
  safety_warnings: string[];
  similar_ticket_ids: string[];
  is_recurring: boolean;
  recurrence_note?: string;
  suggested_priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  priority_reason: string;
  estimated_fix_time: string;
  suggested_department: string;
  next_best_actions: string[];
  isSimulated?: boolean;
}

export interface InvestigationChatTurn {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface RootCauseCluster {
  id: string;
  title: string;
  probable_root_cause: string;
  confidence: number; // 0 - 100
  category: string;
  location_scope: 'Room' | 'Floor' | 'Block' | 'Campus';
  affected_locations: string[];
  related_ticket_ids: string[];
  evidence: string[];
  severity: 'Low' | 'Medium' | 'High';
  recommended_permanent_fix: string;
  estimated_cost_band: 'Low' | 'Medium' | 'High';
  preventive_action: string;
  status?: 'Active' | 'Mitigating' | 'Resolved';
  isSimulated?: boolean;
}

export interface VerificationCheck {
  item: string;
  passed: boolean;
}

export interface ResolutionVerificationResult {
  verdict: 'Verified' | 'Not Verified' | 'Inconclusive';
  confidence: number; // 0 - 100
  what_was_wrong: string;
  what_changed: string;
  checks: VerificationCheck[];
  red_flags: string[];
  reasoning: string;
  recommended_action: string;
  isSimulated?: boolean;
}
