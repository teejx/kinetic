import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  WorkoutLog,
  RoutineTemplate,
  PersonalRecord,
  WorkoutExercise
} from '../types';
import {
  getSavedProfile,
  saveProfile,
  getSavedWorkouts,
  saveWorkouts,
  getSavedRoutines,
  saveRoutines,
  getSavedPRs,
  savePRs,
  purgeLegacyPooledData,
  calculateOneRepMax,
  playRestTimerBeep,
  getSyncQueue,
  addToSyncQueue,
  clearSyncQueue
} from '../lib/storage';
import {
  isFirebaseConfigured,
  registerFirebaseUser,
  loginFirebaseUser,
  logoutFirebaseUser,
  onFirebaseAuthStateChanged,
  syncWorkoutToFirestore,
  deleteWorkoutFromFirestore,
  syncProfileToFirestore
} from '../lib/firebase';
import { EXERCISE_DATABASE } from '../lib/exercises';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface RestTimerState {
  secondsRemaining: number;
  totalSeconds: number;
  isRunning: boolean;
  exerciseName?: string;
  start: (seconds: number, name?: string) => void;
  stop: () => void;
  addSeconds: (seconds: number) => void;
}

interface FitnessContextType {
  // Authentication & Session
  currentUser: UserProfile | null;
  activeUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    email: string,
    pass: string,
    name: string,
    trainingGoal: UserProfile['trainingGoal'],
    weight: number,
    unit: 'kg' | 'lbs'
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginGuest: (options?: {
    name?: string;
    trainingGoal?: UserProfile['trainingGoal'];
    weight?: number;
    unit?: 'kg' | 'lbs';
  }) => void;
  updateUserProfile: (profile: UserProfile) => void;

  // Workouts (User-isolated)
  workouts: WorkoutLog[];
  userWorkouts: WorkoutLog[];
  addWorkout: (workout: Omit<WorkoutLog, 'id'>) => Promise<WorkoutLog>;
  deleteWorkout: (id: string) => void;

  // Routines (User-isolated)
  routines: RoutineTemplate[];
  userRoutines: RoutineTemplate[];
  createRoutine: (title: string, description: string, category: string, exerciseIds: string[]) => void;
  deleteRoutine: (id: string) => void;

  // Personal Records (User-isolated)
  personalRecords: PersonalRecord[];

  // Live Workout Session
  activeSession: WorkoutLog | null;
  startSession: (routine?: RoutineTemplate) => void;
  updateActiveSession: (updater: (prev: WorkoutLog) => WorkoutLog) => void;
  finishSession: () => Promise<WorkoutLog | null>;
  cancelSession: () => void;

  // Rest Timer
  restTimer: RestTimerState;

