import React from 'react';
import {
  Lightning,
  Fire,
  CloudSlash
} from '@phosphor-icons/react';
import { useFitness } from '../context/FitnessContext';

interface NavbarProps {
  onNavigateToProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateToProfile }) => {
  const {
    activeUser,
    isOnline
  } = useFitness();

  return (
    <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-volt text-black flex items-center justify-center font-black shadow-volt-sm">
            <Lightning size={18} weight="fill" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-sm text-white font-display leading-none">
              KINETIC
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-volt font-semibold">
              Logbook
            </span>
          </div>
        </div>

        {/* Right Tools: Offline badge, Athlete Profile Pill, Sign Out */}
        <div className="flex items-center gap-2">
          {!isOnline && (
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-medium animate-pulse"
              title="Offline Mode: All logs saved locally and privately on your device"
            >
              <CloudSlash size={12} weight="bold" />
              <span>Offline</span>
            </span>
          )}

          {/* Current Athlete Profile Pill (Private to logged-in user) */}
          {activeUser && (() => {
            const athleteName = activeUser.name.includes('@')
              ? activeUser.name.split('@')[0]
              : activeUser.name;
            return (
              <button
                onClick={onNavigateToProfile}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-surface hover:bg-surface-raised border border-surface-border hover:border-gray-600 transition-all active:scale-95 group"
                title="View your profile"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-black text-[10px] uppercase ${
                    activeUser.avatarBg || 'bg-volt'
                  }`}
                >
                  {athleteName.substring(0, 2)}
                </div>
                <span className="text-xs font-semibold text-gray-200 group-hover:text-white max-w-[80px] truncate">
                  {athleteName.split(' ')[0]}
                </span>
                <span className="flex items-center gap-0.5 text-amber-400 text-[11px] font-mono font-bold">
                  <Fire size={12} weight="fill" />
                  {activeUser.streakDays}
                </span>
              </button>
            );
          })()}
        </div>
      </div>
    </header>
  );
};
