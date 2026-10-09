import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, X, Plus, Minus, BellSimpleRinging } from '@phosphor-icons/react';
import { useFitness } from '../context/FitnessContext';

export const RestTimerOverlay: React.FC = () => {
  const { restTimer } = useFitness();

  if (!restTimer.isRunning && restTimer.secondsRemaining === 0) {
    return null;
  }

  const minutes = Math.floor(restTimer.secondsRemaining / 60);
  const seconds = restTimer.secondsRemaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const progressPercent = restTimer.totalSeconds > 0
    ? ((restTimer.totalSeconds - restTimer.secondsRemaining) / restTimer.totalSeconds) * 100
    : 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-20 left-0 right-0 z-40 px-4 max-w-md mx-auto pointer-events-none"
      >
        <div className="pointer-events-auto bg-surface-raised border border-volt/30 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-white">
          {/* Progress Ring & Icon */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11">
              <svg className="w-11 h-11 transform -rotate-90">
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-surface-border"
                  fill="transparent"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  className="text-volt transition-all duration-300"
                  fill="transparent"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (113 * progressPercent) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <Timer size={18} weight="fill" className="absolute text-volt" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">Resting</span>
                {restTimer.exerciseName && (
                  <span className="text-xs text-gray-400 truncate max-w-[110px]">· {restTimer.exerciseName}</span>
                )}
              </div>
              <div className="font-mono text-xl font-bold text-volt tracking-tight">
                {formattedTime}
              </div>
            </div>
          </div>

          {/* Quick Adjust Steppers */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => restTimer.addSeconds(-15)}
              className="p-1.5 rounded-lg bg-surface border border-surface-border text-gray-300 hover:text-white active:scale-95 transition-all text-xs font-mono font-medium flex items-center"
              title="-15s"
            >
              <Minus size={14} weight="bold" />
              <span className="text-[10px]">15s</span>
            </button>

            <button
              onClick={() => restTimer.addSeconds(30)}
              className="p-1.5 rounded-lg bg-surface border border-surface-border text-gray-300 hover:text-white active:scale-95 transition-all text-xs font-mono font-medium flex items-center"
              title="+30s"
            >
              <Plus size={14} weight="bold" />
              <span className="text-[10px]">30s</span>
            </button>

            <button
              onClick={restTimer.stop}
              className="p-2 ml-1 rounded-xl bg-surface hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 active:scale-95 transition-all"
              title="Skip / Dismiss"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
