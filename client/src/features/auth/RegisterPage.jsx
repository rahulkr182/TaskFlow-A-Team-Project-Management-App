import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2, Layers, Clock3, Users } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen mesh-bg text-surface-100 p-4 sm:p-8 flex items-center justify-center lg:-translate-y-14 relative overflow-hidden">
      {/* Animated ambient background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-blue/20 blur-[120px] animate-ambient" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent-pink/20 blur-[120px] animate-ambient" style={{ animationDelay: '2s' }} />
      
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-accent-pink/50 rounded-full"
          animate={{
            y: ['0vh', '-100vh'],
            x: Math.random() * 20 - 10,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: '100%',
          }}
        />
      ))}

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-6xl glass-premium grid lg:grid-cols-[1.08fr_1fr] overflow-hidden shadow-2xl z-10"
      >
        <section className="hidden lg:flex flex-col justify-between p-12 bg-surface-950/40 border-r border-surface-700/50">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-surface-100">TaskFlow</span>
            </div>
            <h1 className="text-[2.25rem] leading-tight font-semibold text-surface-100 overflow-hidden whitespace-nowrap border-r-2 border-primary-500 pr-2" style={{ width: 'fit-content', animation: 'typing 2s steps(20, end), blink-caret .75s step-end infinite' }}>
              Create Your Workspace
            </h1>
            <p className="mt-4 text-lg text-surface-300 max-w-md">
              Start with projects, assign ownership, and track delivery from one place.
            </p>
          </div>

          <div className="space-y-5">
            <motion.div whileHover={{ x: 5 }} className="flex items-start gap-3 group">
              <div className="p-1.5 rounded-lg bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors">
                <Layers className="w-4 h-4 text-primary-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-base text-surface-200 mt-1">Organize work in clear stages that your team understands.</p>
            </motion.div>
            <motion.div whileHover={{ x: 5 }} className="flex items-start gap-3 group">
              <div className="p-1.5 rounded-lg bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors">
                <Clock3 className="w-4 h-4 text-primary-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-base text-surface-200 mt-1">Track due dates and reduce blockers before they escalate.</p>
            </motion.div>
            <motion.div whileHover={{ x: 5 }} className="flex items-start gap-3 group">
              <div className="p-1.5 rounded-lg bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors">
                <Users className="w-4 h-4 text-primary-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-base text-surface-200 mt-1">Invite teammates and collaborate in real time.</p>
            </motion.div>
          </div>
        </section>

        <section className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-surface-100">TaskFlow</span>
            </div>
            <div className="ml-auto flex rounded-lg bg-surface-800/80 p-1 border border-surface-700 relative">
              <motion.div layoutId="auth-tab" className="absolute inset-y-1 right-1 left-1/2 bg-surface-700 rounded-md shadow-sm z-0" />
              <Link to="/login" className="px-5 py-2.5 text-sm font-medium text-surface-400 hover:text-surface-200 transition-colors relative z-10 w-24 text-center">Sign In</Link>
              <span className="px-5 py-2.5 text-sm font-semibold text-surface-100 relative z-10 w-24 text-center">Register</span>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-4xl font-semibold tracking-tight text-surface-100">Create account</h2>
            <p className="text-base text-surface-300">Start managing your team projects in minutes.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <label className="block text-sm font-medium text-surface-300 mb-2">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-primary-400 transition-colors" />
                <input id="register-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3.5 bg-surface-900/50 border border-surface-700 rounded-lg text-surface-100 placeholder-surface-500 focus-ring transition-all duration-300 text-base glass-light hover:border-surface-500"
                  placeholder="John Doe" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <label className="block text-sm font-medium text-surface-300 mb-2">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-primary-400 transition-colors" />
                <input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3.5 bg-surface-900/50 border border-surface-700 rounded-lg text-surface-100 placeholder-surface-500 focus-ring transition-all duration-300 text-base glass-light hover:border-surface-500"
                  placeholder="you@example.com" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <label className="block text-sm font-medium text-surface-300 mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-primary-400 transition-colors" />
                <input id="register-password" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className="w-full pl-10 pr-12 py-3.5 bg-surface-900/50 border border-surface-700 rounded-lg text-surface-100 placeholder-surface-500 focus-ring transition-all duration-300 text-base glass-light hover:border-surface-500"
                  placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-transform hover:scale-110">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="mt-2 h-1.5 w-full bg-surface-800 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full transition-all duration-300 flex-1 ${password.length >= 1 ? 'bg-danger' : ''}`} />
                  <div className={`h-full transition-all duration-300 flex-1 ${password.length >= 6 ? 'bg-warning' : ''}`} />
                  <div className={`h-full transition-all duration-300 flex-1 ${password.length >= 10 ? 'bg-success' : ''}`} />
                </div>
              )}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <button id="register-submit" type="submit" disabled={loading}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50 overflow-hidden relative ripple group">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create Account</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </motion.div>
          </form>

          <div className="mt-6 flex items-center gap-2 text-sm text-surface-500">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>Secure onboarding with role-based access controls.</span>
          </div>

          <p className="text-center text-sm text-surface-400 mt-7 lg:hidden">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition">Sign in</Link>
          </p>
        </section>
      </motion.div>
    </div>
  );
}