  // Offline & PWA capabilities
  isOnline: boolean;
  wasOffline: boolean;
  isInstallable: boolean;
  promptInstall: () => Promise<boolean>;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOnline, wasOffline, isInstallable, promptInstall } = useOnlineStatus();

  // Purge legacy multi-user data on initialization
  useEffect(() => {
    purgeLegacyPooledData();
  }, []);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getSavedProfile());
  const activeUser = currentUser;
  const isAuthenticated = currentUser !== null;

  // User-scoped data states
  const [workouts, setWorkouts] = useState<WorkoutLog[]>(() => {
    const prof = getSavedProfile();
    return prof ? getSavedWorkouts(prof.id) : [];
  });
  const [routines, setRoutines] = useState<RoutineTemplate[]>(() => {
    const prof = getSavedProfile();
    return prof ? getSavedRoutines(prof.id) : [];
  });
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(() => {
    const prof = getSavedProfile();
    return prof ? getSavedPRs(prof.id) : [];
  });

  const [activeSession, setActiveSession] = useState<WorkoutLog | null>(null);

  // Rest Timer State
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState<number>(0);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState<number>(0);
  const [timerIsRunning, setTimerIsRunning] = useState<boolean>(false);
  const [timerExerciseName, setTimerExerciseName] = useState<string | undefined>();

  // Synchronize user data whenever active user session changes
  useEffect(() => {
    if (currentUser) {
      setWorkouts(getSavedWorkouts(currentUser.id));
      setRoutines(getSavedRoutines(currentUser.id));
      setPersonalRecords(getSavedPRs(currentUser.id));
    } else {
      setWorkouts([]);
      setRoutines([]);
      setPersonalRecords([]);
    }
  }, [currentUser?.id]);

  // Headless background offline sync queue flusher (runs when internet returns)
  useEffect(() => {
    if (!isOnline || !isFirebaseConfigured()) return;
    const queue = getSyncQueue();
    if (queue.length === 0) return;

    (async () => {
      try {
        for (const item of queue) {
          if (item.action === 'upsert_workout') {
            await syncWorkoutToFirestore(item.payload);
          } else if (item.action === 'delete_workout') {
            await deleteWorkoutFromFirestore(item.payload.id);
          } else if (item.action === 'upsert_profile') {
            await syncProfileToFirestore(item.payload);
          }
        }
        clearSyncQueue();
      } catch (err) {
        console.error('Silent queue sync error:', err);
      }
    })();
  }, [isOnline, wasOffline]);

  // Listen to Firebase Auth state if cloud auth is configured
  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    const unsubscribe = onFirebaseAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser((prev) => {
          if (prev && prev.id === firebaseUser.uid) {
            return prev;
          }
          const saved = getSavedProfile();
          if (saved && saved.id === firebaseUser.uid) {
            return saved;
          }
          const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Athlete';
          const newProfile: UserProfile = {
            id: firebaseUser.uid,
            name,
            handle: `@${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            avatarBg: 'bg-volt',
            bio: 'Trained athlete.',
            trainingGoal: 'Strength',
            weightUnit: 'kg',
            bodyWeight: 75,
            streakDays: 1,
            joinedDate: new Date().toISOString().split('T')[0],
          };
          saveProfile(newProfile);
          return newProfile;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Rest timer ticker
  useEffect(() => {
    if (!timerIsRunning || timerSecondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimerSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerIsRunning(false);
          playRestTimerBeep(true);
          return 0;
        }
        if (prev === 4 || prev === 3 || prev === 2) {
          playRestTimerBeep(false);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerIsRunning, timerSecondsRemaining]);

  const startRestTimer = useCallback((seconds: number, name?: string) => {
    setTimerTotalSeconds(seconds);
    setTimerSecondsRemaining(seconds);
    setTimerIsRunning(true);
    setTimerExerciseName(name);
  }, []);

  const stopRestTimer = useCallback(() => {
    setTimerIsRunning(false);
    setTimerSecondsRemaining(0);
  }, []);

  const addRestTimerSeconds = useCallback((seconds: number) => {
    setTimerSecondsRemaining((prev) => Math.max(0, prev + seconds));
    setTimerTotalSeconds((prev) => Math.max(0, prev + seconds));
  }, []);

  // Authentication Handlers (Supports both Cloud & Seamless Local Accounts)
  const login = useCallback(async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (isFirebaseConfigured()) {
      const res = await loginFirebaseUser(email, pass);
      if (!res.user) {
        return { success: false, error: res.error || 'Login failed.' };
      }

      const firebaseUid = res.user.uid;
      const existing = getSavedProfile();
      if (existing && existing.id === firebaseUid) {
        setCurrentUser(existing);
        return { success: true };
      }

      const displayName = res.user.displayName || email.split('@')[0] || 'Athlete';
      const profile: UserProfile = {
        id: firebaseUid,
        name: displayName,
        handle: `@${displayName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        avatarBg: 'bg-volt',
        bio: 'Trained athlete.',
        trainingGoal: 'Strength',
        weightUnit: 'kg',
        bodyWeight: 75,
        streakDays: 1,
        joinedDate: new Date().toISOString().split('T')[0],
      };

      saveProfile(profile);
      setCurrentUser(profile);
      return { success: true };
    }

    // Local authentication (Offline-first mode)
    const existing = getSavedProfile();
    if (existing) {
      const targetName = email.split('@')[0].toLowerCase().trim();
      const existingName = existing.name.toLowerCase().trim();
      const existingHandle = existing.handle.replace('@', '').toLowerCase().trim();

      if (existingName === targetName || existingHandle === targetName || existing.id === email.trim()) {
        setCurrentUser(existing);
        return { success: true };
      }
    }

    return {
      success: false,
      error: 'Account not found. Please click "Create Account" to register first.',
    };
  }, []);

  const register = useCallback(async (
    email: string,
    pass: string,
    name: string,
    trainingGoal: UserProfile['trainingGoal'],
    weight: number,
    unit: 'kg' | 'lbs'
  ): Promise<{ success: boolean; error?: string }> => {
    let uid = `athlete-${Date.now()}`;

    // If Cloud Auth is configured in .env, authenticate with Firebase
    if (isFirebaseConfigured()) {
      const firebaseRes = await registerFirebaseUser(email, pass, name.trim());
      if (firebaseRes.user) {
        uid = firebaseRes.user.uid;
      } else {
        return { success: false, error: firebaseRes.error };
      }
    }

    // Create the isolated athlete profile
    const colors = ['bg-emerald-500', 'bg-volt', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500'];
    const randomBg = colors[Math.floor(Math.random() * colors.length)];
    const newProfile: UserProfile = {
      id: uid,
      name: name.trim(),
      handle: `@${name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      avatarBg: randomBg,
      bio: `Trained for ${trainingGoal.toLowerCase()}.`,
      trainingGoal,
      weightUnit: unit,
      bodyWeight: weight,
      streakDays: 1,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    saveProfile(newProfile);
    setCurrentUser(newProfile);

    // If cloud is active and online, sync profile in background
    if (isFirebaseConfigured() && isOnline) {
      syncProfileToFirestore(newProfile).catch(console.error);
    }

    return { success: true };
  }, [isOnline]);

  const logout = useCallback(async () => {
    try {
      if (isFirebaseConfigured()) {
        await logoutFirebaseUser();
      }
    } catch (e) {
      // ignore
    }
    saveProfile(null);
    setCurrentUser(null);
    setActiveSession(null);
    stopRestTimer();
  }, [stopRestTimer]);

  const loginGuest = useCallback((options?: {
    name?: string;
    trainingGoal?: UserProfile['trainingGoal'];
    weight?: number;
    unit?: 'kg' | 'lbs';
  }) => {
    const guestId = `guest-${Date.now()}`;
    const cleanName = options?.name?.trim() || 'Guest Athlete';
    const goal = options?.trainingGoal || 'General Fitness';
    const weight = options?.weight && options.weight > 0 ? options.weight : 75;
    const unit = options?.unit || 'kg';
    const colors = ['bg-emerald-500', 'bg-volt', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500'];
    const randomBg = colors[Math.floor(Math.random() * colors.length)];

    const guestProfile: UserProfile = {
      id: guestId,
      name: cleanName,
      handle: `@${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      avatarBg: randomBg,
      bio: `Local athlete focused on ${goal.toLowerCase()}.`,
      trainingGoal: goal,
      weightUnit: unit,
      bodyWeight: weight,
      streakDays: 1,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    saveProfile(guestProfile);
    setCurrentUser(guestProfile);
  }, []);

  const updateUserProfile = useCallback((profile: UserProfile) => {
    setCurrentUser(profile);
    saveProfile(profile);
    if (isFirebaseConfigured() && isOnline) {
      syncProfileToFirestore(profile).catch(console.error);
    }
  }, [isOnline]);

  // PR evaluation helper
  const evaluateWorkoutPRs = useCallback((
    exercises: WorkoutExercise[],
    currentPRs: PersonalRecord[]
  ): { updatedPRs: PersonalRecord[]; newPRAnnouncements: string[] } => {
    const updatedPRs = [...currentPRs];
    const newPRAnnouncements: string[] = [];

    exercises.forEach((we) => {
      let maxWeight = 0;
      let repsAtMax = 0;
      let best1RM = 0;

      we.sets.forEach((set) => {
        if (!set.completed || set.weight <= 0) return;
        const e1rm = calculateOneRepMax(set.weight, set.reps);
        if (e1rm > best1RM) {
          best1RM = e1rm;
          maxWeight = set.weight;
          repsAtMax = set.reps;
        }
      });

      if (best1RM > 0) {
        const existingIdx = updatedPRs.findIndex((p) => p.exerciseId === we.exerciseId);
        if (existingIdx === -1) {
          updatedPRs.push({
            exerciseId: we.exerciseId,
            exerciseName: we.exerciseName,
            maxWeight,
            repsAtMax,
            estimatedOneRepMax: best1RM,
            date: new Date().toISOString().split('T')[0],
          });
          newPRAnnouncements.push(`${we.exerciseName}: First record! ${maxWeight}kg x ${repsAtMax} (Est 1RM: ${best1RM}kg)`);
        } else {
          const old = updatedPRs[existingIdx];
          if (best1RM > old.estimatedOneRepMax) {
            const diff = Math.round((best1RM - old.estimatedOneRepMax) * 10) / 10;
            updatedPRs[existingIdx] = {
              ...old,
              maxWeight: Math.max(old.maxWeight, maxWeight),
              repsAtMax,
              estimatedOneRepMax: best1RM,
              date: new Date().toISOString().split('T')[0],
            };
            newPRAnnouncements.push(`${we.exerciseName}: New PR! ${maxWeight}kg x ${repsAtMax} (+${diff}kg 1RM)`);
          }
        }
      }
    });

    return { updatedPRs, newPRAnnouncements };
  }, []);

  // Workout handlers (Local First + Silent Background Queue)
  const addWorkout = useCallback(async (workoutData: Omit<WorkoutLog, 'id'>): Promise<WorkoutLog> => {
    if (!currentUser) throw new Error('Not authenticated');

    let totalVolume = 0;
    workoutData.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.completed) {
          totalVolume += s.weight * s.reps;
        }
      });
    });

    const { updatedPRs, newPRAnnouncements } = evaluateWorkoutPRs(
      workoutData.exercises,
      personalRecords
    );

    const newLog: WorkoutLog = {
      ...workoutData,
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      totalVolume,
      prsBroken: newPRAnnouncements,
    };

    const nextWorkouts = [newLog, ...workouts];
    setWorkouts(nextWorkouts);
    saveWorkouts(currentUser.id, nextWorkouts);

    setPersonalRecords(updatedPRs);
    savePRs(currentUser.id, updatedPRs);

    const updatedUser: UserProfile = {
      ...currentUser,
      streakDays: currentUser.streakDays + 1,
    };
    setCurrentUser(updatedUser);
    saveProfile(updatedUser);

    if (newPRAnnouncements.length > 0) {
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#d4ff00', '#ffffff', '#ff5722', '#38bdf8'],
        });
      } catch (e) {
        // Confetti fallback
      }
    }

    // Background Cloud Sync handling
    if (isFirebaseConfigured()) {
      if (isOnline) {
        syncWorkoutToFirestore(newLog).catch(() => {
          addToSyncQueue('upsert_workout', newLog);
        });
      } else {
        addToSyncQueue('upsert_workout', newLog);
      }
    }

    return newLog;
  }, [currentUser, workouts, personalRecords, evaluateWorkoutPRs, isOnline]);

  const deleteWorkout = useCallback((id: string) => {
    if (!currentUser) return;
    const nextWorkouts = workouts.filter((w) => w.id !== id);
    setWorkouts(nextWorkouts);
    saveWorkouts(currentUser.id, nextWorkouts);

    if (isFirebaseConfigured()) {
      if (isOnline) {
        deleteWorkoutFromFirestore(id).catch(() => {
          addToSyncQueue('delete_workout', { id });
        });
      } else {
        addToSyncQueue('delete_workout', { id });
      }
    }
  }, [currentUser, workouts, isOnline]);

  // Routine handlers
  const createRoutine = useCallback((title: string, description: string, category: string, exerciseIds: string[]) => {
    if (!currentUser) return;
    const newRoutine: RoutineTemplate = {
      id: `routine-${Date.now()}`,
      userId: currentUser.id,
      title,
      description,
      category,
      exerciseIds,
    };
    const nextRoutines = [newRoutine, ...routines];
    setRoutines(nextRoutines);
    saveRoutines(currentUser.id, nextRoutines);
  }, [currentUser, routines]);

  const deleteRoutine = useCallback((id: string) => {
    if (!currentUser) return;
    const nextRoutines = routines.filter((r) => r.id !== id);
    setRoutines(nextRoutines);
    saveRoutines(currentUser.id, nextRoutines);
  }, [currentUser, routines]);

  // Live Workout Session controls
  const startSession = useCallback((routine?: RoutineTemplate) => {
    if (!currentUser) return;
    let exercises: WorkoutExercise[] = [];

    if (routine) {
      exercises = routine.exerciseIds.map((exId, idx) => {
        const def = EXERCISE_DATABASE.find((e) => e.id === exId);
        return {
          id: `we-${idx}-${Date.now()}`,
          exerciseId: exId,
          exerciseName: def?.name || 'Exercise',
          category: def?.category || 'Full Body',
          sets: [
            { id: `s-1-${Date.now()}`, setNumber: 1, type: 'warmup', weight: 40, reps: 10, completed: false },
            { id: `s-2-${Date.now()}`, setNumber: 2, type: 'regular', weight: 60, reps: 8, completed: false },
            { id: `s-3-${Date.now()}`, setNumber: 3, type: 'regular', weight: 60, reps: 8, completed: false },
          ],
        };
      });
    } else {
      const bench = EXERCISE_DATABASE[0];
      exercises = [
        {
          id: `we-0-${Date.now()}`,
          exerciseId: bench.id,
          exerciseName: bench.name,
          category: bench.category,
          sets: [
            { id: `s-1-${Date.now()}`, setNumber: 1, type: 'warmup', weight: 20, reps: 10, completed: false },
            { id: `s-2-${Date.now()}`, setNumber: 2, type: 'regular', weight: 60, reps: 8, completed: false },
            { id: `s-3-${Date.now()}`, setNumber: 3, type: 'regular', weight: 60, reps: 8, completed: false },
          ],
        },
      ];
    }

    const session: WorkoutLog = {
      id: `live-${Date.now()}`,
      userId: currentUser.id,
      title: routine ? routine.title : 'Live Training Session',
      date: new Date().toISOString(),
      durationMinutes: 0,
      totalVolume: 0,
      notes: '',
      exercises,
    };

    setActiveSession(session);
  }, [currentUser]);

  const updateActiveSession = useCallback((updater: (prev: WorkoutLog) => WorkoutLog) => {
    setActiveSession((prev) => (prev ? updater(prev) : null));
  }, []);

  const finishSession = useCallback(async (): Promise<WorkoutLog | null> => {
    if (!activeSession) return null;
    const finalLog = await addWorkout({
      userId: activeSession.userId,
      title: activeSession.title,
      date: activeSession.date,
      durationMinutes: Math.max(1, activeSession.durationMinutes || 45),
      totalVolume: activeSession.totalVolume,
      notes: activeSession.notes,
      exercises: activeSession.exercises,
    });
    setActiveSession(null);
    stopRestTimer();
    return finalLog;
  }, [activeSession, addWorkout, stopRestTimer]);

  const cancelSession = useCallback(() => {
    setActiveSession(null);
    stopRestTimer();
  }, [stopRestTimer]);

  return (
    <FitnessContext.Provider
      value={{
        currentUser,
        activeUser,
        isAuthenticated,
        login,
        register,
        logout,
        loginGuest,
        updateUserProfile,
        workouts,
        userWorkouts: workouts,
        addWorkout,
        deleteWorkout,
        routines,
        userRoutines: routines,
        createRoutine,
        deleteRoutine,
        personalRecords,
        activeSession,
        startSession,
        updateActiveSession,
        finishSession,
        cancelSession,
        restTimer: {
          secondsRemaining: timerSecondsRemaining,
          totalSeconds: timerTotalSeconds,
          isRunning: timerIsRunning,
          exerciseName: timerExerciseName,
          start: startRestTimer,
          stop: stopRestTimer,
          addSeconds: addRestTimerSeconds,
        },
        isOnline,
        wasOffline,
        isInstallable,
        promptInstall,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
};

export function useFitness() {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
}
