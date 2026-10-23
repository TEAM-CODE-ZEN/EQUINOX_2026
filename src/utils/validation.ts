import { z } from 'zod';

export const TicketSubmissionSchema = z.object({
  complaint: z
    .string()
    .min(10, 'Complaint description must be at least 10 characters')
    .max(2000, 'Complaint description must be under 2000 characters'),
  location: z
    .string()
    .min(2, 'Location is required (e.g., Block B, 2nd Floor Water Station)')
    .max(120, 'Location must be under 120 characters'),
  isSharedLocation: z.boolean().default(true),
  isSensitive: z.boolean().default(false),
  photoUrl: z.string().optional(),
});

export type TicketSubmissionInput = z.infer<typeof TicketSubmissionSchema>;

export const AiAnalysisResultSchema = z.object({
  title: z.string().min(3).max(80),
  summary: z.string().min(5).max(300),
  category: z.enum([
    'Mess',
    'Security',
    'Maintenance',
    'Internet / Connectivity',
    'Events / Clubs',
    'Other',
  ]),
  suggestedCommunity: z.string(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  priorityReason: z.string(),
  locationExtracted: z.string().optional(),
  missingInfo: z.array(z.string()).default([]),
  visibleEvidence: z.string().optional(),
});

export type AiAnalysisResult = z.infer<typeof AiAnalysisResultSchema>;

export const AnnouncementSchema = z.object({
  title: z.string().min(5).max(120),
  message: z.string().min(10).max(1500),
  targetAudience: z.enum(['All', 'Students', 'Hostel Residents', 'Campus Staff']),
  isPinned: z.boolean().default(false),
});

export const EventSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(10).max(1500),
  dateTime: z.string().min(5),
  location: z.string().min(2),
  organizer: z.string().min(2),
  audience: z.string().default('All Campus Members'),
  registrationUrl: z.string().url().optional().or(z.literal('')),
});
