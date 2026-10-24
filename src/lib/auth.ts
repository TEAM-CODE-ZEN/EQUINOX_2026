import { UserProfile, UserRole, StaffDesignation } from '../types';

export interface AppSession {
  role: 'student' | 'staff' | 'admin';
  name: string;
  id: string;
  designation?: string;
  department?: string;
  hostel?: string;
  room?: string;
  phone?: string;
  loggedInAt: string;
}

export const SESSION_KEY = 'campusaccord_session';

export function getStoredSession(): AppSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(session: AppSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export function sessionToUserProfile(session: AppSession): UserProfile {
  let role: UserRole = 'Student';
  if (session.role === 'staff') role = 'Campus Staff';
  if (session.role === 'admin') role = 'Admin';

  let designation: StaffDesignation | undefined = undefined;
  if (session.role === 'staff' && session.designation) {
    if (session.designation === 'Warden') designation = 'Warden';
    else if (
      session.designation === 'Electrician' ||
      session.designation === 'Plumber' ||
      session.designation === 'Maintenance Head'
    )
      designation = 'Maintenance Worker';
    else if (session.designation === 'Housekeeping Supervisor')
      designation = 'Housekeeping Staff';
    else designation = 'Other';
  }

  let roomNumber: string | undefined = undefined;
  if (session.role === 'student') {
    if (session.hostel === 'Day Scholar') {
      roomNumber = 'Day Scholar';
    } else if (session.hostel && session.room) {
      roomNumber = `${session.hostel}, Room ${session.room}`;
    } else if (session.hostel) {
      roomNumber = session.hostel;
    }
  }

  const avatar =
    session.role === 'admin'
      ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
      : session.role === 'staff'
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

  return {
    uid: `usr-${session.id.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`,
    name: session.name,
    email: `${session.id.toLowerCase().replace(/[^a-z0-9_-]/g, '')}@zenith.ai`,
    role,
    designation,
    roomNumber: roomNumber || (session.role === 'student' ? 'Hostel B, Room 204' : undefined),
    accountStatus: 'Active',
    joinedDate: 'Academic Year 2026-27',
    committeeMemberships: session.department
      ? [session.department]
      : session.role === 'admin'
      ? ['Executive Council']
      : ['Hostel Welfare'],
    avatarUrl: avatar,
  };
}

export function validateLogin(params: {
  role: 'student' | 'staff' | 'admin';
  name: string;
  id: string;
  password?: string;
  designation?: string;
  department?: string;
  hostel?: string;
  room?: string;
}): { success: boolean; error?: string; session?: AppSession } {
  const trimmedName = params.name.trim();
  const trimmedId = params.id.trim();

  if (!trimmedName) {
    return { success: false, error: 'Full name is required' };
  }
  if (!trimmedId) {
    return {
      success: false,
      error:
        params.role === 'student'
          ? 'Roll number is required'
          : params.role === 'staff'
          ? 'Staff ID is required'
          : 'Admin ID or official email is required',
    };
  }
  if (params.role === 'student' && !params.hostel) {
    return { success: false, error: 'Hostel is required' };
  }
  if (params.role === 'staff' && !params.designation) {
    return { success: false, error: 'Designation is required' };
  }
  if (!params.password || params.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  const session: AppSession = {
    role: params.role,
    name: trimmedName,
    id: trimmedId.toUpperCase(),
    designation: params.designation,
    department: params.department,
    hostel: params.hostel,
    room: params.room?.trim(),
    loggedInAt: new Date().toISOString(),
  };

  saveSession(session);
  return { success: true, session };
}
