import React from 'react';

export const BlockedAccess: React.FC = () => {
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
            className="absolute w-1 h-1 bg-red-400 rounded-full opacity-30"
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
        <div className="w-full max-w-2xl">
          <div className="bg-[#0d1117] border-2 border-red-500/50 rounded-lg shadow-2xl shadow-red-500/20 overflow-hidden">
            <div className="bg-[#161b22] border-b border-red-500/50 px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="ml-2 text-[#8b949e] text-xs font-mono">terminal@surfos ~ access_denied</span>
            </div>

            <div className="p-8 font-mono">
              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/50 mb-4">
                  <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-red-400 mb-2" style={{ textShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}>
                  ACCESS DENIED
                </h1>
              </div>
              <div className="bg-red-500/5 border border-red-500/30 rounded p-6 mb-6">
                <h2 className="text-red-300 font-semibold mb-3 text-lg">Subscription Required</h2>
                <p className="text-[#8b949e] leading-relaxed mb-4">
                  You need an active AI surfer subscription to access remixer. If you know you have one, make sure to check if you're using the correct email. Email must be the same as your AI surfer membership.
                </p>
                <div className="space-y-2 text-sm text-[#8b949e]">
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>Ensure your Skool subscription is active or in trial period</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>Contact support if you believe this is an error</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 py-3 px-4 bg-[#161b22] hover:bg-[#1c2128] border border-[#30363d] text-[#8b949e] hover:text-white font-semibold rounded transition-all"
                >
                 Go Back
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-[#8b949e]/50 text-xs">
            <span>~ SUBSCRIPTION REQUIRED ~</span>
            <span className="w-1 h-1 bg-red-500 rounded-full" />
            <span>SECURE VALIDATION</span>
          </div>
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
