import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  Calculator,
  ChartBar,
  Fire,
  TrendUp,
  Barbell,
  Sparkle
} from '@phosphor-icons/react';
import { useFitness } from '../../context/FitnessContext';
import { calculateOneRepMax } from '../../lib/storage';

export const AnalyticsView: React.FC = () => {
  const { personalRecords, userWorkouts, activeUser } = useFitness();

  if (!activeUser) return null;

  // 1RM Calculator Interactive State
  const [calcWeight, setCalcWeight] = useState<number>(100);
  const [calcReps, setCalcReps] = useState<number>(5);

  const estimated1RM = useMemo(() => {
    return calculateOneRepMax(calcWeight, calcReps);
  }, [calcWeight, calcReps]);

  // Volume distribution by muscle group
  const muscleDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      Chest: 0,
      Back: 0,
      Legs: 0,
      Shoulders: 0,
      Arms: 0,
      Core: 0,
      Cardio: 0,
    };

    userWorkouts.forEach((w) => {
      w.exercises.forEach((ex) => {
        const cat = ex.category;
        const vol = ex.sets.reduce((acc, s) => acc + (s.completed ? s.weight * s.reps : 0), 0);
        if (counts[cat] !== undefined) {
          counts[cat] += vol;
        } else {
          counts['Chest'] += vol;
        }
      });
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts).map(([cat, vol]) => ({
      category: cat,
      volume: vol,
      percentage: Math.round((vol / total) * 100),
    })).sort((a, b) => b.volume - a.volume);
  }, [userWorkouts]);

  // 1RM Percentage Table
  const rmPercentages = [
    { label: '1RM', pct: 100 },
    { label: '2RM', pct: 95 },
    { label: '3RM', pct: 93 },
    { label: '5RM', pct: 87 },
    { label: '8RM', pct: 80 },
    { label: '10RM', pct: 75 },
    { label: '12RM', pct: 70 },
  ];

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto pb-28">
      {/* View Header */}
      <div>
        <h2 className="font-extrabold text-xl text-white tracking-tight">Performance Analytics</h2>
        <p className="text-xs text-gray-400">Strength metrics, 1RM estimates & volume distribution</p>
      </div>

      {/* PR Hall of Fame */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
            <Trophy size={16} weight="fill" className="text-volt" />
            <span>Personal Records ({personalRecords.length})</span>
          </div>
        </div>

        {personalRecords.length === 0 ? (
          <div className="p-6 rounded-2xl bg-surface border border-surface-border text-center text-xs text-gray-400">
            No PRs recorded yet. Complete sets in your workout sessions to unlock records!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {personalRecords.map((pr) => (
              <div
                key={pr.exerciseId}
                className="p-3.5 rounded-2xl bg-surface border border-surface-border hover:border-volt/40 transition-all space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white truncate max-w-[150px]">
                    {pr.exerciseName}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">{pr.date}</span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="font-mono text-2xl font-black text-volt tracking-tight">
                      {pr.maxWeight}
                      <span className="text-xs font-normal text-gray-400 ml-0.5">{activeUser.weightUnit}</span>
                    </div>
                    <div className="text-[10px] uppercase font-mono text-gray-400">
                      {pr.repsAtMax} Rep Max
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-base font-bold text-white">
                      ~{pr.estimatedOneRepMax}
                      <span className="text-[10px] font-normal text-gray-400 ml-0.5">{activeUser.weightUnit}</span>
                    </div>
                    <div className="text-[10px] uppercase font-mono text-volt">
                      Est. 1RM
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive 1RM Calculator */}
      <div className="p-4 rounded-3xl bg-surface border border-surface-border space-y-4 shadow-tactile">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-volt/10 text-volt flex items-center justify-center">
            <Calculator size={18} weight="bold" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Interactive 1RM Calculator</h3>
            <p className="text-[11px] text-gray-400">Epley formula projection</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
              Weight Lifted ({activeUser.weightUnit})
            </label>
            <input
              type="number"
              value={calcWeight}
              onChange={(e) => setCalcWeight(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-surface-raised rounded-xl text-sm font-mono font-bold text-white border border-surface-border focus:outline-none focus:border-volt"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
              Reps Performed
            </label>
            <input
              type="number"
              max={30}
              value={calcReps}
              onChange={(e) => setCalcReps(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-surface-raised rounded-xl text-sm font-mono font-bold text-white border border-surface-border focus:outline-none focus:border-volt"
            />
          </div>
        </div>

        {/* Highlight Result */}
        <div className="p-3 bg-volt/10 border border-volt/30 rounded-2xl flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-300">Estimated 1RM:</span>
          <span className="font-mono text-2xl font-black text-volt">
            {estimated1RM} {activeUser.weightUnit}
          </span>
        </div>

        {/* Percentages Breakdown Grid */}
        <div>
          <div className="text-[10px] font-mono uppercase text-gray-400 mb-1.5">
            Projected Rep Maximums
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {rmPercentages.map((item) => {
              const weightVal = Math.round(((estimated1RM * item.pct) / 100) * 2) / 2;
              return (
                <div
                  key={item.label}
                  className="p-1.5 rounded-xl bg-surface-raised border border-surface-border text-center"
                >
                  <div className="text-[10px] font-mono text-gray-400">{item.label}</div>
                  <div className="font-mono text-xs font-bold text-white mt-0.5">
                    {weightVal}
                  </div>
                  <div className="text-[9px] text-gray-500 font-mono">{item.pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Muscle Group Volume Distribution */}
      <div className="p-4 rounded-3xl bg-surface border border-surface-border space-y-3 shadow-tactile">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChartBar size={18} className="text-volt" />
            <h3 className="font-bold text-sm text-white">Muscle Group Distribution</h3>
          </div>
          <span className="text-[11px] font-mono text-gray-400">All-time volume</span>
        </div>

        <div className="space-y-2 pt-1">
          {muscleDistribution.map((item) => (
            <div key={item.category} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-300 font-medium">{item.category}</span>
                <span className="text-gray-400">
                  {item.volume.toLocaleString()} {activeUser.weightUnit} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-raised overflow-hidden">
                <div
                  className="h-full bg-volt rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, item.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
