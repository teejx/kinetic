import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lightning,
  Lock,
  Envelope,
  User,
  Eye,
  EyeSlash,
  Check,
  X,
  Sparkle,
  ArrowRight,
  ShieldCheck,
  WarningCircle
} from '@phosphor-icons/react';
import { useFitness } from '../../context/FitnessContext';
import { UserProfile } from '../../types';

interface PasswordCriteria {
  hasLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export const AuthView: React.FC = () => {
  const { login, register, loginGuest } = useFitness();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState('');
  const [goal, setGoal] = useState<UserProfile['trainingGoal']>('Strength');
  const [weight, setWeight] = useState(75);
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guest athlete name setup modal state
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestGoal, setGuestGoal] = useState<UserProfile['trainingGoal']>('Strength');
  const [guestWeight, setGuestWeight] = useState(75);
  const [guestUnit, setGuestUnit] = useState<'kg' | 'lbs'>('kg');

  // Strict real-time password criteria computation
  const criteria: PasswordCriteria = useMemo(() => {
    return {
      hasLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
    };
  }, [password]);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  // ALL 5 criteria + matching confirm password must be satisfied to allow registration
  const isAllPasswordCriteriaSatisfied =
    criteria.hasLength &&
    criteria.hasUpper &&
    criteria.hasLower &&
    criteria.hasNumber &&
    criteria.hasSpecial &&
    passwordsMatch;

  const isRegisterFormValid =
    isAllPasswordCriteriaSatisfied &&
    name.trim().length > 0 &&
    email.trim().length > 0;

  const passwordScore = useMemo(() => {
    let score = 0;
    if (criteria.hasLength) score += 1;
    if (criteria.hasUpper && criteria.hasLower) score += 1;
    if (criteria.hasNumber) score += 1;
    if (criteria.hasSpecial) score += 1;
    return score;
  }, [criteria]);

