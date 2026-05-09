import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { LogOut, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

export default function TopNav({ title }) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <header className="h-16 px-4 flex items-center justify-between bg-gemini-bg absolute top-0 w-full z-20">
      
      {/* Left: Branding */}
      <Link to="/" className="flex items-center space-x-2 group">
        <span className="text-[20px] font-medium text-gemini-textMain pl-2 select-none group-hover:text-gemini-primary transition-colors">BrainChat</span>
      </Link>

      {/* Right Area */}
      <div className="flex items-center space-x-3 pr-2">
        {user ? (
          /* Logged In: Profile with Dropdown */
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-gemini-primary to-[#d96570] flex items-center justify-center cursor-pointer shadow-sm overflow-hidden border border-white/10"
            >
              {user?.picture ? (
                <img src={user.picture} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-semibold">{user?.username ? user.username[0].toUpperCase() : 'D'}</span>
              )}
            </button>

            {isOpen && (
              <div className="absolute right-0 top-11 w-56 bg-gemini-surface rounded-2xl shadow-2xl border border-gemini-border py-2 z-50 animate-fade-in-up">
                <div className="px-4 py-3 border-b border-gemini-border mb-1">
                  <p className="text-sm font-semibold text-gemini-textMain truncate">{user?.username}</p>
                  <p className="text-xs text-gemini-textMuted truncate">{user?.email}</p>
                </div>
                
                <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 px-4 py-2 text-sm text-gemini-textMain hover:bg-gemini-surfaceHover transition-colors">
                  <SettingsIcon size={16} />
                  <span>Settings</span>
                </Link>
                
                <button onClick={() => navigate('/login')} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gemini-textMain hover:bg-gemini-surfaceHover transition-colors">
                  <UserIcon size={16} />
                  <span>Switch Account</span>
                </button>
                
                <div className="h-px bg-gemini-border my-1 mx-2" />
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-[#d96570] hover:bg-[#d96570]/10 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Guest: Sign In and Signup Buttons */
          <div className="flex items-center space-x-2">
            <Link 
              to="/login" 
              className="px-4 py-2 text-sm font-medium text-gemini-textMain hover:bg-gemini-surfaceHover rounded-full transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="px-4 py-2 text-sm font-medium bg-gemini-primary text-black rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/10"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
