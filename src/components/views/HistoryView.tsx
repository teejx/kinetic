import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarBlank,
  Barbell,
  Clock,
  Trophy,
  Trash,
  CaretDown,
  CaretUp,
  MagnifyingGlass,
  ArrowCounterClockwise
} from '@phosphor-icons/react';
import { useFitness } from '../../context/FitnessContext';
import { WorkoutLog, RoutineTemplate } from '../../types';

export const HistoryView: React.FC = () => {
  const { userWorkouts, deleteWorkout, startSession, activeUser } = useFitness();
  const [search, setSearch] = useState('');
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  if (!activeUser) return null;

  const filteredWorkouts = useMemo(() => {
    return userWorkouts.filter((w) => {
      const titleMatch = w.title.toLowerCase().includes(search.toLowerCase());
      const notesMatch = (w.notes || '').toLowerCase().includes(search.toLowerCase());
      const exerciseMatch = w.exercises.some((e) =>
        e.exerciseName.toLowerCase().includes(search.toLowerCase())
      );
      return titleMatch || notesMatch || exerciseMatch;
    });
  }, [userWorkouts, search]);

  const totalVolumeAll = userWorkouts.reduce((acc, w) => acc + w.totalVolume, 0);
  const totalHours = Math.round(
    (userWorkouts.reduce((acc, w) => acc + w.durationMinutes, 0) / 60) * 10
  ) / 10;

  const toggleExpand = (id: string) => {
    setExpandedWorkoutId((prev) => (prev === id ? null : id));
  };

  const handleRepeat = (w: WorkoutLog) => {
    const template: RoutineTemplate = {
      id: `rep-${w.id}`,
      userId: activeUser.id,
      title: `${w.title} (Repeat)`,
      description: 'Repeat of previous session',
      category: 'History',
      exerciseIds: w.exercises.map((e) => e.exerciseId),
    };
    startSession(template);
  };

  const athleteName = activeUser.name.includes('@')
    ? activeUser.name.split('@')[0]
    : activeUser.name;

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-28">
      {/* Header & Stats Strip */}
      <div className="space-y-3">
        <div>
          <h2 className="font-extrabold text-xl text-white tracking-tight">Workout Logbook</h2>
          <p className="text-xs text-gray-400">History and progress for {athleteName}</p>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-2xl bg-surface border border-surface-border text-center">
            <div className="font-mono text-base font-extrabold text-white">
              {userWorkouts.length}
            </div>
            <div className="text-[10px] uppercase font-mono text-gray-400 mt-0.5">Sessions</div>
          </div>

          <div className="p-3 rounded-2xl bg-surface border border-surface-border text-center">
            <div className="font-mono text-base font-extrabold text-volt">
              {(totalVolumeAll / 1000).toFixed(1)}k
            </div>
            <div className="text-[10px] uppercase font-mono text-gray-400 mt-0.5">
              {activeUser.weightUnit} Tonnage
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-surface border border-surface-border text-center">
            <div className="font-mono text-base font-extrabold text-white">
              {totalHours}h
            </div>
            <div className="text-[10px] uppercase font-mono text-gray-400 mt-0.5">Gym Time</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlass
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search workouts or exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface rounded-xl text-xs text-white placeholder-gray-500 border border-surface-border focus:outline-none focus:border-volt"
          />
        </div>
      </div>

      {/* Workout Logs List */}
      <div className="space-y-3">
        {filteredWorkouts.length === 0 ? (
          <div className="p-8 rounded-3xl bg-surface border border-surface-border text-center text-gray-400 space-y-2">
            <Barbell size={32} className="mx-auto text-gray-600" />
            <p className="text-sm font-medium text-white">No workouts found</p>
            <p className="text-xs text-gray-400">
              Start your first session from the Log tab to see your exercise diary here.
            </p>
          </div>
        ) : (
          filteredWorkouts.map((workout) => {
            const isExpanded = expandedWorkoutId === workout.id;
            const workoutDate = new Date(workout.date);
            const dateStr = workoutDate.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            const timeStr = workoutDate.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <motion.div
                key={workout.id}
                layout
                className="rounded-2xl bg-surface border border-surface-border overflow-hidden transition-all shadow-sm"
              >
                {/* Clickable Header */}
                <div
                  onClick={() => toggleExpand(workout.id)}
                  className="p-4 cursor-pointer hover:bg-surface-raised/40 transition-colors flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{workout.title}</h3>
                      {workout.prsBroken && workout.prsBroken.length > 0 && (
                        <span className="p-1 rounded-md bg-volt/10 text-volt text-[10px] font-mono flex items-center gap-1 font-semibold">
                          <Trophy size={11} weight="fill" />
                          <span>PR</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                      <span className="flex items-center gap-1 text-gray-300">
                        <CalendarBlank size={12} />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {workout.durationMinutes}m
                      </span>
                      <span>•</span>
                      <span className="text-volt font-semibold">
                        {workout.totalVolume.toLocaleString()} {activeUser.weightUnit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">
                      {isExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-surface-border p-4 bg-surface-raised/30 space-y-4"
                    >
                      {/* PR badges */}
                      {workout.prsBroken && workout.prsBroken.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-volt/10 border border-volt/30 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-volt">
                            <Trophy size={14} weight="fill" />
                            <span>Personal Records Achieved</span>
                          </div>
                          {workout.prsBroken.map((prText, idx) => (
                            <div key={idx} className="text-xs text-gray-200 font-mono pl-5">
                              • {prText}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      {workout.notes && (
                        <div className="text-xs text-gray-300 italic bg-surface p-2.5 rounded-xl border border-surface-border">
                          "{workout.notes}"
                        </div>
                      )}

                      {/* Exercises List */}
                      <div className="space-y-3">
                        {workout.exercises.map((ex, exIdx) => (
                          <div
                            key={ex.id || exIdx}
                            className="bg-surface p-3 rounded-xl border border-surface-border/60 space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-white">{ex.exerciseName}</span>
                              <span className="text-[10px] font-mono uppercase text-gray-400 bg-surface-raised px-2 py-0.5 rounded">
                                {ex.category}
                              </span>
                            </div>

                            {/* Sets pill summary */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                              {ex.sets.map((s, sIdx) => (
                                <div
                                  key={s.id || sIdx}
                                  className="px-2 py-1 rounded bg-surface-raised border border-surface-border text-[11px] font-mono flex items-center justify-between"
                                >
                                  <span className="text-gray-400 font-medium">#{s.setNumber}</span>
                                  <span className="font-bold text-white">
                                    {s.weight}{activeUser.weightUnit} × {s.reps}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-surface-border/40">
                        <button
                          onClick={() => deleteWorkout(workout.id)}
                          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                        >
                          <Trash size={14} />
                          <span>Delete log</span>
                        </button>

                        <button
                          onClick={() => handleRepeat(workout)}
                          className="px-3 py-1.5 rounded-xl bg-volt text-black text-xs font-bold uppercase tracking-wider hover:bg-volt-hover active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <ArrowCounterClockwise size={14} weight="bold" />
                          <span>Repeat Session</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
