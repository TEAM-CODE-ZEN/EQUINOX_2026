import { GoogleGenAI } from '@google/genai';
import { Ticket } from '../../types';
import {
  InvestigationReport,
  InvestigationChatTurn,
  RootCauseCluster,
  ResolutionVerificationResult,
} from './types';
import {
  getMockInvestigationReport,
  getMockRootCauses,
  getMockResolutionVerification,
} from './mockResults';

const TIMEOUT_MS = 20000; // 20s hard timeout
const STORAGE_GEMINI_KEY = 'campusaccord_gemini_api_key';

export const getGeminiApiKey = (): string => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_GEMINI_KEY);
    if (stored && stored.trim()) return stored.trim();
  }
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

export const stripCodeFences = (text: string): string => {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
};

export const hashImageString = async (data: string): Promise<string> => {
  if (!data) return '';
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data.trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash |= 0;
    }
    return String(hash);
  }
};

/**
 * Execute a timeout-bounded Gemini call with strict JSON and mock fallback
 */
async function callGeminiJson<T>(
  prompt: string,
  systemInstruction: string,
  responseSchema?: any,
  inlineImages?: { mimeType: string; data: string }[]
): Promise<{ data: T; isSimulated: boolean }> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let responseText = '';

    // Primary: GoogleGenAI class
    try {
      const ai = new GoogleGenAI({ apiKey });
      const contents: any[] = [];

      if (inlineImages && inlineImages.length > 0) {
        for (const img of inlineImages) {
          contents.push({
            inlineData: {
              mimeType: img.mimeType,
              data: img.data,
            },
          });
        }
      }
      contents.push(prompt);

      const config: any = {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: 'application/json',
      };
      if (responseSchema) {
        config.responseSchema = responseSchema;
      }

      // 20s timeout race
      const genPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config,
      });

      const abortPromise = new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () =>
          reject(new Error('TIMEOUT_20S'))
        );
      });

      const result: any = await Promise.race([genPromise, abortPromise]);
      responseText = result?.text || '';
    } catch (genAiError: any) {
      if (genAiError?.message === 'TIMEOUT_20S') throw genAiError;

      // Fallback via direct HTTP REST endpoint if SDK client encounters browser compatibility boundary
      const bodyParts: any[] = [];
      if (inlineImages) {
        for (const img of inlineImages) {
          bodyParts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
        }
      }
      bodyParts.push({ text: prompt });

      const restRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: bodyParts }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
              responseSchema,
            },
          }),
        }
      );

      if (!restRes.ok) {
        throw new Error(`HTTP_${restRes.status}`);
      }
      const restJson = await restRes.json();
      responseText = restJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    clearTimeout(timeoutId);

    const cleaned = stripCodeFences(responseText);
    const parsed = JSON.parse(cleaned) as T;
    return { data: parsed, isSimulated: false };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Feature A: AI Complaint Investigator
 */
export async function investigateTicket(
  ticket: Ticket,
  relatedTickets: Ticket[] = [],
  rootCauseClusterTitle?: string
): Promise<InvestigationReport> {
  const validRelatedIds = new Set(relatedTickets.map((t) => t.id));

  try {
    const prompt = `
Ticket Details:
- ID: ${ticket.id}
- Title: ${ticket.title}
- Complaint: ${ticket.originalComplaint || ticket.summary}
- Location: ${ticket.location || 'Unspecified'}
- Category: ${ticket.category}
- Current Priority: ${ticket.priority}
- Affected Student Count: ${ticket.affectedCount}
${rootCauseClusterTitle ? `- Associated Root-Cause Cluster: "${rootCauseClusterTitle}"` : ''}

Recent Related Incidents in Proximity (Max 15):
${relatedTickets
  .slice(0, 15)
  .map(
    (t) =>
      `* ID: ${t.id} | Location: ${t.location} | Category: ${t.category} | Title: ${t.title} | Status: ${t.status}`
  )
  .join('\n') || 'None'}

Generate a systematic root-cause investigation report. Return valid JSON only.
`;

    const systemInstruction = `
You are the Senior Technical Facilities Investigator for Zenith School of AI.
Analyze the incident systematically.
Return valid JSON adhering to this schema:
{
  "summary": "Technical incident summary string",
  "likely_causes": [{"cause": "string", "likelihood": number_0_to_100, "reasoning": "string"}],
  "what_to_check_first": ["actionable check 1", "actionable check 2"],
  "questions_for_student": ["clarifying question 1", "clarifying question 2"],
  "required_skills": ["skill 1", "skill 2"],
  "tools_and_parts": ["tool 1", "replacement part 2"],
  "safety_warnings": ["safety hazard warning 1"],
  "similar_ticket_ids": ["ids from related incidents only"],
  "is_recurring": true_or_false,
  "recurrence_note": "explanation if recurring",
  "suggested_priority": "Low" | "Medium" | "High" | "Urgent",
  "priority_reason": "rationale for priority",
  "estimated_fix_time": "e.g. 45-60 minutes",
  "suggested_department": "Maintenance & Estate" | "Mess & Dining" | "Campus Security" | "Internet & IT Infrastructure",
  "next_best_actions": ["action 1", "action 2"]
}
Drop any similar_ticket_ids that do not match the input incidents.
`;

    const { data } = await callGeminiJson<InvestigationReport>(prompt, systemInstruction);

    // Validate similar_ticket_ids against real input IDs
    if (data.similar_ticket_ids) {
      data.similar_ticket_ids = data.similar_ticket_ids.filter((id) =>
        validRelatedIds.has(id)
      );
    }
    data.isSimulated = false;
    return data;
  } catch (err) {
    console.warn('Gemini investigateTicket fallback engaged:', err);
    return getMockInvestigationReport(ticket, relatedTickets);
  }
}

