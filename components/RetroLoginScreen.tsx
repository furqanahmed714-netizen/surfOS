import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BlockedAccess } from './BlockedAccess';

export const RetroLoginScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [bootSequence, setBootSequence] = useState(true);
  const [bootText, setBootText] = useState<string[]>([]);
  const [subscriptionBlocked, setSubscriptionBlocked] = useState(false);
  const { signIn, signUp, subscriptionCheckInProgress } = useAuth();

  const bootMessages = [
    'SURFOS BIOS v1.0',
    'Copyright (c) 2024 Beach Technologies Inc.',
    '',
    'Detecting hardware...',
    'Wave Generator.......... OK',
    'Sand Renderer........... OK',
    'Tide Calculator......... OK',
    'Radical Mode............ ENGAGED',
    '',
    'Loading SurfOS...',
    '',
    'System ready. Authentication required.',
  ];

  useEffect(() => {
    if (bootSequence) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < bootMessages.length) {
          setBootText(prev => [...prev, bootMessages[currentIndex]]);
          currentIndex++;
        } else {
          clearInterval(interval);
          setTimeout(() => setBootSequence(false), 800);
        }
      }, 150);
      return () => clearInterval(interval);
    }
  }, [bootSequence]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const { error, subscriptionDenied } = await signIn(email, password);
      if (subscriptionDenied) {
        setSubscriptionBlocked(true);
        return;
      }
      if (error) {
        setError(error.message);
      }
    } else {
      if (!firstName.trim() || !lastName.trim()) {
        setError('First and last name are required');
        return;
      }
      const { error, subscriptionDenied } = await signUp(email, password, firstName.trim(), lastName.trim());
      if (subscriptionDenied) {
        setSubscriptionBlocked(true);
        return;
      }
      if (error) {
        setError(error.message);
      }
    }
  };

  if (subscriptionBlocked) {
    return <BlockedAccess />;
  }

  return (
    <div className="fixed inset-0 bg-[#1a1a2e] overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-50"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
        }}
      />

      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-teal-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-ocean-500 rounded-full shadow-lg shadow-teal-500/30" />
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-ocean-400 to-teal-300"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
              SurfOS
            </h1>
          </div>
          <p className="text-teal-400/60 text-sm tracking-[0.3em] uppercase">Beach Operating System v1.0</p>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-[#0d1117] border-2 border-[#30363d] rounded-lg shadow-2xl shadow-black/50 overflow-hidden">
            <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="ml-2 text-[#8b949e] text-xs font-mono">terminal@surfos ~ auth</span>
            </div>

            {bootSequence ? (
              <div className="p-4 h-80 font-mono text-sm overflow-hidden">
                {bootText.map((line, i) => (
                  <div key={i} className="text-[#39d353]" style={{ textShadow: '0 0 10px rgba(57, 211, 83, 0.5)' }}>
                    {line || '\u00A0'}
                  </div>
                ))}
                <span className="inline-block w-2 h-4 bg-[#39d353] animate-pulse ml-1" />
              </div>
            ) : (
              <div className="p-6">
                <div className="flex mb-6 border border-[#30363d] rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => { setIsLogin(true); setError(''); }}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                      isLogin
                        ? 'bg-teal-500/20 text-teal-300 border-b-2 border-teal-400'
                        : 'bg-[#161b22] text-[#8b949e] hover:text-white'
                    }`}
                  >
                    LOGIN
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsLogin(false); setError(''); }}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                      !isLogin
                        ? 'bg-teal-500/20 text-teal-300 border-b-2 border-teal-400'
                        : 'bg-[#161b22] text-[#8b949e] hover:text-white'
                    }`}
                  >
                    SIGN UP
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#8b949e] text-xs mb-1 font-mono">FIRST_NAME</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white font-mono text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-colors"
                          required={!isLogin}
                        />
                      </div>
                      <div>
                        <label className="block text-[#8b949e] text-xs mb-1 font-mono">LAST_NAME</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white font-mono text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-colors"
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[#8b949e] text-xs mb-1 font-mono">EMAIL</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white font-mono text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-colors"
                      required
                      placeholder="user@surfos.beach"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8b949e] text-xs mb-1 font-mono">PASSWORD</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white font-mono text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-colors"
                      required
                      minLength={6}
                      placeholder="******"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded text-sm font-mono">
                      ERROR: {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={subscriptionCheckInProgress}
                    className="w-full py-3 bg-gradient-to-r from-teal-500 to-ocean-500 hover:from-teal-400 hover:to-ocean-400 text-white font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {subscriptionCheckInProgress ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        VERIFYING SUBSCRIPTION...
                      </span>
                    ) : (
                      isLogin ? 'ACCESS SYSTEM' : 'CREATE ACCOUNT'
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-[#30363d]">
                  <p className="text-[#8b949e] text-xs font-mono text-center">
                    {isLogin ? 'New surfer? ' : 'Already riding waves? '}
                    <button
                      type="button"
                      onClick={() => { setIsLogin(!isLogin); setError(''); }}
                      className="text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      {isLogin ? 'Create an account' : 'Sign in'}
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-6 text-[#8b949e]/50 text-xs">
          <span>~ WAVE READY ~</span>
          <span className="w-1 h-1 bg-teal-500 rounded-full" />
          <span>SECURE CONNECTION</span>
          <span className="w-1 h-1 bg-teal-500 rounded-full" />
          <span>v1.0.0</span>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
};
