import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { BrainCircuit, ArrowRight, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await forgotPassword(email);
      setSuccess(data.message || 'Reset link sent. Check your email or the server console for the preview link.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gemini-bg p-4 font-sans text-gemini-textMain relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#4285f4]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center mb-8 relative z-10 flex flex-col items-center">
        <div className="w-12 h-12 bg-gemini-surface rounded-full shadow-sm flex items-center justify-center mb-4 border border-gemini-border">
          <Mail className="text-gemini-textMain" size={24} />
        </div>
        <h1 className="text-2xl font-semibold mb-2 tracking-tight">Reset Password</h1>
        <p className="text-gemini-textMuted text-sm max-w-xs text-center">Enter your email address and we'll send you a link to reset your password.</p>
      </div>

      <div className="w-full max-w-md bg-gemini-surface rounded-2xl shadow-xl p-8 relative z-10 border border-gemini-border">
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
            <p className="text-gemini-textMuted text-sm">{success}</p>
            <p className="text-[11px] text-[#5f6368]">💡 During development, check the server console for the Ethereal email preview link.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gemini-textMuted mb-1.5 uppercase tracking-wider">Email address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gemini-bg border border-gemini-border focus:border-[#4285f4] outline-none transition-all text-sm text-gemini-textMain placeholder:text-[#5f6368]"
                  placeholder="hello@mindchat.ai"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5f6368] pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d3e3fd] hover:bg-[#b4cffb] text-[#041e49] text-sm font-medium py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {loading ? <span className="animate-pulse">Sending...</span> : <><span>Send Reset Link</span><ArrowRight size={18} /></>}
            </button>
          </form>
        )}
      </div>

      <p className="mt-8 text-sm text-gemini-textMuted relative z-10">
        Remembered your password?{' '}
        <Link to="/login" className="text-[#4285f4] hover:underline font-medium">Sign in</Link>
      </p>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-[#444746]"></div>
    </div>
  );
}