/**
 * Feature A: Follow-up Chat with Investigator AI
 */
export async function chatWithInvestigator(
  ticket: Ticket,
  report: InvestigationReport,
  historyTurns: InvestigationChatTurn[],
  userQuestion: string
): Promise<string> {
  try {
    const recentTurns = historyTurns.slice(-10);
    const prompt = `
Ticket Context:
- ID: ${ticket.id} (${ticket.title})
- Location: ${ticket.location}
- Complaint: ${ticket.originalComplaint || ticket.summary}
- Investigation Summary: ${report.summary}
- Likely Causes: ${report.likely_causes.map((c) => `${c.cause} (${c.likelihood}%)`).join('; ')}
- Check First: ${report.what_to_check_first.join('; ')}

Recent Conversation:
${recentTurns.map((t) => `${t.role === 'user' ? 'Technician' : 'Investigator AI'}: ${t.text}`).join('\n')}

Technician: ${userQuestion}
Investigator AI:
`;

    const systemInstruction = `
You are the Senior Technical Facilities Investigator.
Provide short, practical, grounded answers based ONLY on the ticket data and technical investigation.
If there is not enough information to know for sure, say: "Not enough information provided in the ticket context to answer with certainty."
Do not guess. Keep answers concise (max 3-4 sentences). Respond in plain text.
`;

    const apiKey = getGeminiApiKey();
    if (!apiKey) throw new Error('NO_API_KEY');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const res: any = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { systemInstruction, temperature: 0.2 },
      });
      clearTimeout(timeoutId);
      return res?.text?.trim() || 'Not enough information provided in the ticket context to answer with certainty.';
    } catch {
      clearTimeout(timeoutId);
      // REST fallback
      const restRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: { temperature: 0.2 },
          }),
        }
      );
      if (!restRes.ok) throw new Error('REST_FAILED');
      const restData = await restRes.json();
      return (
        restData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        'Not enough information provided in the ticket context to answer with certainty.'
      );
    }
  } catch (err) {
    console.warn('Investigator chat fallback notice:', err);
    return 'Not enough information provided in the ticket context to answer with certainty. (AI offline mode active)';
  }
}

/**
 * Feature B: Root-Cause Detection
 */
export async function detectRootCauses(
  tickets: Ticket[]
): Promise<RootCauseCluster[]> {
  const validIds = new Set(tickets.map((t) => t.id));

  // Send last 90 days relevant payload
  const sampleTickets = tickets.slice(0, 30).map((t) => ({
    id: t.id,
    category: t.category,
    location: t.location,
    title: t.title,
    summary: t.summary,
    status: t.status,
    priority: t.priority,
    createdAt: t.createdAt,
    duplicateCount: t.affectedCount,
  }));

  try {
    const prompt = `
Analyze the following maintenance and facilities tickets:
${JSON.stringify(sampleTickets, null, 2)}

Identify systemic root-cause clusters where multiple incidents stem from a single underlying engineering defect.
Return JSON with key "clusters" adhering strictly to schema.
`;

    const systemInstruction = `
You are the Chief Infrastructure Engineer for Zenith School of AI.
Group related tickets into engineering root-cause clusters.
Return valid JSON only conforming to:
{
  "clusters": [
    {
      "id": "rc-cluster-string",
      "title": "Clear engineering cluster title",
      "probable_root_cause": "Detailed engineering root cause explanation",
      "confidence": number_0_to_100,
      "category": "Maintenance" | "Internet / Connectivity" | "Mess" | "Security" | "Other",
      "location_scope": "Room" | "Floor" | "Block" | "Campus",
      "affected_locations": ["Location 1", "Location 2"],
      "related_ticket_ids": ["valid ids from input"],
      "evidence": ["evidence bullet 1", "evidence bullet 2"],
      "severity": "Low" | "Medium" | "High",
      "recommended_permanent_fix": "Permanent solution",
      "estimated_cost_band": "Low" | "Medium" | "High",
      "preventive_action": "Preventive inspection procedure"
    }
  ]
}
Drop any related_ticket_ids that do not exist in the input.
`;

    const { data } = await callGeminiJson<{ clusters: RootCauseCluster[] }>(
      prompt,
      systemInstruction
    );

    if (data && Array.isArray(data.clusters)) {
      // Drop related_ticket_ids that do not exist in input
      data.clusters.forEach((c) => {
        c.related_ticket_ids = c.related_ticket_ids.filter((id) =>
          validIds.has(id)
        );
        c.isSimulated = false;
      });
      return data.clusters;
    }
    return getMockRootCauses(tickets);
  } catch (err) {
    console.warn('detectRootCauses fallback engaged:', err);
    return getMockRootCauses(tickets);
  }
}

