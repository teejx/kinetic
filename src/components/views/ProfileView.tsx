import React, { useState } from 'react';
import {
  Fire,
  PencilSimple,
  DownloadSimple,
  DeviceMobile,
  SignOut,
  ShieldCheck,
  User
} from '@phosphor-icons/react';
import { useFitness } from '../../context/FitnessContext';
import { UserProfile } from '../../types';
import { SignOutConfirmModal } from '../SignOutConfirmModal';

export const ProfileView: React.FC = () => {
  const {
    activeUser,
    updateUserProfile,
    userWorkouts,
    isOnline,
    isInstallable,
    promptInstall,
    logout
  } = useFitness();

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  if (!activeUser) {
    return null;
  }

  // Ensure athlete name is clean (never displaying raw email)
  const cleanAthleteName = activeUser.name.includes('@')
    ? activeUser.name.split('@')[0]
    : activeUser.name;

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(cleanAthleteName);
  const [editWeight, setEditWeight] = useState(activeUser.bodyWeight);
  const [editGoal, setEditGoal] = useState<UserProfile['trainingGoal']>(activeUser.trainingGoal);
  const [editUnit, setEditUnit] = useState(activeUser.weightUnit);
  const [editBio, setEditBio] = useState(activeUser.bio);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = editName.trim() || cleanAthleteName;
    const finalHandle = `@${finalName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    updateUserProfile({
      ...activeUser,
      name: finalName,
      handle: finalHandle,
      bodyWeight: editWeight,
      trainingGoal: editGoal,
      weightUnit: editUnit,
      bio: editBio,
    });
    setIsEditing(false);
  };

  const handleExportJson = () => {
    const backup = {
      athlete: {
        id: activeUser.id,
        athleteName: cleanAthleteName,
        handle: activeUser.handle,
        trainingGoal: activeUser.trainingGoal,
        bodyWeight: activeUser.bodyWeight,
        weightUnit: activeUser.weightUnit,
      },
      workouts: userWorkouts,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kinetic-backup-${cleanAthleteName.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const goals: UserProfile['trainingGoal'][] = [
    'Strength',
    'Hypertrophy',
    'Functional',
    'Endurance',
    'General Fitness'
  ];

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto pb-28">
      {/* Profile Header Card */}
      <div className="p-5 rounded-3xl bg-surface border border-surface-border space-y-4 shadow-tactile relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-black text-lg uppercase shadow-md ${
                activeUser.avatarBg || 'bg-volt'
              }`}
            >
              {cleanAthleteName.substring(0, 2)}
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white leading-tight">
                {cleanAthleteName}
              </h2>
              <div className="text-xs text-gray-400 font-mono mt-0.5">
                {activeUser.handle} · Member since {activeUser.joinedDate}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-volt/10 text-volt font-semibold border border-volt/20">
                  {activeUser.trainingGoal}
                </span>
                <span className="text-xs text-amber-400 font-mono flex items-center gap-1 font-semibold">
                  <Fire size={13} weight="fill" />
                  {activeUser.streakDays}d streak
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setEditName(cleanAthleteName);
              setIsEditing(!isEditing);
            }}
            className="p-2 rounded-xl bg-surface-raised border border-surface-border text-gray-400 hover:text-white transition-colors"
            title="Edit Athlete Profile"
          >
            <PencilSimple size={16} />
          </button>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed bg-surface-raised/40 p-3 rounded-2xl border border-surface-border/40">
          "{activeUser.bio}"
        </p>

        {/* Quick Body Stats */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-surface-raised border border-surface-border">
            <div className="font-mono text-base font-bold text-white">
              {activeUser.bodyWeight} {activeUser.weightUnit}
            </div>
            <div className="text-[10px] uppercase font-mono text-gray-400 mt-0.5">Body Weight</div>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-raised border border-surface-border">
            <div className="font-mono text-base font-bold text-volt">
              {userWorkouts.length}
            </div>
            <div className="text-[10px] uppercase font-mono text-gray-400 mt-0.5">Logged Workouts</div>
          </div>
        </div>

        {/* Edit Form Drawer */}
        {isEditing && (
          <form onSubmit={handleSaveEdit} className="pt-3 border-t border-surface-border space-y-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                Athlete Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Alex River"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-surface-raised rounded-xl text-xs font-bold text-white border border-surface-border focus:outline-none focus:border-volt"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1.5">
                Training Focus
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {goals.map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setEditGoal(g)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                      editGoal === g
                        ? 'bg-volt text-black border-volt'
                        : 'bg-surface-raised border-surface-border text-gray-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                Bio / Training Philosophy
              </label>
              <input
                type="text"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full px-3 py-2 bg-surface-raised rounded-xl text-xs text-white border border-surface-border focus:outline-none focus:border-volt"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                  Weight ({editUnit})
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={editWeight}
                  onChange={(e) => setEditWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-surface-raised rounded-xl text-xs font-mono text-white border border-surface-border focus:outline-none focus:border-volt"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                  Unit
                </label>
                <select
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value as any)}
                  className="w-full px-3 py-2 bg-surface-raised rounded-xl text-xs text-white border border-surface-border focus:outline-none focus:border-volt"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lbs">Pounds (lbs)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 rounded-xl bg-surface-raised border border-surface-border text-xs text-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-volt text-black font-bold text-xs uppercase tracking-wider hover:bg-volt-hover transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Account Security & Privacy Badge */}
      <div className="p-4 rounded-3xl bg-surface border border-surface-border flex items-center gap-3 shadow-tactile">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
          <ShieldCheck size={22} weight="bold" />
        </div>
        <div>
          <h4 className="font-bold text-xs text-white">Private & Isolated Storage</h4>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
            Your workout records are encrypted and isolated exclusively to your account. No cross-user sharing or data mining.
          </p>
        </div>
      </div>

      {/* PWA Install & Offline Mode Card */}
      <div className="p-4 rounded-3xl bg-surface border border-surface-border space-y-3 shadow-tactile">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DeviceMobile size={18} className="text-volt" />
            <h3 className="font-bold text-sm text-white">Offline PWA App</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-volt/10 text-volt border border-volt/20">
            {isOnline ? 'Online (Ready)' : 'Offline Mode Active'}
          </span>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          KINETIC works 100% offline at the gym with full Service Worker caching. Add it to your home screen for an instant app experience.
        </p>

        {isInstallable ? (
          <button
            onClick={() => promptInstall()}
            className="w-full py-2.5 rounded-xl bg-volt text-black text-xs font-bold uppercase tracking-wider hover:bg-volt-hover active:scale-95 transition-all flex items-center justify-center gap-2 shadow-volt-sm"
          >
            <DownloadSimple size={15} weight="bold" />
            <span>Install KINETIC to Home Screen</span>
          </button>
        ) : (
          <div className="p-2.5 rounded-xl bg-surface-raised border border-surface-border text-[11px] text-gray-400 leading-relaxed">
            💡 <strong>Mobile Tip:</strong> On iOS Safari tap <strong>Share</strong> → <strong>Add to Home Screen</strong>. On Android Chrome tap <strong>⋮</strong> → <strong>Install App</strong>.
          </div>
        )}
      </div>

      {/* Data Export Card */}
      <div className="p-4 rounded-3xl bg-surface border border-surface-border flex items-center justify-between">
        <div>
          <h4 className="font-bold text-xs text-white">Export My Workout Logs</h4>
          <p className="text-[11px] text-gray-400">Download personal JSON backup</p>
        </div>
        <button
          onClick={handleExportJson}
          className="p-2.5 rounded-xl bg-surface-raised border border-surface-border text-gray-300 hover:text-white transition-colors"
          title="Download personal JSON backup"
        >
          <DownloadSimple size={16} />
        </button>
      </div>

      {/* Account Sign Out Card */}
      <div className="p-4 rounded-3xl bg-surface border border-surface-border space-y-2">
        <button
          onClick={() => setShowSignOutConfirm(true)}
          className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <SignOut size={16} weight="bold" />
          <span>Sign Out of Account</span>
        </button>
        <p className="text-[10px] text-center text-gray-500 font-mono">
          Athlete: <span className="text-gray-300 font-bold">{cleanAthleteName}</span> · {activeUser.handle}
        </p>
      </div>

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={logout}
        athleteName={cleanAthleteName}
        athleteHandle={activeUser.handle}
      />
    </div>
  );
};