  // Generate strong cryptographic password
  const handleGenerateStrongPassword = () => {
    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowers = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const specials = '!@#$%&*?';
    const all = uppers + lowers + numbers + specials;

    let res = '';
    res += uppers[Math.floor(Math.random() * uppers.length)];
    res += lowers[Math.floor(Math.random() * lowers.length)];
    res += numbers[Math.floor(Math.random() * numbers.length)];
    res += specials[Math.floor(Math.random() * specials.length)];

    for (let i = 4; i < 14; i++) {
      res += all[Math.floor(Math.random() * all.length)];
    }

    const shuffled = res.split('').sort(() => 0.5 - Math.random()).join('');
    setPassword(shuffled);
    setConfirmPassword(shuffled);
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your athlete name.');
        return;
      }
      if (!criteria.hasLength) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      if (!criteria.hasUpper) {
        setError('Password must contain at least one uppercase letter (A-Z).');
        return;
      }
      if (!criteria.hasLower) {
        setError('Password must contain at least one lowercase letter (a-z).');
        return;
      }
      if (!criteria.hasNumber) {
        setError('Password must contain at least one number (0-9).');
        return;
      }
      if (!criteria.hasSpecial) {
        setError('Password must contain at least one special character (!@#$%&*).');
        return;
      }
      if (!passwordsMatch) {
        setError('Passwords do not match. Please verify your confirm password.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email.trim(), password);
        if (!res.success) {
          setError(res.error || 'Invalid credentials or sign-in failed.');
        }
      } else {
        const res = await register(email.trim(), password, name.trim(), goal, weight, unit);
        if (!res.success) {
          setError(res.error || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const goals: UserProfile['trainingGoal'][] = [
    'Strength',
    'Hypertrophy',
    'Functional',
    'Endurance',
    'General Fitness'
  ];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col justify-center items-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface border border-surface-border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-volt/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-volt text-black flex items-center justify-center mx-auto shadow-volt-sm font-black">
            <Lightning size={26} weight="fill" />
          </div>
          <div>
            <h1 className="font-extrabold text-2xl text-white tracking-tight font-display">
              KINETIC
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Private & Secure Fitness Logbook
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-surface-raised p-1 rounded-2xl border border-surface-border mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              mode === 'login' ? 'bg-volt text-black shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              mode === 'register' ? 'bg-volt text-black shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2"
          >
            <div className="flex items-start gap-2 flex-1">
              <WarningCircle size={18} weight="bold" className="shrink-0 text-rose-400 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsGuestModalOpen(true)}
              className="text-[10px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 px-2 py-1 rounded-lg font-mono whitespace-nowrap transition-colors"
            >
              Guest Mode
            </button>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                Athlete Name *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex River"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-surface-raised rounded-xl text-sm text-white placeholder-gray-600 border border-surface-border focus:outline-none focus:border-volt"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Envelope size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                placeholder="athlete@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-surface-raised rounded-xl text-sm text-white placeholder-gray-600 border border-surface-border focus:outline-none focus:border-volt"
              />
            </div>
          </div>

          {/* Password with Eye preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-mono uppercase text-gray-400">
                Password *
              </label>
              {mode === 'register' && (
                <button
                  type="button"
                  onClick={handleGenerateStrongPassword}
                  className="text-[10px] text-volt hover:underline font-mono flex items-center gap-1 font-semibold"
                  title="Generate a high-entropy password"
                >
                  <Sparkle size={12} weight="fill" />
                  <span>Generate Strong</span>
                </button>
              )}
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={mode === 'register' ? 8 : 6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-surface-raised rounded-xl text-sm font-mono text-white placeholder-gray-600 border border-surface-border focus:outline-none focus:border-volt"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
              </button>
            </div>
          </div>

          {/* Password Requirements Checklist (Register Mode Only) */}
          {mode === 'register' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2.5 p-3.5 bg-surface-raised/70 rounded-2xl border border-surface-border"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400 font-mono">Password Security:</span>
                <span className={`font-mono font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                  isAllPasswordCriteriaSatisfied
                    ? 'text-volt bg-volt/10 border border-volt/20'
                    : passwordScore >= 2
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-rose-400 bg-rose-500/10'
                }`}>
                  {isAllPasswordCriteriaSatisfied ? 'Ready to Create' : 'Requirements Incomplete'}
                </span>
              </div>

              {/* 4-Segment Progress Bar */}
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((seg) => (
                  <div
                    key={seg}
                    className={`h-full rounded-full transition-all duration-300 ${
                      seg <= passwordScore
                        ? isAllPasswordCriteriaSatisfied
                          ? 'bg-volt shadow-volt-sm'
                          : passwordScore >= 3
                          ? 'bg-lime-400'
                          : passwordScore >= 2
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                        : 'bg-surface-border'
                    }`}
                  />
                ))}
              </div>

              {/* Exact Checklist */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] font-mono">
                <div className={`flex items-center gap-1.5 ${criteria.hasLength ? 'text-volt font-bold' : 'text-gray-500'}`}>
                  {criteria.hasLength ? <Check size={13} weight="bold" /> : <span className="w-3 text-center">•</span>}
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.hasUpper ? 'text-volt font-bold' : 'text-gray-500'}`}>
                  {criteria.hasUpper ? <Check size={13} weight="bold" /> : <span className="w-3 text-center">•</span>}
                  <span>Uppercase (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.hasLower ? 'text-volt font-bold' : 'text-gray-500'}`}>
                  {criteria.hasLower ? <Check size={13} weight="bold" /> : <span className="w-3 text-center">•</span>}
                  <span>Lowercase (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${criteria.hasNumber ? 'text-volt font-bold' : 'text-gray-500'}`}>
                  {criteria.hasNumber ? <Check size={13} weight="bold" /> : <span className="w-3 text-center">•</span>}
                  <span>Number (0-9)</span>
                </div>
                <div className={`col-span-2 flex items-center gap-1.5 ${criteria.hasSpecial ? 'text-volt font-bold' : 'text-gray-500'}`}>
                  {criteria.hasSpecial ? <Check size={13} weight="bold" /> : <span className="w-3 text-center">•</span>}
                  <span>Special symbol (!@#$%&*?)</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Confirm Password with Eye preview & Match Check (Register Mode Only) */}
          {mode === 'register' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-mono uppercase text-gray-400">
                  Confirm Password *
                </label>
                {confirmPassword.length > 0 && (
                  <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${
                    passwordsMatch ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {passwordsMatch ? (
                      <>
                        <Check size={12} weight="bold" />
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X size={12} weight="bold" />
                        <span>Mismatch</span>
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-9 pr-10 py-2.5 bg-surface-raised rounded-xl text-sm font-mono text-white placeholder-gray-600 border focus:outline-none transition-colors ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-emerald-500/60 focus:border-emerald-400'
                        : 'border-rose-500/60 focus:border-rose-400'
                      : 'border-surface-border focus:border-volt'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
                </button>
              </div>
            </div>
          )}

          {/* Additional Athlete Attributes (Register Mode Only) */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1.5">
                  Training Focus
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {goals.map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => setGoal(g)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                        goal === g
                          ? 'bg-volt text-black border-volt'
                          : 'bg-surface-raised border-surface-border text-gray-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                    Body Weight
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-surface-raised rounded-xl text-sm font-mono text-white border border-surface-border focus:outline-none focus:border-volt"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                    Unit
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-surface-raised p-1 rounded-xl border border-surface-border">
                    <button
                      type="button"
                      onClick={() => setUnit('kg')}
                      className={`py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        unit === 'kg' ? 'bg-volt text-black' : 'text-gray-400'
                      }`}
                    >
                      KG
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnit('lbs')}
                      className={`py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        unit === 'lbs' ? 'bg-volt text-black' : 'text-gray-400'
                      }`}
                    >
                      LBS
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Submit Action: Strictly disabled until all requirements are met */}
          <button
            type="submit"
            disabled={isLoading || (mode === 'register' && !isRegisterFormValid)}
            className={`w-full py-3.5 rounded-2xl bg-volt text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-volt-sm flex items-center justify-center gap-2 mt-2 ${
              isLoading || (mode === 'register' && !isRegisterFormValid)
                ? 'opacity-40 cursor-not-allowed bg-neutral-800 text-gray-400 shadow-none'
                : 'hover:bg-volt-hover active:scale-98'
            }`}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : mode === 'login' ? (
              <>
                <span>Sign In to Logbook</span>
                <ArrowRight size={16} weight="bold" />
              </>
            ) : isRegisterFormValid ? (
              <>
                <span>Create Account & Enter Gym</span>
                <ArrowRight size={16} weight="bold" />
              </>
            ) : (
              <>
                <Lock size={15} weight="bold" />
                <span>Satisfy All Requirements to Create</span>
              </>
            )}
          </button>
        </form>

        {/* Guest / Offline Mode Fallback */}
        <div className="mt-5 pt-4 border-t border-surface-border/60 text-center">
          <button
            type="button"
            onClick={() => setIsGuestModalOpen(true)}
            className="text-xs text-gray-400 hover:text-white transition-colors underline font-medium"
          >
            Continue as Offline Guest (Set Name & Train)
          </button>
        </div>
      </motion.div>

      {/* Guest Athlete Setup Modal */}
      <AnimatePresence>
        {isGuestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div
              className="absolute inset-0"
              onClick={() => setIsGuestModalOpen(false)}
              aria-label="Close modal"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="relative z-10 w-full max-w-sm rounded-[2rem] p-1.5 bg-gradient-to-b from-neutral-800/80 to-surface-raised/50 border border-surface-border shadow-2xl overflow-hidden"
            >
              <div className="bg-surface rounded-[calc(2rem-6px)] p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-volt/10 text-volt border border-volt/20 flex items-center justify-center">
                      <User size={20} weight="bold" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white">Offline Profile</h3>
                      <p className="text-[11px] text-gray-400">Set your Athlete Name</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsGuestModalOpen(false)}
                    className="p-1.5 rounded-xl text-gray-500 hover:text-white hover:bg-surface-raised transition-colors"
                  >
                    <X size={16} weight="bold" />
                  </button>
                </div>

                <div className="space-y-3.5 pt-1">
                  {/* Athlete Name Field */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                      Athlete Name *
                    </label>
                    <input
                      type="text"
                      autoFocus
                      placeholder="e.g. Marcus Vance or Guest Athlete"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-surface-raised rounded-xl text-xs text-white border border-surface-border focus:outline-none focus:border-volt placeholder:text-gray-600 font-medium"
                    />
                  </div>

                  {/* Training Goal Selector */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                      Primary Training Focus
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['Strength', 'Hypertrophy', 'Endurance', 'Functional', 'General Fitness'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGuestGoal(g)}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-medium border text-center transition-all ${
                            guestGoal === g
                              ? 'bg-volt text-black border-volt font-bold'
                              : 'bg-surface-raised text-gray-400 border-surface-border hover:text-white'
                          } ${g === 'General Fitness' ? 'col-span-2' : ''}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Body Weight & Unit */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                        Body Weight
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={guestWeight}
                        onChange={(e) => setGuestWeight(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-surface-raised rounded-xl text-xs font-mono text-white border border-surface-border focus:outline-none focus:border-volt"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-gray-400 mb-1">
                        Unit
                      </label>
                      <div className="grid grid-cols-2 gap-1 bg-surface-raised p-1 rounded-xl border border-surface-border">
                        <button
                          type="button"
                          onClick={() => setGuestUnit('kg')}
                          className={`py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                            guestUnit === 'kg' ? 'bg-volt text-black' : 'text-gray-400'
                          }`}
                        >
                          KG
                        </button>
                        <button
                          type="button"
                          onClick={() => setGuestUnit('lbs')}
                          className={`py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                            guestUnit === 'lbs' ? 'bg-volt text-black' : 'text-gray-400'
                          }`}
                        >
                          LBS
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      loginGuest({
                        name: guestName.trim() || 'Guest Athlete',
                        trainingGoal: guestGoal,
                        weight: guestWeight,
                        unit: guestUnit,
                      });
                      setIsGuestModalOpen(false);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-volt hover:bg-volt-hover active:scale-98 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-volt-sm flex items-center justify-center gap-2"
                  >
                    <span>Enter Gym as {guestName.trim() || 'Guest'}</span>
                    <ArrowRight size={16} weight="bold" />
                  </button>
                  <p className="text-[10px] text-center text-gray-500 font-mono mt-2">
                    Stored 100% locally on this device · Zero cloud needed
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
