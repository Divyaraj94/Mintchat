import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { KeyRound, EyeOff, Eye, ArrowRight, CheckCircle } from 'lucide-react';

function getPasswordStrength(password) {
  let score = 0;
  if (!password) return { score: 0, label: '', color: '', width: '0%' };
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

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (strength.score < 3) {
      setError('Password is too weak. Use uppercase, numbers, and symbols.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gemini-bg p-4 font-sans text-gemini-textMain relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#4285f4]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center mb-8 relative z-10 flex flex-col items-center">
        <div className="w-12 h-12 bg-gemini-surface rounded-full shadow-sm flex items-center justify-center mb-4 border border-[#444746]">
          <KeyRound className="text-gemini-textMain" size={24} />
        </div>
        <h1 className="text-2xl font-semibold mb-2 tracking-tight">Set New Password</h1>
        <p className="text-gemini-textMuted text-sm">Choose a strong password for your account.</p>
      </div>

      <div className="w-full max-w-md bg-gemini-surface rounded-2xl shadow-xl p-8 relative z-10 border border-[#444746]">
        {error && (
          <div className="bg-[#d96570]/10 text-[#d96570] p-3 rounded-lg text-sm mb-5 text-center border border-[#d96570]/20">
            {error}
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center border border-[#10b981]/20">
              <CheckCircle size={32} className="text-[#10b981]" />
            </div>
            <p className="text-gemini-textMuted text-sm">Password reset successfully! Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-medium text-gemini-textMuted mb-1.5 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-gemini-bg border border-[#444746] focus:border-[#4285f4] outline-none transition-all text-sm text-gemini-textMain placeholder:text-[#5f6368]"
                  placeholder="Enter new password"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5f6368] pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5f6368] hover:text-gemini-textMain transition-colors">
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              {password && (
                <div className="mt-2.5">
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div key={s} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ backgroundColor: s <= strength.score ? strength.color : '#333537' }} />
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[11px] font-semibold" style={{ color: strength.color }}>{strength.label}</span>
                    <span className="text-[10px] text-[#5f6368]">{strength.score < 3 ? 'Too weak' : 'Good to go!'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-gemini-textMuted mb-1.5 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gemini-bg border outline-none transition-all text-sm text-gemini-textMain placeholder:text-[#5f6368] ${
                    confirm && confirm !== password ? 'border-[#d96570]' : 'border-[#444746] focus:border-[#4285f4]'
                  }`}
                  placeholder="Re-enter new password"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5f6368] pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
              </div>
              {confirm && confirm !== password && (
                <p className="text-[11px] text-[#d96570] mt-1.5">Passwords don't match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d3e3fd] hover:bg-[#b4cffb] text-[#041e49] text-sm font-medium py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 mt-4 disabled:opacity-60"
            >
              {loading ? <span className="animate-pulse">Resetting...</span> : <><span>Reset Password</span><ArrowRight size={18} /></>}
            </button>
          </form>
        )}
      </div>

      <p className="mt-8 text-sm text-gemini-textMuted relative z-10">
        <Link to="/login" className="text-[#4285f4] hover:underline font-medium">← Back to Sign In</Link>
      </p>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-[#444746]"></div>
    </div>
  );
}
