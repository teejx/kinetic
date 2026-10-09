import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Plus,
  Trash,
  Clock,
  Barbell,
  Trophy,
  X,
  CaretUp,
  CaretDown,
  DotsThreeVertical,
  Timer
} from '@phosphor-icons/react';
import { useFitness } from '../context/FitnessContext';
import { WorkoutExercise, WorkoutSet, SetType } from '../types';
import { ExercisePickerModal } from './ExercisePickerModal';
import { calculateOneRepMax } from '../lib/storage';

export const ActiveWorkoutSession: React.FC = () => {
  const {
    activeSession,
    updateActiveSession,
    finishSession,
    cancelSession,
    restTimer,
    personalRecords,
    activeUser
  } = useFitness();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [isFinishConfirmOpen, setIsFinishConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Elapsed timer ticker
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  if (!activeSession || !activeUser) return null;

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timerDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  // Live total volume
  const liveTotalVolume = activeSession.exercises.reduce((acc, ex) => {
    return (
      acc +
      ex.sets.reduce((setAcc, s) => {
        return setAcc + (s.completed ? s.weight * s.reps : 0);
      }, 0)
    );
  }, 0);

  // Set updates
  const handleToggleSetComplete = (exerciseIdx: number, setIdx: number) => {
    updateActiveSession((prev) => {
      const updatedExercises = [...prev.exercises];
      const targetEx = { ...updatedExercises[exerciseIdx] };
      const updatedSets = [...targetEx.sets];
      const targetSet = { ...updatedSets[setIdx] };

      const willComplete = !targetSet.completed;
      targetSet.completed = willComplete;
      updatedSets[setIdx] = targetSet;
      targetEx.sets = updatedSets;
      updatedExercises[exerciseIdx] = targetEx;

      // If user checked off set, auto-start rest timer!
      if (willComplete) {
        restTimer.start(90, targetEx.exerciseName);
      }

      return {
        ...prev,
        exercises: updatedExercises,
        totalVolume: liveTotalVolume,
      };
    });
  };

  const handleUpdateSetWeight = (exerciseIdx: number, setIdx: number, delta: number) => {
    updateActiveSession((prev) => {
      const updatedExercises = [...prev.exercises];
      const targetEx = { ...updatedExercises[exerciseIdx] };
      const updatedSets = [...targetEx.sets];
      const targetSet = { ...updatedSets[setIdx] };

      targetSet.weight = Math.max(0, Math.round((targetSet.weight + delta) * 2) / 2);
      updatedSets[setIdx] = targetSet;
      targetEx.sets = updatedSets;
      updatedExercises[exerciseIdx] = targetEx;

      return { ...prev, exercises: updatedExercises };
    });
  };

  const handleDirectSetWeight = (exerciseIdx: number, setIdx: number, val: number) => {
    updateActiveSession((prev) => {
      const updatedExercises = [...prev.exercises];
      const targetEx = { ...updatedExercises[exerciseIdx] };
      const updatedSets = [...targetEx.sets];
      updatedSets[setIdx] = { ...updatedSets[setIdx], weight: Math.max(0, val) };
      targetEx.sets = updatedSets;
      updatedExercises[exerciseIdx] = targetEx;
      return { ...prev, exercises: updatedExercises };
    });
  };

  const handleUpdateSetReps = (exerciseIdx: number, setIdx: number, delta: number) => {
    updateActiveSession((prev) => {
      const updatedExercises = [...prev.exercises];
      const targetEx = { ...updatedExercises[exerciseIdx] };
      const updatedSets = [...targetEx.sets];
      const targetSet = { ...updatedSets[setIdx] };

      targetSet.reps = Math.max(0, targetSet.reps + delta);
      updatedSets[setIdx] = targetSet;
      targetEx.sets = updatedSets;
      updatedExercises[exerciseIdx] = targetEx;

      return { ...prev, exercises: updatedExercises };
    });
  };

  const handleCycleSetType = (exerciseIdx: number, setIdx: number) => {
    const types: SetType[] = ['regular', 'warmup', 'dropset', 'failure'];
    updateActiveSession((prev) => {
      const updatedExercises = [...prev.exercises];
      const targetEx = { ...updatedExercises[exerciseIdx] };
      const updatedSets = [...targetEx.sets];
      const currentType = updatedSets[setIdx].type;
      const nextType = types[(types.indexOf(currentType) + 1) % types.length];

      updatedSets[setIdx] = { ...updatedSets[setIdx], type: nextType };
      targetEx.sets = updatedSets;
      updatedExercises[exerciseIdx] = targetEx;
      return { ...prev, exercises: updatedExercises };
    });
  };

  const handleAddSet = (exerciseIdx: number) => {
    updateActiveSession((prev) => {
      const updatedExercises = [...prev.exercises];
      const targetEx = { ...updatedExercises[exerciseIdx] };
      const lastSet = targetEx.sets[targetEx.sets.length - 1];

      const newSet: WorkoutSet = {
        id: `s-${Date.now()}`,
        setNumber: targetEx.sets.length + 1,
        type: 'regular',
        weight: lastSet ? lastSet.weight : 40,
        reps: lastSet ? lastSet.reps : 8,
        completed: false,
      };

      targetEx.sets = [...targetEx.sets, newSet];
      updatedExercises[exerciseIdx] = targetEx;
      return { ...prev, exercises: updatedExercises };
    });
  };

  const handleRemoveSet = (exerciseIdx: number, setIdx: number) => {
    updateActiveSession((prev) => {
      const updatedExercises = [...prev.exercises];
      const targetEx = { ...updatedExercises[exerciseIdx] };
      targetEx.sets = targetEx.sets.filter((_, idx) => idx !== setIdx);
      // Renumber
      targetEx.sets = targetEx.sets.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      updatedExercises[exerciseIdx] = targetEx;
      return { ...prev, exercises: updatedExercises };
    });
  };

  const handleRemoveExercise = (exerciseIdx: number) => {
    updateActiveSession((prev) => {
      const updatedExercises = prev.exercises.filter((_, idx) => idx !== exerciseIdx);
      return { ...prev, exercises: updatedExercises };
    });
  };

  const handleAddExerciseFromPicker = (exerciseDef: any) => {
    const newEx: WorkoutExercise = {
      id: `we-${Date.now()}`,
      exerciseId: exerciseDef.id,
      exerciseName: exerciseDef.name,
      category: exerciseDef.category,
      sets: [
        { id: `s-1-${Date.now()}`, setNumber: 1, type: 'warmup', weight: 20, reps: 10, completed: false },
        { id: `s-2-${Date.now()}`, setNumber: 2, type: 'regular', weight: 50, reps: 8, completed: false },
        { id: `s-3-${Date.now()}`, setNumber: 3, type: 'regular', weight: 50, reps: 8, completed: false },
      ],
    };

    updateActiveSession((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newEx],
    }));
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    updateActiveSession((prev) => ({
      ...prev,
      durationMinutes: Math.max(1, Math.floor(elapsedSeconds / 60)),
    }));
    await finishSession();
    setIsSubmitting(false);
    setIsFinishConfirmOpen(false);
  };

  return (
    <div className="pb-28">
      {/* Sticky Tactical Header */}
      <div className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-surface-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-volt/10 border border-volt/20 text-volt">
            <span className="w-2 h-2 rounded-full bg-volt animate-ping" />
            <span className="font-mono text-xs font-bold tracking-wider">{timerDisplay}</span>
          </div>

          <div>
            <input
              type="text"
              value={activeSession.title}
              onChange={(e) =>
                updateActiveSession((prev) => ({ ...prev, title: e.target.value }))
              }
              className="bg-transparent font-bold text-sm text-white focus:outline-none focus:text-volt max-w-[150px] sm:max-w-[200px] truncate"
            />
            <div className="text-[11px] font-mono text-gray-400">
              Vol: <span className="text-white font-semibold">{liveTotalVolume.toLocaleString()}</span> {activeUser.weightUnit}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => cancelSession()}
            className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Discard Session"
          >
            <X size={18} weight="bold" />
          </button>
          <button
            onClick={() => setIsFinishConfirmOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-volt text-black font-bold text-xs uppercase tracking-wider hover:bg-volt-hover active:scale-95 transition-all shadow-volt-sm flex items-center gap-1.5"
          >
            <Check size={14} weight="bold" />
            <span>Finish</span>
          </button>
        </div>
      </div>

      {/* Main Exercises Stack */}
      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {activeSession.exercises.map((exercise, exIdx) => {
          const userPR = personalRecords.find((p) => p.exerciseId === exercise.exerciseId);

          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface rounded-2xl border border-surface-border overflow-hidden shadow-tactile"
            >
              {/* Exercise Header */}
              <div className="p-3.5 bg-surface-raised/60 border-b border-surface-border flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white">{exercise.exerciseName}</h4>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-surface-border text-gray-300">
                      {exercise.category}
                    </span>
                  </div>
                  {userPR && (
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-volt/90 font-mono">
                      <Trophy size={12} weight="fill" />
                      <span>PR: {userPR.maxWeight}{activeUser.weightUnit} × {userPR.repsAtMax} (1RM: {userPR.estimatedOneRepMax}{activeUser.weightUnit})</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => restTimer.start(90, exercise.exerciseName)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-volt hover:bg-surface transition-colors"
                    title="Start 90s Timer"
                  >
                    <Timer size={16} weight="bold" />
                  </button>
                  <button
                    onClick={() => handleRemoveExercise(exIdx)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-surface transition-colors"
                    title="Remove Exercise"
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </div>
              </div>

              {/* Set Table */}
              <div className="p-3">
                <div className="grid grid-cols-12 gap-1.5 pb-2 text-[10px] font-mono uppercase tracking-wider text-gray-400 px-1 border-b border-surface-border/40">
                  <div className="col-span-2 text-center">Set</div>
                  <div className="col-span-5 text-center">{activeUser.weightUnit.toUpperCase()}</div>
                  <div className="col-span-3 text-center">Reps</div>
                  <div className="col-span-2 text-center">Done</div>
                </div>

                <div className="space-y-2 mt-2">
                  {exercise.sets.map((set, setIdx) => {
                    const badgeLabel =
                      set.type === 'warmup'
                        ? 'W'
                        : set.type === 'dropset'
                        ? 'D'
                        : set.type === 'failure'
                        ? 'F'
                        : set.setNumber;

                    const badgeColor =
                      set.type === 'warmup'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : set.type === 'dropset'
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : set.type === 'failure'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : 'bg-surface-border text-gray-300 border-surface-border';

                    return (
                      <div
                        key={set.id}
                        className={`grid grid-cols-12 gap-1.5 items-center p-1.5 rounded-xl transition-all ${
                          set.completed
                            ? 'bg-volt/5 border border-volt/20'
                            : 'bg-surface-raised/40 border border-transparent'
                        }`}
                      >
                        {/* Set Type / Number Button */}
                        <div className="col-span-2 flex justify-center">
                          <button
                            onClick={() => handleCycleSetType(exIdx, setIdx)}
                            className={`w-7 h-7 rounded-lg border font-mono text-xs font-bold flex items-center justify-center transition-all ${badgeColor}`}
                            title="Tap to change type (Warmup, Drop, Failure, Regular)"
                          >
                            {badgeLabel}
                          </button>
                        </div>

                        {/* Weight with Steppers */}
                        <div className="col-span-5 flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleUpdateSetWeight(exIdx, setIdx, -2.5)}
                            className="w-6 h-7 rounded bg-surface border border-surface-border text-gray-300 hover:text-white flex items-center justify-center text-xs active:scale-95"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            step="0.5"
                            value={set.weight || ''}
                            onChange={(e) =>
                              handleDirectSetWeight(exIdx, setIdx, parseFloat(e.target.value) || 0)
                            }
                            className="w-14 h-7 text-center font-mono font-bold text-sm bg-surface rounded border border-surface-border text-white focus:outline-none focus:border-volt"
                          />
                          <button
                            onClick={() => handleUpdateSetWeight(exIdx, setIdx, 2.5)}
                            className="w-6 h-7 rounded bg-surface border border-surface-border text-gray-300 hover:text-white flex items-center justify-center text-xs active:scale-95"
                          >
                            +
                          </button>
                        </div>

                        {/* Reps with Steppers */}
                        <div className="col-span-3 flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleUpdateSetReps(exIdx, setIdx, -1)}
                            className="w-5 h-7 rounded bg-surface border border-surface-border text-gray-300 hover:text-white flex items-center justify-center text-xs active:scale-95"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-mono font-bold text-sm text-white">
                            {set.reps}
                          </span>
                          <button
                            onClick={() => handleUpdateSetReps(exIdx, setIdx, 1)}
                            className="w-5 h-7 rounded bg-surface border border-surface-border text-gray-300 hover:text-white flex items-center justify-center text-xs active:scale-95"
                          >
                            +
                          </button>
                        </div>

                        {/* Tactile Completion Checkmark */}
                        <div className="col-span-2 flex justify-center">
                          <button
                            onClick={() => handleToggleSetComplete(exIdx, setIdx)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                              set.completed
                                ? 'bg-volt text-black shadow-volt-sm font-bold'
                                : 'bg-surface border border-surface-border text-gray-400 hover:border-gray-500'
                            }`}
                          >
                            <Check size={16} weight="bold" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Set Button */}
                <div className="mt-3 pt-2 border-t border-surface-border/40 flex items-center justify-between">
                  <button
                    onClick={() => handleAddSet(exIdx)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-raised border border-surface-border text-gray-300 hover:text-white text-xs font-medium hover:border-surface-subtle transition-all"
                  >
                    <Plus size={14} weight="bold" />
                    <span>Add Set</span>
                  </button>

                  <input
                    type="text"
                    placeholder="Set notes (e.g. paused, RPE 9)..."
                    value={exercise.notes || ''}
                    onChange={(e) => {
                      const notesVal = e.target.value;
                      updateActiveSession((prev) => {
                        const updated = [...prev.exercises];
                        updated[exIdx] = { ...updated[exIdx], notes: notesVal };
                        return { ...prev, exercises: updated };
                      });
                    }}
                    className="bg-transparent text-xs text-gray-400 placeholder-gray-600 focus:outline-none focus:text-gray-200 text-right max-w-[180px] truncate"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Add Exercise Floating Action */}
        <button
          onClick={() => setIsExercisePickerOpen(true)}
          className="w-full py-3.5 rounded-2xl bg-surface-raised border-2 border-dashed border-surface-border text-gray-300 hover:text-volt hover:border-volt/50 font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <Plus size={18} weight="bold" />
          <span>Add Exercise</span>
        </button>
      </div>

      {/* Exercise Picker Modal */}
      <ExercisePickerModal
        isOpen={isExercisePickerOpen}
        onClose={() => setIsExercisePickerOpen(false)}
        onSelect={handleAddExerciseFromPicker}
        selectedIds={activeSession.exercises.map((e) => e.exerciseId)}
      />

      {/* Finish Session Confirmation Modal */}
      {isFinishConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-surface border border-surface-border rounded-3xl p-5 shadow-2xl text-white"
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-volt/10 text-volt mx-auto flex items-center justify-center">
                <Trophy size={24} weight="fill" />
              </div>
              <h3 className="font-bold text-lg">Finish Workout?</h3>
              <p className="text-xs text-gray-400">
                You trained for <span className="text-white font-semibold">{timerDisplay}</span> with a total volume of <span className="text-volt font-semibold">{liveTotalVolume.toLocaleString()} {activeUser.weightUnit}</span>.
              </p>
            </div>

            <div className="my-4 p-3 bg-surface-raised rounded-2xl border border-surface-border/60 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-gray-400">
                <span>Exercises:</span>
                <span className="text-white font-semibold">{activeSession.exercises.length}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Sets Completed:</span>
                <span className="text-white font-semibold">
                  {activeSession.exercises.reduce(
                    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
                    0
                  )}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsFinishConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-gray-300 font-semibold text-xs hover:bg-surface-border transition-colors"
              >
                Keep Going
              </button>
              <button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-volt text-black font-bold text-xs uppercase tracking-wider hover:bg-volt-hover active:scale-95 transition-all shadow-volt-sm flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Saving...' : 'Save & Log'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
