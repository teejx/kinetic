import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SignOut, X, ShieldCheck } from '@phosphor-icons/react';

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  athleteName?: string;
  athleteHandle?: string;
}

export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  athleteName,
  athleteHandle,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        {/* Backdrop click to dismiss */}
        <div
          className="absolute inset-0"
          onClick={onClose}
          aria-label="Close confirmation"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="relative z-10 w-full max-w-sm rounded-[2rem] p-1.5 bg-gradient-to-b from-neutral-800/60 to-surface-raised/40 border border-surface-border shadow-2xl"
        >
          <div className="bg-surface rounded-[calc(2rem-6px)] p-6 space-y-5 text-center relative overflow-hidden">
            {/* Close cross button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-500 hover:text-white hover:bg-surface-raised transition-colors"
              title="Cancel"
            >
              <X size={16} weight="bold" />
            </button>

            {/* Glowing Icon Header */}
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-tactile">
              <SignOut size={26} weight="bold" />
            </div>

            {/* Title & Copy */}
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-base text-white">
                Sign Out of KINETIC?
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed px-2">
                Are you sure you want to sign out? Your training logs, custom routines, and personal records remain securely preserved on this device.
              </p>
            </div>

            {/* Current Athlete Preview */}
            {athleteName && (
              <div className="py-2 px-3 rounded-xl bg-surface-raised border border-surface-border inline-flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-volt animate-pulse" />
                <span className="font-bold text-white">{athleteName}</span>
                {athleteHandle && (
                  <span className="text-gray-500 font-mono text-[11px]">{athleteHandle}</span>
                )}
              </div>
            )}

            {/* Privacy reassurance note */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-mono">
              <ShieldCheck size={14} className="text-emerald-400" weight="bold" />
              <span>Offline data is safe & private</span>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-3 rounded-xl bg-surface-raised hover:bg-neutral-800 border border-surface-border text-xs font-bold uppercase tracking-wider text-gray-300 transition-colors active:scale-98"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="py-3 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-98 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-tactile flex items-center justify-center gap-1.5"
              >
                <SignOut size={15} weight="bold" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
