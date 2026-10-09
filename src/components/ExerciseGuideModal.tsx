import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  ArrowSquareOut,
  CheckCircle,
  WarningCircle,
  Barbell,
  Timer,
  Lightning,
  Sparkle,
  BookOpen,
  ArrowsClockwise,
  FilmStrip
} from '@phosphor-icons/react';
import { ExerciseDefinition } from '../types';

interface ExerciseGuideModalProps {
  exercise: ExerciseDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onStartExercise?: (exercise: ExerciseDefinition) => void;
}

export const ExerciseGuideModal: React.FC<ExerciseGuideModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onStartExercise,
}) => {
  const [activeTab, setActiveTab] = useState<'technique' | 'cues' | 'mistakes'>('technique');
  const [mediaMode, setMediaMode] = useState<'loop' | 'video'>('loop');
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isGifLoaded, setIsGifLoaded] = useState(false);

  if (!isOpen || !exercise) return null;

  // Extract clean video ID if available for silent looping
  const videoIdMatch = exercise.videoEmbedUrl?.match(/embed\/([^?]+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : '';

  // Autolooping, silent micro-embed (under 1 minute)
  const silentLoopEmbedUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&modestbranding=1`
    : exercise.videoEmbedUrl;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md">
        {/* Backdrop click to close */}
        <div
          className="absolute inset-0"
          onClick={onClose}
          aria-label="Close exercise guide"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          className="relative z-10 w-full max-w-lg bg-surface border-t sm:border border-surface-border rounded-t-[2.5rem] sm:rounded-[2.5rem] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-surface-border flex items-start justify-between bg-surface-raised/30 shrink-0">
            <div className="space-y-1.5 pr-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-volt/10 text-volt border border-volt/20 uppercase font-semibold">
                  {exercise.category}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-raised text-gray-300 border border-surface-border">
                  {exercise.equipment}
                </span>

                {/* Color-Coded Level Pill */}
                {exercise.difficulty && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1 ${
                      exercise.difficulty === 'Beginner'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : exercise.difficulty === 'Intermediate'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        exercise.difficulty === 'Beginner'
                          ? 'bg-emerald-400'
                          : exercise.difficulty === 'Intermediate'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />
                    <span>{exercise.difficulty}</span>
                  </span>
                )}

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-raised text-gray-400 border border-surface-border flex items-center gap-1">
                  <Timer size={11} />
                  {exercise.defaultRestSeconds}s Rest
                </span>
              </div>

              <h2 className="font-extrabold text-lg sm:text-xl text-white tracking-tight leading-tight">
                {exercise.name}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-surface-raised transition-colors shrink-0"
              title="Close Guide"
            >
              <X size={18} weight="bold" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 scrollbar-thin">
            {/* Media Mode Segmented Switcher (<1 min loop vs Full video) */}
            <div className="flex bg-surface-raised p-1 rounded-2xl border border-surface-border">
              <button
                type="button"
                onClick={() => setMediaMode('loop')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mediaMode === 'loop'
                    ? 'bg-volt text-black shadow-sm font-extrabold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ArrowsClockwise size={14} weight="bold" />
                <span>Animation Loop (&lt; 1 min)</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaMode('video')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mediaMode === 'video'
                    ? 'bg-volt text-black shadow-sm font-extrabold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FilmStrip size={14} weight="bold" />
                <span>Detailed Video</span>
              </button>
            </div>

            {/* Media Box */}
            {mediaMode === 'loop' ? (
              <div className="space-y-2.5">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-950 border border-surface-border shadow-tactile flex items-center justify-center">
                  {exercise.animationGifUrl ? (
                    <>
                      <img
                        src={exercise.animationGifUrl}
                        alt={`${exercise.name} animation`}
                        className="w-full h-full object-contain"
                        onLoad={() => setIsGifLoaded(true)}
                      />
                      {!isGifLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 text-gray-400 gap-2">
                          <div className="w-8 h-8 border-2 border-volt border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-mono">Loading Animation Loop...</span>
                        </div>
                      )}
                    </>
                  ) : silentLoopEmbedUrl ? (
                    <iframe
                      src={silentLoopEmbedUrl}
                      title={`${exercise.name} micro loop`}
                      className="w-full h-full border-0 pointer-events-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 gap-2 p-6 text-center">
                      <Barbell size={32} className="text-gray-600" />
                      <span className="text-xs font-mono text-gray-400">Biomechanics Blueprint Below</span>
                    </div>
                  )}

                  {/* Micro badge overlay */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-volt border border-volt/30 flex items-center gap-1 shadow-sm">
                    <ArrowsClockwise size={11} weight="bold" className="animate-spin" />
                    <span>Auto-Loop (Under 1 min)</span>
                  </div>
                </div>

                {/* Biomechanical Cadence & Rep Rhythm Bar */}
                <div className="p-3 rounded-2xl bg-surface-raised border border-surface-border space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-gray-300 font-bold flex items-center gap-1.5">
                      <Lightning size={13} className="text-volt" weight="fill" />
                      <span>Optimal Rep Cadence (Tempo)</span>
                    </span>
                    <span className="text-volt font-bold">3 - 1 - 1 - 0</span>
                  </div>

                  {/* Visual 3-Stage Pulse Bar */}
                  <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
                    <div className="p-1.5 rounded-lg bg-surface border border-surface-border text-gray-300">
                      <div className="text-volt font-bold">2–3s</div>
                      <div className="text-[9px] text-gray-400 uppercase">Eccentric (Lower)</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-surface border border-surface-border text-gray-300">
                      <div className="text-amber-400 font-bold">1s Pause</div>
                      <div className="text-[9px] text-gray-400 uppercase">Stretch Hold</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-surface border border-surface-border text-gray-300">
                      <div className="text-emerald-400 font-bold">1s Drive</div>
                      <div className="text-[9px] text-gray-400 uppercase">Concentric Squeeze</div>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 text-center font-mono">
                    💡 <strong>Pro Tip:</strong> Focus on smooth continuous tension. No bouncing at the bottom.
                  </p>
                </div>
              </div>
            ) : (
              /* Full YouTube Video Mode */
              exercise.videoEmbedUrl && (
                <div className="space-y-2">
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-neutral-900 border border-surface-border shadow-tactile group">
                    <iframe
                      src={exercise.videoEmbedUrl}
                      title={exercise.videoSourceTitle || exercise.name}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      onLoad={() => setIsVideoLoaded(true)}
                    />
                    {!isVideoLoaded && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/90 text-gray-400 gap-2">
                        <div className="w-8 h-8 border-2 border-volt border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-mono">Loading Video Demonstration...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 font-mono">
                    <span className="flex items-center gap-1.5 text-volt">
                      <Sparkle size={13} weight="fill" />
                      <span>Full Instructional Video</span>
                    </span>
                    <a
                      href={exercise.videoEmbedUrl.replace('/embed/', '/watch?v=').split('?')[0]}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>Full Screen</span>
                      <ArrowSquareOut size={12} />
                    </a>
                  </div>
                </div>
              )
            )}

            {/* Exercise Overview & Anatomy */}
            <div className="p-4 rounded-2xl bg-surface-raised/60 border border-surface-border space-y-3">
              {exercise.description && (
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  {exercise.description}
                </p>
              )}

              {/* Muscle Targeting Badges */}
              <div className="space-y-1.5 pt-1">
                {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-mono uppercase text-gray-400 shrink-0 mt-0.5">
                      Target:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {exercise.targetMuscles.map((muscle) => (
                        <span
                          key={muscle}
                          className="px-2 py-0.5 rounded-md bg-volt/10 text-volt text-[10px] font-mono font-bold border border-volt/20"
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-mono uppercase text-gray-500 shrink-0 mt-0.5">
                      Secondary:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {exercise.secondaryMuscles.map((muscle) => (
                        <span
                          key={muscle}
                          className="px-2 py-0.5 rounded-md bg-surface text-gray-400 text-[10px] font-mono border border-surface-border"
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form & Blueprint Tab Switcher */}
            <div className="flex bg-surface-raised p-1 rounded-2xl border border-surface-border">
              <button
                type="button"
                onClick={() => setActiveTab('technique')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'technique'
                    ? 'bg-volt text-black shadow-sm font-extrabold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <BookOpen size={14} weight="bold" />
                <span>Execution</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cues')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'cues'
                    ? 'bg-volt text-black shadow-sm font-extrabold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <CheckCircle size={14} weight="bold" />
                <span>Form Cues</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('mistakes')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'mistakes'
                    ? 'bg-volt text-black shadow-sm font-extrabold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <WarningCircle size={14} weight="bold" />
                <span>Avoid</span>
              </button>
            </div>

            {/* Tab 1: Step-by-Step Technique */}
            {activeTab === 'technique' && (
              <div className="space-y-4">
                {exercise.setupInstructions && exercise.setupInstructions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-volt" />
                      <span>Phase 1: Setup & Starting Position</span>
                    </h4>
                    <ol className="space-y-1.5 pl-1">
                      {exercise.setupInstructions.map((step, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-gray-300 leading-relaxed flex items-start gap-2.5 p-2 rounded-xl bg-surface-raised/40 border border-surface-border/50"
                        >
                          <span className="w-5 h-5 rounded-lg bg-surface border border-surface-border text-volt font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="flex-1">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {exercise.executionInstructions && exercise.executionInstructions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-volt" />
                      <span>Phase 2: Movement & Rep Execution</span>
                    </h4>
                    <ol className="space-y-1.5 pl-1">
                      {exercise.executionInstructions.map((step, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-gray-300 leading-relaxed flex items-start gap-2.5 p-2 rounded-xl bg-surface-raised/40 border border-surface-border/50"
                        >
                          <span className="w-5 h-5 rounded-lg bg-surface border border-surface-border text-volt font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="flex-1">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Pro Form Cues */}
            {activeTab === 'cues' && (
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle size={15} weight="bold" />
                  <span>Key Cues & Proper Technique</span>
                </h4>
                {exercise.formCues && exercise.formCues.length > 0 ? (
                  <ul className="space-y-2">
                    {exercise.formCues.map((cue, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-gray-200 leading-relaxed flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
                      >
                        <CheckCircle size={16} weight="fill" className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{cue}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400 p-2">Perform with strict control and full range of motion.</p>
                )}
              </div>
            )}

            {/* Tab 3: Common Mistakes */}
            {activeTab === 'mistakes' && (
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <WarningCircle size={15} weight="bold" />
                  <span>Common Mistakes to Avoid</span>
                </h4>
                {exercise.commonMistakes && exercise.commonMistakes.length > 0 ? (
                  <ul className="space-y-2">
                    {exercise.commonMistakes.map((mistake, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-gray-200 leading-relaxed flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20"
                      >
                        <WarningCircle size={16} weight="fill" className="text-rose-400 shrink-0 mt-0.5" />
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400 p-2">Avoid rapid jerking motions or using momentum to swing weights.</p>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 border-t border-surface-border bg-surface-raised/40 flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-surface-raised hover:bg-neutral-800 border border-surface-border text-xs font-bold uppercase tracking-wider text-gray-300 transition-colors"
            >
              Close
            </button>
            {onStartExercise && (
              <button
                type="button"
                onClick={() => {
                  onStartExercise(exercise);
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-volt hover:bg-volt-hover active:scale-98 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-volt-sm flex items-center justify-center gap-2"
              >
                <Play size={15} weight="fill" />
                <span>Start Workout with this Exercise</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
