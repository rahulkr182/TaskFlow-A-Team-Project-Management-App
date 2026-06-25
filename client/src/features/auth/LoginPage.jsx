import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, Layers, Clock3, Users } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 p-4 sm:p-8 flex items-center justify-center lg:-translate-y-14 relative overflow-hidden">
      {/* Animated ambient background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/20 blur-[120px] animate-ambient" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-purple/20 blur-[120px] animate-ambient" style={{ animationDelay: '2s' }} />

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
            <h1 className="text-[2.25rem] leading-tight font-semibold text-surface-100">Ship Projects Faster</h1>
            <p className="mt-4 text-lg text-surface-300 max-w-md">
              A focused workspace for planning, execution, and team communication.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <Layers className="w-4 h-4 text-primary-400 mt-1" />
              <p className="text-base text-surface-200">Structured boards with clear ownership and priorities.</p>
            </div>
            <div className="flex items-start gap-3">
              <Clock3 className="w-4 h-4 text-primary-400 mt-1" />
              <p className="text-base text-surface-200">Live updates and deadlines that keep work moving.</p>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-primary-400 mt-1" />
              <p className="text-base text-surface-200">Collaboration that scales from small teams to large orgs.</p>
            </div>
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
            <div className="ml-auto flex rounded-lg bg-surface-800 p-1 border border-surface-700 gap-1">
              <span className="px-5 py-2.5 text-sm font-semibold rounded-md bg-surface-700 text-surface-100">Sign In</span>
              <Link to="/register" className="px-5 py-2.5 text-sm font-medium rounded-md text-surface-400 hover:text-surface-200">Register</Link>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-4xl font-semibold tracking-tight text-surface-100">Welcome back</h2>
            <p className="text-base text-surface-300">Sign in to continue to your workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3.5 bg-surface-900/50 border border-surface-700 rounded-lg text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300 text-base glass-light hover:border-surface-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3.5 bg-surface-900/50 border border-surface-700 rounded-lg text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300 text-base glass-light hover:border-surface-500"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-2 text-sm text-surface-500">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>Token-based auth with secure session refresh.</span>
          </div>

          <p className="text-center text-sm text-surface-400 mt-7 lg:hidden">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition">
              Create one
            </Link>
          </p>
        </section>
      </motion.div>
    </div>
  );
}
