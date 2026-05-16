
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, User, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface LoginProps {
  onLogin: (userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin({
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        name: isSignUp ? name : (name || email.split('@')[0]),
        email,
        plan: 'Free',
        joinedDate: new Date().toISOString(),
        settings: {
          aiAccuracy: true,
          realtimeSync: true,
          weeklyReports: false,
          defaultExportFormat: 'pdf',
        },
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 overflow-hidden" style={{ background: '#030000' }}>

      {/* ── Ambient glows ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(180,10,10,0.18) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div
          className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(120,0,0,0.14) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div
          className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
      </div>

      {/* ── Grid overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(220,38,38,1) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Scan line ── */}
      <motion.div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(220,38,38,0.4) 30%, rgba(255,80,80,0.7) 50%, rgba(220,38,38,0.4) 70%, transparent 100%)',
          boxShadow: '0 0 12px 3px rgba(220,38,38,0.25)',
        }}
        animate={{ top: ['-2%', '102%'] }}
        transition={{ duration: 3, ease: 'linear', repeat: Infinity, repeatDelay: 1.5 }}
      />

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div
          className="relative p-10 rounded-[2.5rem] overflow-hidden"
          style={{
            background: 'rgba(10,0,0,0.75)',
            border: '1px solid rgba(220,38,38,0.18)',
            boxShadow: '0 0 60px rgba(180,10,10,0.15), 0 40px 80px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Corner Sparkle */}
          <div className="absolute top-0 right-0 p-5 pointer-events-none">
            <Sparkles className="opacity-10" size={36} style={{ color: '#dc2626' }} />
          </div>

          {/* Corner brackets */}
          {[
            { top: 16, left: 16, rotate: 0 },
            { top: 16, right: 16, rotate: 90 },
            { bottom: 16, left: 16, rotate: 270 },
            { bottom: 16, right: 16, rotate: 180 },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute w-5 h-5 pointer-events-none"
              style={{
                ...pos,
                borderColor: 'rgba(220,38,38,0.3)',
                borderTopWidth: 1.5,
                borderLeftWidth: 1.5,
                borderStyle: 'solid',
                transform: `rotate(${pos.rotate}deg)`,
              }}
            />
          ))}

          {/* ── Header ── */}
          <div className="flex flex-col items-center mb-10">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.08 }}
              className="w-16 h-16 rounded-[1.2rem] flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 60%, #ef4444 100%)',
                boxShadow: '0 0 40px rgba(220,38,38,0.45), 0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              <Zap className="text-white" size={34} fill="currentColor" />
            </motion.div>

            <motion.h1
              key={isSignUp ? 'signup-title' : 'signin-title'}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black tracking-tight text-center"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fca5a5 60%, #dc2626 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {isSignUp ? 'Create Workspace' : 'Welcome Back'}
            </motion.h1>
            <p className="text-gray-500 mt-2 text-center text-sm">
              {isSignUp
                ? 'Start generating professional reports today.'
                : 'Enter your credentials to access your reports.'}
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-[10px] font-bold uppercase tracking-widest ml-1" style={{ color: 'rgba(220,38,38,0.6)' }}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={17} />
                    <input
                      type="text"
                      required={isSignUp}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full pl-11 pr-4 py-4 rounded-2xl text-gray-200 placeholder:text-gray-700 focus:outline-none transition-all"
                      style={{
                        background: 'rgba(220,38,38,0.04)',
                        border: '1px solid rgba(220,38,38,0.15)',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'rgba(220,38,38,0.5)')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(220,38,38,0.15)')}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest ml-1" style={{ color: 'rgba(220,38,38,0.6)' }}>
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={17} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-4 py-4 rounded-2xl text-gray-200 placeholder:text-gray-700 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(220,38,38,0.04)',
                    border: '1px solid rgba(220,38,38,0.15)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(220,38,38,0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(220,38,38,0.15)')}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between ml-1">
                <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(220,38,38,0.6)' }}>
                  Password
                </label>
                {!isSignUp && (
                  <button type="button" className="text-xs font-bold transition-colors" style={{ color: '#dc2626' }}>
                    Forgot access?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={17} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-4 rounded-2xl text-gray-200 placeholder:text-gray-700 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(220,38,38,0.04)',
                    border: '1px solid rgba(220,38,38,0.15)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(220,38,38,0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(220,38,38,0.15)')}
                />
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 group mt-2 transition-all"
              style={{
                background: loading
                  ? 'rgba(127,29,29,0.4)'
                  : 'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #ef4444 100%)',
                boxShadow: loading ? 'none' : '0 0 30px rgba(220,38,38,0.4), 0 8px 20px rgba(0,0,0,0.4)',
              }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Initialize Workspace' : 'Sign In to Workspace'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          {/* ── Footer ── */}
          <div
            className="mt-8 pt-6 text-center"
            style={{ borderTop: '1px solid rgba(220,38,38,0.1)' }}
          >
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <span className="font-bold" style={{ color: '#dc2626' }}>
                {isSignUp ? 'Sign In' : 'Create One'}
              </span>
            </button>
          </div>
        </div>

        {/* ── Powered by ── */}
        <p className="text-center mt-6 text-[10px] font-mono tracking-widest uppercase" style={{ color: 'rgba(220,38,38,0.3)' }}>
          Powered by Gemini · NarratoAI v2.0
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