/**
 * Feature C: Evidence-Based Resolution Verification
 */
export async function verifyResolution(
  beforeImage: string | undefined,
  afterImage: string,
  complaintText: string,
  location: string,
  resolutionNote: string
): Promise<ResolutionVerificationResult> {
  // 1. Client-side hash check: auto-fail if identical photos reused
  if (beforeImage && afterImage) {
    const hashBefore = await hashImageString(beforeImage);
    const hashAfter = await hashImageString(afterImage);
    if (hashBefore && hashAfter && hashBefore === hashAfter) {
      return {
        verdict: 'Not Verified',
        confidence: 0,
        what_was_wrong: complaintText,
        what_changed: 'None — exact same image provided as after evidence',
        checks: [
          { item: 'Photographic evidence matches reported issue', passed: true },
          { item: 'New physical evidence of repair provided', passed: false },
          { item: 'Distinct before and after states observed', passed: false },
        ],
        red_flags: [
          'Duplicate Photo Detected: The uploaded after-photo is identical to the original complaint photo.',
        ],
        reasoning:
          'Automated image hash verification detected an identical file submission. The repair cannot be certified without genuine completion evidence.',
        recommended_action: 'Upload an actual photograph of the repaired fixture.',
        isSimulated: false,
      };
    }
  }

  // 2. Multimodal Gemini verification call
  try {
    const inlineImages: { mimeType: string; data: string }[] = [];

    const extractBase64 = (uri: string) => {
      const match = uri.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) return { mimeType: match[1], data: match[2] };
      return null;
    };

    if (beforeImage) {
      const bImg = extractBase64(beforeImage);
      if (bImg) inlineImages.push(bImg);
    }
    if (afterImage) {
      const aImg = extractBase64(afterImage);
      if (aImg) inlineImages.push(aImg);
    }

    const prompt = `
Verification Request:
- Location: ${location}
- Complaint: ${complaintText}
- Technician Resolution Notes: ${resolutionNote}

Compare the evidence photo(s) with the reported issue and technician notes.
Validate whether the defect has genuinely been fixed.
Return JSON adhering strictly to the schema.
`;

    const systemInstruction = `
You are the Senior Quality Assurance Engineer for Campus Facilities.
Analyze repair verification evidence with high rigor.
Return valid JSON only conforming to:
{
  "verdict": "Verified" | "Not Verified" | "Inconclusive",
  "confidence": number_0_to_100,
  "what_was_wrong": "concise description of reported problem",
  "what_changed": "visible differences and repairs observed",
  "checks": [
    {"item": "Defect is physically resolved", "passed": true_or_false},
    {"item": "Area is safe and free of debris", "passed": true_or_false},
    {"item": "Component is seated/installed properly", "passed": true_or_false}
  ],
  "red_flags": ["any suspicious or unresolved concerns"],
  "reasoning": "2-line technical rationale for verdict",
  "recommended_action": "next action for campus administration"
}
`;

    const { data } = await callGeminiJson<ResolutionVerificationResult>(
      prompt,
      systemInstruction,
      undefined,
      inlineImages.length > 0 ? inlineImages : undefined
    );
    data.isSimulated = false;
    return data;
  } catch (err) {
    console.warn('verifyResolution fallback engaged:', err);
    return getMockResolutionVerification(
      beforeImage,
      afterImage,
      complaintText,
      location,
      resolutionNote
    );
  }
}
