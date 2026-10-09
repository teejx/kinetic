import { UserProfile, WorkoutLog, RoutineTemplate, PersonalRecord } from '../types';

const PROFILE_KEY = 'kinetic_auth_user_v2';

// Purge any legacy shared multi-user keys to ensure 100% data privacy
export function purgeLegacyPooledData(): void {
  try {
    localStorage.removeItem('kinetic_users_v1');
    localStorage.removeItem('kinetic_active_user_v1');
    localStorage.removeItem('kinetic_workouts_v1');
    localStorage.removeItem('kinetic_routines_v1');
    localStorage.removeItem('kinetic_prs_v1');
    localStorage.removeItem('kinetic_sync_queue_v1');
    localStorage.removeItem('kinetic_firebase_config_v1');
    localStorage.removeItem('kinetic_supabase_config_v1');
  } catch (e) {
    // ignore
  }
}

// Calculate Estimated 1RM using Epley formula: weight * (1 + reps / 30)
export function calculateOneRepMax(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  const epley = weight * (1 + reps / 30);
  return Math.round(epley * 10) / 10;
}

// Play audio beep cue for rest timer
export function playRestTimerBeep(highPitch: boolean = false) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(highPitch ? 880 : 520, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Audio might be blocked if no user interaction yet
  }
}

// 1:1 Isolated Profile storage for authenticated athlete
export function getSavedProfile(): UserProfile | null {
  purgeLegacyPooledData();
  const data = localStorage.getItem(PROFILE_KEY);
  if (!data) return null;
  try {
    const profile = JSON.parse(data);
    if (profile && profile.name && profile.name.includes('@')) {
      profile.name = profile.name.split('@')[0];
      profile.handle = `@${profile.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    }
    return profile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile | null): void {
  if (profile) {
    const cleanName = profile.name.includes('@') ? profile.name.split('@')[0] : profile.name;
    const cleanProfile: UserProfile = {
      ...profile,
      name: cleanName,
      handle: profile.handle && !profile.handle.includes('@')
        ? `@${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
        : profile.handle,
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(cleanProfile));
  } else {
    localStorage.removeItem(PROFILE_KEY);
  }
}

// User-isolated Workout logs (keyed strictly by userId to prevent cross-account leaks)
export function getSavedWorkouts(userId: string): WorkoutLog[] {
  if (!userId) return [];
  const data = localStorage.getItem(`kinetic_workouts_${userId}`);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveWorkouts(userId: string, workouts: WorkoutLog[]): void {
  if (!userId) return;
  localStorage.setItem(`kinetic_workouts_${userId}`, JSON.stringify(workouts));
}

// User-isolated Routines
export function getSavedRoutines(userId: string): RoutineTemplate[] {
  if (!userId) return [];
  const data = localStorage.getItem(`kinetic_routines_${userId}`);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveRoutines(userId: string, routines: RoutineTemplate[]): void {
  if (!userId) return;
  localStorage.setItem(`kinetic_routines_${userId}`, JSON.stringify(routines));
}

// User-isolated Personal Records
export function getSavedPRs(userId: string): PersonalRecord[] {
  if (!userId) return [];
  const data = localStorage.getItem(`kinetic_prs_${userId}`);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function savePRs(userId: string, prs: PersonalRecord[]): void {
  if (!userId) return;
  localStorage.setItem(`kinetic_prs_${userId}`, JSON.stringify(prs));
}

export interface SyncQueueItem {
  id: string;
  action: 'upsert_workout' | 'delete_workout' | 'upsert_profile';
  payload: any;
  timestamp: string;
}

const SYNC_QUEUE_KEY = 'kinetic_sync_queue_v2';

export function getSyncQueue(): SyncQueueItem[] {
  const data = localStorage.getItem(SYNC_QUEUE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function addToSyncQueue(action: SyncQueueItem['action'], payload: any): void {
  const queue = getSyncQueue();
  const newItem: SyncQueueItem = {
    id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    payload,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([...queue, newItem]));
}

export function clearSyncQueue(): void {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([]));
}

