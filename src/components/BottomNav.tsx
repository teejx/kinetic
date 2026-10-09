import React from 'react';
import {
  Barbell,
  ClockCounterClockwise,
  BookBookmark,
  ChartBar,
  User,
  Lightning
} from '@phosphor-icons/react';
import { useFitness } from '../context/FitnessContext';

export type NavTab = 'log' | 'history' | 'routines' | 'analytics' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const { activeSession } = useFitness();

  const navItems: { tab: NavTab; label: string; icon: React.ReactNode; activeIcon: React.ReactNode }[] = [
    {
      tab: 'log',
      label: activeSession ? 'Session' : 'Log',
      icon: <Barbell size={22} weight="regular" />,
      activeIcon: <Barbell size={22} weight="bold" />,
    },
    {
      tab: 'history',
      label: 'History',
      icon: <ClockCounterClockwise size={22} weight="regular" />,
      activeIcon: <ClockCounterClockwise size={22} weight="bold" />,
    },
    {
      tab: 'routines',
      label: 'Routines',
      icon: <BookBookmark size={22} weight="regular" />,
      activeIcon: <BookBookmark size={22} weight="bold" />,
    },
    {
      tab: 'analytics',
      label: 'Metrics',
      icon: <ChartBar size={22} weight="regular" />,
      activeIcon: <ChartBar size={22} weight="bold" />,
    },
    {
      tab: 'profile',
      label: 'Profile',
      icon: <User size={22} weight="regular" />,
      activeIcon: <User size={22} weight="bold" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-lg border-t border-surface-border">
      <div className="max-w-lg mx-auto px-2 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          const isLiveSessionPulse = item.tab === 'log' && !!activeSession;

          return (
            <button
              key={item.tab}
              onClick={() => onChangeTab(item.tab)}
              className={`flex-1 py-1 flex flex-col items-center justify-center relative transition-all active:scale-95 ${
                isActive ? 'text-volt font-bold' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                {isActive ? item.activeIcon : item.icon}
                {isLiveSessionPulse && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-volt rounded-full animate-ping" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 font-mono uppercase">
                {item.label}
              </span>
              {isActive && (
                <div className="w-4 h-0.5 bg-volt rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
