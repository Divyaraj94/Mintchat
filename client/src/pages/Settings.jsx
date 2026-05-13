import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  User, 
  Mail, 
  Moon, 
  Sun, 
  ChevronRight, 
  Shield, 
  Bell, 
  Palette,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import Layout from '../components/Layout';

export default function Settings() {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const SettingItem = ({ icon: Icon, label, value, onClick, children }) => (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-4 rounded-2xl bg-gemini-bg border border-gemini-border transition-all",
        onClick ? "cursor-pointer hover:bg-gemini-surfaceHover hover:border-[#5f6368]" : ""
      )}
    >
      <div className="flex items-center space-x-4">
        <div className="p-2.5 rounded-xl bg-gemini-surface border border-gemini-border text-gemini-textMuted group-hover:text-gemini-textMain">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm font-medium text-gemini-textMain">{label}</p>
          {value && <p className="text-xs text-gemini-textMuted">{value}</p>}
        </div>
      </div>
      {children || (onClick && <ChevronRight size={18} className="text-gemini-textMuted" />)}
    </div>
  );

  return (
    <Layout title="Settings">
      <div className="w-full flex flex-col h-full bg-gemini-bg overflow-hidden relative">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gemini-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Top Nav Bar */}
          <div className="sticky top-0 z-20 bg-gemini-bg/80 backdrop-blur-md px-6 py-4 border-b border-gemini-border">
            <div className="max-w-2xl mx-auto flex items-center">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gemini-textMuted hover:text-gemini-textMain transition-colors group"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Chat</span>
              </button>
            </div>
          </div>

          <div className="max-w-2xl mx-auto py-6 px-6 space-y-10">
            
            {/* Profile Section */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gemini-textMuted mb-4 px-1">Account Profile</h2>
            <div className="space-y-3">
              <div className="bg-gemini-surface rounded-3xl p-6 border border-gemini-border shadow-xl relative overflow-hidden group">
                <div className="flex items-center space-x-4 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-gemini-primary/20 flex items-center justify-center text-gemini-primary font-bold text-xl border border-gemini-primary/30 overflow-hidden shadow-inner">
                    {user?.picture ? (
                      <img src={user.picture} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user?.username?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gemini-textMain">{user?.username}</h3>
                    <p className="text-sm text-gemini-textMuted">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              <SettingItem 
                icon={Mail} 
                label="Email Address" 
                value={user?.email} 
              />
            </div>
          </section>

          {/* Appearance Section */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gemini-textMuted mb-4 px-1">Appearance</h2>
            <div className="space-y-3">
              <SettingItem 
                icon={isDarkMode ? Moon : Sun} 
                label="Display Theme" 
                value={isDarkMode ? "Dark Mode" : "Light Mode"}
                onClick={toggleTheme}
              >
                <div 
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer",
                    isDarkMode ? "bg-gemini-primary" : "bg-[#444746]"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                      isDarkMode ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </div>
              </SettingItem>
              
              <SettingItem 
                icon={Palette} 
                label="Custom Colors" 
                value="Coming Soon" 
                onClick={() => {}}
              />
            </div>
          </section>

            {/* Security & System */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gemini-textMuted mb-4 px-1">System & Security</h2>
              <div className="space-y-3">
                <SettingItem 
                  icon={Shield} 
                  label="Security & Password" 
                  value="Manage your account security"
                  onClick={() => {}}
                />
                <SettingItem 
                  icon={Bell} 
                  label="Notifications" 
                  value="Manage alert settings"
                  onClick={() => {}}
                />
              </div>
            </section>

            <div className="pt-10 pb-20 text-center">
              <p className="text-xs text-gemini-textMuted">BrainChat Version 1.0.0</p>
              <p className="text-[10px] text-gemini-textMuted mt-1 uppercase tracking-tighter">Powered by Gemini Architecture</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
