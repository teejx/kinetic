import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MagnifyingGlass, X, Plus, Barbell, Check } from '@phosphor-icons/react';
import { EXERCISE_DATABASE } from '../lib/exercises';
import { ExerciseDefinition, MuscleGroup } from '../types';

interface ExercisePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: ExerciseDefinition) => void;
  selectedIds?: string[];
}

const CATEGORIES: (MuscleGroup | 'All')[] = [
  'All',
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
];

export const ExercisePickerModal: React.FC<ExercisePickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedIds = [],
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MuscleGroup | 'All'>('All');

  const filteredExercises = useMemo(() => {
    return EXERCISE_DATABASE.filter((ex) => {
      const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
      const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.equipment.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="w-full max-w-lg bg-surface border-t sm:border border-surface-border sm:rounded-3xl rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-volt/10 text-volt flex items-center justify-center">
                <Barbell size={18} weight="bold" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Select Exercise</h3>
                <p className="text-xs text-gray-400">Choose from catalog or search</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white bg-surface-raised hover:bg-surface-border transition-colors"
            >
              <X size={18} weight="bold" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-surface-border/60">
            <div className="relative">
              <MagnifyingGlass
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search exercise or equipment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-raised rounded-xl text-sm text-white placeholder-gray-500 border border-surface-border focus:outline-none focus:border-volt transition-colors"
                autoFocus
              />
            </div>

            {/* Muscle Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-volt text-black font-semibold shadow-sm'
                      : 'bg-surface-raised text-gray-400 hover:text-white border border-surface-border/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-surface-border/30">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">No exercises found matching "{search}"</p>
                <p className="text-xs text-gray-400 mt-1">Try another keyword or category.</p>
              </div>
            ) : (
              filteredExercises.map((ex) => {
                const isAlreadySelected = selectedIds.includes(ex.id);
                return (
                  <button
                    key={ex.id}
                    onClick={() => {
                      onSelect(ex);
                      onClose();
                    }}
                    className="w-full pt-2 first:pt-0 pb-2 px-3 rounded-xl flex items-center justify-between hover:bg-surface-raised transition-colors text-left group"
                  >
                    <div>
                      <div className="font-medium text-sm text-white group-hover:text-volt transition-colors">
                        {ex.name}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-gray-400">
                        <span className="text-gray-300 font-medium">{ex.category}</span>
                        <span>•</span>
                        <span>{ex.equipment}</span>
                        {ex.difficulty && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${
                              ex.difficulty === 'Beginner'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : ex.difficulty === 'Intermediate'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            <span
                              className={`w-1 h-1 rounded-full ${
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
                        <span>•</span>
                        <span>Rest {ex.defaultRestSeconds}s</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {isAlreadySelected ? (
                        <div className="w-8 h-8 rounded-xl bg-volt/20 text-volt flex items-center justify-center">
                          <Check size={16} weight="bold" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-surface-raised border border-surface-border text-gray-400 group-hover:text-volt group-hover:border-volt flex items-center justify-center transition-all">
                          <Plus size={16} weight="bold" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
