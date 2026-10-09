export type WeightUnit = 'kg' | 'lbs';

export type SetType = 'regular' | 'warmup' | 'dropset' | 'failure';

export type MuscleGroup = 
  | 'Chest' 
  | 'Back' 
  | 'Legs' 
  | 'Shoulders' 
  | 'Arms' 
  | 'Core' 
  | 'Cardio' 
  | 'Full Body';

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: MuscleGroup;
  equipment: 'Barbell' | 'Dumbbell' | 'Machine' | 'Cable' | 'Bodyweight' | 'Cardio';
  defaultRestSeconds: number;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  targetMuscles?: string[];
  secondaryMuscles?: string[];
  description?: string;
  setupInstructions?: string[];
  executionInstructions?: string[];
  formCues?: string[];
  commonMistakes?: string[];
  videoEmbedUrl?: string;
  videoSourceTitle?: string;
  animationGifUrl?: string;
  loopDurationSeconds?: number;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  type: SetType;
  weight: number;
  reps: number;
  rpe?: number; // 6-10 Rate of Perceived Exertion
  completed: boolean;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  category: MuscleGroup;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  title: string;
  date: string; // ISO date
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  exercises: WorkoutExercise[];
  notes?: string;
  totalVolume: number; // calculated sum of weight * reps
  prsBroken?: string[]; // e.g. ["Bench Press: 100kg (+5kg)"]
}

export interface RoutineTemplate {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  exerciseIds: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatarBg: string;
  bio: string;
  trainingGoal: 'Strength' | 'Hypertrophy' | 'Endurance' | 'Functional' | 'General Fitness';
  weightUnit: WeightUnit;
  bodyWeight: number;
  streakDays: number;
  joinedDate: string;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  repsAtMax: number;
  estimatedOneRepMax: number;
  date: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  isConnected: boolean;
  autoSync: boolean;
  lastSyncedAt?: string;
}

