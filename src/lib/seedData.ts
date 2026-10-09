import { UserProfile, WorkoutLog, RoutineTemplate, PersonalRecord } from '../types';

// The users are blank at start as requested, populated exclusively when a user registers or logs in!
export const INITIAL_USERS: UserProfile[] = [];

export const INITIAL_ROUTINES: RoutineTemplate[] = [];

export const INITIAL_WORKOUTS: WorkoutLog[] = [];

export const INITIAL_PRS: Record<string, PersonalRecord[]> = {};
