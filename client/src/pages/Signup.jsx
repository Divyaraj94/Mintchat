import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, EyeOff, Eye, ArrowRight } from 'lucide-react';

// Simple password strength checker (no external lib needed)
function getPasswordStrength(password) {
  let score = 0;
  if (!password) return { score: 0, label: '', color: '' };
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: '#d96570', width: '20%' };
  if (score === 2) return { score: 2, label: 'Fair', color: '#f59e0b', width: '40%' };
  if (score === 3) return { score: 3, label: 'Good', color: '#3b82f6', width: '65%' };
  if (score === 4) return { score: 4, label: 'Strong', color: '#10b981', width: '85%' };
  return { score: 5, label: 'Very Strong', color: '#10b981', width: '100%' };
}

// Inline Google SVG
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);
  const { signup, googleAuth } = useAuth();
  const navigate = useNavigate();

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (strength.score < 3) {
      setError('Password is too weak. Use uppercase, numbers, and symbols.');
      return;
    }
    setValidating(true);
    try {
      await signup(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign up');
    } finally {
      setValidating(false);
    }
  };

  const handleGoogleSignup = () => {
    // Opens a mock Google popup. Replace with real @react-oauth/google flow once you have a Client ID.
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      setError('Google Sign-In is not configured yet. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
      return;
    }
    // Real implementation would use: google.accounts.id.initialize and prompt()
    setError('Please configure VITE_GOOGLE_CLIENT_ID to enable Google Sign-In.');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gemini-bg p-4 font-sans text-gemini-textMain relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#4285f4]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center mb-8 relative z-10 flex flex-col items-center">
        <div className="w-12 h-12 bg-gemini-surface rounded-full shadow-sm flex items-center justify-center mb-4 border border-[#444746]">
          <BrainCircuit className="text-gemini-textMain" size={24} />
        </div>
        <h1 className="text-3xl font-semibold mb-2 tracking-tight gemini-gradient">MindChat</h1>
        <p className="text-gemini-textMuted text-sm">Create your mindful space</p>
      </div>

      <div className="w-full max-w-md bg-gemini-surface rounded-2xl shadow-xl p-8 relative z-10 border border-[#444746]">
        {error && (
          <div className="bg-[#d96570]/10 text-[#d96570] p-3 rounded-lg text-sm mb-5 text-center border border-[#d96570]/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-gemini-textMuted mb-1.5 uppercase tracking-wider">Username</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gemini-bg border border-[#444746] focus:border-[#4285f4] outline-none transition-all text-sm text-gemini-textMain placeholder:text-[#5f6368]"
                placeholder="johndoe"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5f6368] pointer-events-none">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gemini-textMuted mb-1.5 uppercase tracking-wider">Email address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gemini-bg border border-[#444746] focus:border-[#4285f4] outline-none transition-all text-sm text-gemini-textMain placeholder:text-[#5f6368]"
                placeholder="hello@yourmail.com"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5f6368] pointer-events-none">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gemini-textMuted mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-gemini-bg border border-[#444746] focus:border-[#4285f4] outline-none transition-all text-sm text-gemini-textMain placeholder:text-[#5f6368]"
                placeholder="Min 8 chars, uppercase, numbers, symbols"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5f6368] pointer-events-none">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5f6368] hover:text-gemini-textMain transition-colors">
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {password && (
              <div className="mt-2.5">
                <div className="w-full h-1.5 bg-[#333537] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: strength.width, backgroundColor: strength.color }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  <div className="flex gap-1.5">
                    <span className="text-[11px] text-[#5f6368]">Strength:</span>
                    <span className="text-[11px] font-semibold" style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                  <span className="text-[10px] text-[#5f6368]">
                    {strength.score < 3 ? 'Add uppercase, numbers & symbols' : 'Looking good!'}
                  </span>
                </div>
                <div className="flex gap-1 mt-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ backgroundColor: s <= strength.score ? strength.color : '#333537' }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={validating}
            className="w-full bg-[#d3e3fd] hover:bg-[#b4cffb] text-[#041e49] text-sm font-medium py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 mt-4 disabled:opacity-60"
          >
            {validating ? (
              <span className="animate-pulse">Validating email...</span>
            ) : (
              <><span>Create Account</span><ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-4">
          <div className="h-px bg-[#444746] flex-1" />
          <span className="text-[10px] uppercase text-[#5f6368] tracking-wider font-medium">OR</span>
          <div className="h-px bg-[#444746] flex-1" />
        </div>

        <button
          onClick={handleGoogleSignup}
          className="mt-4 w-full border border-[#444746] hover:bg-gemini-surfaceHover bg-transparent text-sm font-medium py-3 rounded-xl transition-colors flex items-center justify-center space-x-3 text-gemini-textMain"
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>
      </div>

      <p className="mt-8 text-sm text-gemini-textMuted relative z-10">
        Already have an account?{' '}
        <Link to="/login" className="text-[#4285f4] hover:underline font-medium">Sign in</Link>
      </p>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-[#444746]"></div>
    </div>
  );
}
