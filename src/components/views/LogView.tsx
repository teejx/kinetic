import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Plus,
  Fire,
  Lightning,
  Barbell,
  Clock,
  ArrowRight,
  Sparkle,
  BookmarkSimple
} from '@phosphor-icons/react';
import { useFitness } from '../../context/FitnessContext';
import { ActiveWorkoutSession } from '../ActiveWorkoutSession';
import { RoutineTemplate } from '../../types';

interface LogViewProps {
  onNavigateToRoutines: () => void;
}

export const LogView: React.FC<LogViewProps> = ({ onNavigateToRoutines }) => {
  const {
    activeSession,
    startSession,
    activeUser,
    userRoutines,
    userWorkouts,
  } = useFitness();

  if (activeSession) {
    return <ActiveWorkoutSession />;
  }

  if (!activeUser) {
    return null;
  }

  const lastWorkout = userWorkouts[0];

  const athleteName = activeUser.name.includes('@')
    ? activeUser.name.split('@')[0]
    : activeUser.name;

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto pb-28">
      {/* Athlete Welcome & Streak Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-surface-border bg-gradient-to-br from-surface-raised via-surface to-background p-5 shadow-tactile">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-volt/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-black text-sm uppercase ring-2 ring-volt/40 shadow-sm ${
                activeUser.avatarBg || 'bg-volt'
              }`}
            >
              {athleteName.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-white leading-tight">
                  {athleteName}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-volt/10 border border-volt/20 text-volt">
                  {activeUser.trainingGoal}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                {activeUser.bodyWeight} {activeUser.weightUnit} · {activeUser.handle}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Fire size={18} weight="fill" className="animate-pulse" />
              <span className="font-mono font-bold text-sm">{activeUser.streakDays}d</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 mt-1 font-mono">
              Streak
            </span>
          </div>
        </div>
      </div>

      {/* Start Workout Primary Call to Action */}
      <div className="space-y-3">
        <button
          onClick={() => startSession()}
          className="w-full py-4 px-5 rounded-2xl bg-volt text-black font-extrabold text-sm uppercase tracking-wider hover:bg-volt-hover active:scale-98 transition-all shadow-volt-sm flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black text-volt flex items-center justify-center">
              <Play size={18} weight="fill" />
            </div>
            <div className="text-left">
              <div className="text-sm font-extrabold leading-none">Start Empty Workout</div>
              <div className="text-[11px] text-black/75 font-medium mt-1">Log exercises as you train</div>
            </div>
          </div>
          <ArrowRight size={18} weight="bold" className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Quick Routine Launch Carousel */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">
            Saved Routines ({userRoutines.length})
          </h3>
          <button
            onClick={onNavigateToRoutines}
            className="text-xs text-volt hover:underline font-medium"
          >
            Manage
          </button>
        </div>

        {userRoutines.length === 0 ? (
          <div className="p-4 rounded-2xl bg-surface border border-surface-border text-center text-xs text-gray-400">
            No saved routines for {activeUser.name}. Create one in Routines tab.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {userRoutines.map((routine) => (
              <div
                key={routine.id}
                className="p-3.5 rounded-2xl bg-surface border border-surface-border hover:border-gray-600 transition-all flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{routine.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-raised text-gray-300">
                      {routine.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1 max-w-[240px]">
                    {routine.description}
                  </p>
                  <div className="text-[11px] font-mono text-gray-500">
                    {routine.exerciseIds.length} exercises
                  </div>
                </div>

                <button
                  onClick={() => startSession(routine)}
                  className="px-3 py-2 rounded-xl bg-surface-raised border border-surface-border text-gray-300 group-hover:text-black group-hover:bg-volt group-hover:border-volt text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Play size={12} weight="fill" />
                  <span>Start</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Last Logged Workout Card */}
      {lastWorkout && (
        <div className="space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">
            Recent Session
          </h3>
          <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">{lastWorkout.title}</h4>
                <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                  {new Date(lastWorkout.date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })} · {lastWorkout.durationMinutes} min
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-bold text-volt">
                  {lastWorkout.totalVolume.toLocaleString()} {activeUser.weightUnit}
                </div>
                <div className="text-[10px] uppercase font-mono text-gray-500">Total Volume</div>
              </div>
            </div>

            {lastWorkout.notes && (
              <p className="text-xs text-gray-400 italic bg-surface-raised/40 p-2.5 rounded-xl border border-surface-border/40">
                "{lastWorkout.notes}"
              </p>
            )}

            <button
              onClick={() => {
                // Repeat this workout
                const templateRoutine: RoutineTemplate = {
                  id: `repeat-${lastWorkout.id}`,
                  userId: activeUser.id,
                  title: `${lastWorkout.title} (Repeat)`,
                  description: 'Repeating previous workout',
                  category: 'Repeat',
                  exerciseIds: lastWorkout.exercises.map((e) => e.exerciseId),
                };
                startSession(templateRoutine);
              }}
              className="w-full py-2.5 rounded-xl bg-surface-raised border border-surface-border text-gray-300 hover:text-white hover:border-gray-500 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <BookmarkSimple size={16} />
              <span>Repeat This Workout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
