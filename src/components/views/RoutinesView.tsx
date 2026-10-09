import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderPlus,
  Play,
  Trash,
  Plus,
  Barbell,
  BookBookmark,
  MagnifyingGlass,
  Trophy,
  X,
  Check,
  VideoCamera,
  Info,
  Sparkle
} from '@phosphor-icons/react';
import { useFitness } from '../../context/FitnessContext';
import { EXERCISE_DATABASE } from '../../lib/exercises';
import { ExercisePickerModal } from '../ExercisePickerModal';
import { ExerciseGuideModal } from '../ExerciseGuideModal';
import { ExerciseDefinition, MuscleGroup } from '../../types';

export const RoutinesView: React.FC = () => {
  const {
    userRoutines,
    createRoutine,
    deleteRoutine,
    startSession,
    personalRecords,
    activeUser
  } = useFitness();

  if (!activeUser) return null;

  const [activeTab, setActiveTab] = useState<'routines' | 'catalog'>('routines');

  // New Routine builder state
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [routineTitle, setRoutineTitle] = useState('');
  const [routineDesc, setRoutineDesc] = useState('');
  const [routineCategory, setRoutineCategory] = useState('Push');
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Catalog search & Guide modal state
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<string>('All');
  const [catalogDifficulty, setCatalogDifficulty] = useState<string>('All');
  const [selectedGuideExercise, setSelectedGuideExercise] = useState<ExerciseDefinition | null>(null);

  const handleOpenBuilder = () => {
    setRoutineTitle('');
    setRoutineDesc('');
    setRoutineCategory('Push');
    setSelectedExerciseIds(['bench-press-barbell', 'incline-dumbbell-press']);
    setIsBuilderOpen(true);
  };

  const handleSaveRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineTitle.trim() || selectedExerciseIds.length === 0) return;
    createRoutine(routineTitle.trim(), routineDesc.trim(), routineCategory, selectedExerciseIds);
    setIsBuilderOpen(false);
  };

  const handleToggleExerciseInBuilder = (exId: string) => {
    setSelectedExerciseIds((prev) =>
      prev.includes(exId) ? prev.filter((id) => id !== exId) : [...prev, exId]
    );
  };

  const handleSelectFromPicker = (ex: ExerciseDefinition) => {
    if (!selectedExerciseIds.includes(ex.id)) {
      setSelectedExerciseIds((prev) => [...prev, ex.id]);
    }
  };

  const filteredCatalog = EXERCISE_DATABASE.filter((ex) => {
    const matchesCat = catalogCategory === 'All' || ex.category === catalogCategory;
    const matchesDiff = catalogDifficulty === 'All' || ex.difficulty === catalogDifficulty;
    const matchesSearch = ex.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (ex.difficulty && ex.difficulty.toLowerCase().includes(catalogSearch.toLowerCase()));
    return matchesCat && matchesDiff && matchesSearch;
  });

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-28">
      {/* Tab Switcher */}
      <div className="flex bg-surface p-1 rounded-2xl border border-surface-border">
        <button
          onClick={() => setActiveTab('routines')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'routines' ? 'bg-volt text-black shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          <BookBookmark size={15} weight="bold" />
          <span>My Routines</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'catalog' ? 'bg-volt text-black shadow-sm' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Barbell size={15} weight="bold" />
          <span>Exercise Library</span>
        </button>
      </div>

      {/* ROUTINES TAB */}
      {activeTab === 'routines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-lg text-white">Workout Templates</h2>
              <p className="text-xs text-gray-400">Save your favorite workout splits</p>
            </div>

            <button
              onClick={handleOpenBuilder}
              className="px-3.5 py-2 rounded-xl bg-volt text-black font-bold text-xs uppercase tracking-wider hover:bg-volt-hover active:scale-95 transition-all shadow-volt-sm flex items-center gap-1.5"
            >
              <Plus size={14} weight="bold" />
              <span>New Routine</span>
            </button>
          </div>

          <div className="space-y-3">
            {userRoutines.length === 0 ? (
              <div className="p-8 rounded-3xl bg-surface border border-surface-border text-center text-gray-400 space-y-2">
                <FolderPlus size={32} className="mx-auto text-gray-600" />
                <p className="text-sm font-medium text-white">No custom routines yet</p>
                <p className="text-xs text-gray-400">
                  Build routine splits (e.g. Upper, Lower, Push, Pull) to start workouts with one tap.
                </p>
              </div>
            ) : (
              userRoutines.map((routine) => (
                <div
                  key={routine.id}
                  className="p-4 rounded-2xl bg-surface border border-surface-border hover:border-gray-600 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">{routine.title}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-raised text-volt">
                          {routine.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{routine.description}</p>
                    </div>

                    <button
                      onClick={() => deleteRoutine(routine.id)}
                      className="text-gray-500 hover:text-rose-400 p-1 transition-colors"
                      title="Delete routine"
                    >
                      <Trash size={15} />
                    </button>
                  </div>

                  {/* Exercise Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {routine.exerciseIds.map((exId) => {
                      const def = EXERCISE_DATABASE.find((e) => e.id === exId);
                      return (
                        <span
                          key={exId}
                          className="px-2.5 py-1 rounded-lg bg-surface-raised border border-surface-border text-[11px] text-gray-300 font-medium"
                        >
                          {def?.name || exId}
                        </span>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => startSession(routine)}
                    className="w-full py-2.5 rounded-xl bg-surface-raised border border-surface-border hover:border-volt hover:text-volt text-xs font-bold uppercase tracking-wider text-gray-300 transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Play size={14} weight="fill" />
                    <span>Launch This Routine</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* EXERCISE CATALOG TAB */}
      {activeTab === 'catalog' && (
        <div className="space-y-3">
          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <MagnifyingGlass
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search exercise library..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface rounded-xl text-xs text-white placeholder-gray-500 border border-surface-border focus:outline-none focus:border-volt"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCatalogCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    catalogCategory === cat
                      ? 'bg-volt text-black font-semibold'
                      : 'bg-surface text-gray-400 hover:text-white border border-surface-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Level / Difficulty Filter Row */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none pt-0.5">
              <span className="text-[10px] font-mono uppercase text-gray-500 mr-0.5 shrink-0">Level:</span>
              {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setCatalogDifficulty(diff)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1 border ${
                    catalogDifficulty === diff
                      ? diff === 'Beginner'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : diff === 'Intermediate'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : diff === 'Advanced'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                        : 'bg-volt text-black border-volt font-black'
                      : 'bg-surface text-gray-400 hover:text-white border-surface-border'
                  }`}
                >
                  {diff !== 'All' && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        diff === 'Beginner'
                          ? 'bg-emerald-400'
                          : diff === 'Intermediate'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />
                  )}
                  <span>{diff === 'All' ? 'All Levels' : diff}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Exercise items list */}
          <div className="space-y-2">
            {filteredCatalog.map((ex) => {
              const pr = personalRecords.find((p) => p.exerciseId === ex.id);

              return (
                <div
                  key={ex.id}
                  onClick={() => setSelectedGuideExercise(ex)}
                  className="p-3.5 rounded-2xl bg-surface border border-surface-border hover:border-gray-500 hover:bg-surface-raised/40 transition-all flex items-center justify-between cursor-pointer group shadow-tactile"
                >
                  <div className="flex-1 pr-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-bold text-sm text-white group-hover:text-volt transition-colors">
                        {ex.name}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-volt bg-volt/10 border border-volt/20 px-2 py-0.5 rounded-full">
                        <Sparkle size={10} weight="fill" />
                        <span>Loop & Guide</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-400">
                      <span className="text-gray-300 font-medium">{ex.category}</span>
                      <span>•</span>
                      <span>{ex.equipment}</span>
                      {ex.difficulty && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${
                            ex.difficulty === 'Beginner'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : ex.difficulty === 'Intermediate'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              ex.difficulty === 'Beginner'
                                ? 'bg-emerald-400'
                                : ex.difficulty === 'Intermediate'
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                            }`}
                          />
                          <span>{ex.difficulty}</span>
                        </span>
                      )}
                    </div>

                    {pr && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-volt font-mono font-semibold">
                        <Trophy size={13} weight="fill" />
                        <span>Best: {pr.maxWeight}{activeUser.weightUnit} × {pr.repsAtMax} reps (1RM: {pr.estimatedOneRepMax}{activeUser.weightUnit})</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGuideExercise(ex);
                      }}
                      className="p-2 rounded-xl bg-surface-raised border border-surface-border text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                      title="View Video & Proper Form Guide"
                    >
                      <Info size={16} weight="bold" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Start single exercise session
                        startSession({
                          id: `single-${ex.id}`,
                          userId: activeUser.id,
                          title: `${ex.name} Focus`,
                          description: `Single exercise workout`,
                          category: ex.category,
                          exerciseIds: [ex.id],
                        });
                      }}
                      className="p-2 rounded-xl bg-volt/10 hover:bg-volt border border-volt/30 hover:border-volt text-volt hover:text-black transition-all active:scale-95"
                      title="Train this exercise now"
                    >
                      <Play size={15} weight="fill" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Routine Builder Modal */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="w-full max-w-md bg-surface border-t sm:border border-surface-border sm:rounded-3xl rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-surface-border flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Create New Routine</h3>
              <button
                onClick={() => setIsBuilderOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSaveRoutine} className="p-4 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                  Routine Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Upper Power & Shoulders"
                  value={routineTitle}
                  onChange={(e) => setRoutineTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-raised rounded-xl text-sm text-white placeholder-gray-500 border border-surface-border focus:outline-none focus:border-volt"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                  Category / Split
                </label>
                <input
                  type="text"
                  placeholder="e.g. Push, Pull, Legs, Arms, Full Body"
                  value={routineCategory}
                  onChange={(e) => setRoutineCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-raised rounded-xl text-sm text-white placeholder-gray-500 border border-surface-border focus:outline-none focus:border-volt"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Short notes about target intensity, tempo, etc."
                  value={routineDesc}
                  onChange={(e) => setRoutineDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-raised rounded-xl text-sm text-white placeholder-gray-500 border border-surface-border focus:outline-none focus:border-volt"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Exercises ({selectedExerciseIds.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen(true)}
                    className="text-xs text-volt font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Plus size={14} weight="bold" />
                    <span>Add Exercise</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {selectedExerciseIds.map((exId) => {
                    const def = EXERCISE_DATABASE.find((e) => e.id === exId);
                    return (
                      <div
                        key={exId}
                        className="p-2.5 rounded-xl bg-surface-raised border border-surface-border flex items-center justify-between text-xs"
                      >
                        <span className="text-white font-medium">{def?.name || exId}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleExerciseInBuilder(exId)}
                          className="text-gray-400 hover:text-rose-400 p-1"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-raised border border-surface-border text-gray-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedExerciseIds.length === 0}
                  className="flex-1 py-2.5 rounded-xl bg-volt text-black font-bold text-xs uppercase tracking-wider hover:bg-volt-hover active:scale-95 transition-all shadow-volt-sm disabled:opacity-50"
                >
                  Save Routine
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Exercise Picker Modal for Routine Builder */}
      <ExercisePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectFromPicker}
        selectedIds={selectedExerciseIds}
      />

      {/* Movement & Video Demonstration Guide Modal */}
      <ExerciseGuideModal
        exercise={selectedGuideExercise}
        isOpen={!!selectedGuideExercise}
        onClose={() => setSelectedGuideExercise(null)}
        onStartExercise={(exercise) => {
          startSession({
            id: `single-${exercise.id}`,
            userId: activeUser.id,
            title: `${exercise.name} Focus`,
            description: `Single exercise workout`,
            category: exercise.category,
            exerciseIds: [exercise.id],
          });
        }}
      />
    </div>
  );
};
