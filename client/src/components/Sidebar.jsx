import { useState } from 'react';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NoteContext';
import { 
  Plus,
  MessageSquare,
  Settings,
  HelpCircle,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  Pin,
  PinOff,
  Menu,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const { chats, createChat, renameChat, deleteChatHistory, togglePinChat } = useNotes();
  const location = useLocation();
  const navigate = useNavigate();

  // Overlays state
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  
  // Context Menu State
  const [activeMenu, setActiveMenu] = useState(null); // chat._id
  
  // Rename State
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [chatToRename, setChatToRename] = useState(null); // chat object
  const [renameValue, setRenameValue] = useState('');

  // Sign Out Confirmation
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsSignOutOpen(false);
    navigate('/');
  };

  const pinnedChats = chats.filter(c => c.isPinned);
  const recentChats = chats.filter(c => !c.isPinned);

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const handleCreateChat = async (e) => {
    e.preventDefault();
    if (!newChatName.trim()) return;
    
    await createChat(newChatName.trim());
    setIsNewChatOpen(false);
    setNewChatName('');
    navigate(`/category/${encodeURIComponent(newChatName.trim())}`);
    if (window.innerWidth < 768) setIsOpen(false);
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renameValue.trim() || !chatToRename) return;
    
    await renameChat(chatToRename._id, renameValue.trim());
    setIsRenameOpen(false);
    setChatToRename(null);
    setRenameValue('');
    navigate(`/category/${encodeURIComponent(renameValue.trim())}`);
  };

  const handleDeleteChat = async (chat) => {
    if (window.confirm(`Are you sure you want to delete "${chat.name}" and all its messages?`)) {
      await deleteChatHistory(chat._id);
      if (location.pathname === `/category/${encodeURIComponent(chat.name)}`) {
        navigate('/');
      }
    }
    setActiveMenu(null);
  };

  const handleTogglePin = async (chat) => {
    await togglePinChat(chat._id);
    setActiveMenu(null);
  };

  const renderChatLink = (chat) => {
    if (!chat.name) return null;
    const path = `/category/${encodeURIComponent(chat.name)}`;
    const isActive = location.pathname === path;
    
    return (
      <div key={chat._id} className="relative group">
        <Link
          to={path}
          onClick={handleLinkClick}
          className={cn(
            "flex items-center space-x-3 rounded-full transition-colors pr-10",
            isOpen ? "px-4 py-2.5" : "w-11 h-11 justify-center mx-auto pr-0",
            isActive 
              ? "bg-gemini-surfaceHover text-gemini-primary font-medium" 
              : "text-gemini-textMuted hover:bg-gemini-surfaceHover hover:text-gemini-textMain"
          )}
          title={!isOpen ? chat.name : undefined}
        >
          <MessageSquare size={18} className="shrink-0" />
          {isOpen && <span className="truncate text-[14px]">{chat.name}</span>}
        </Link>

        {/* Three Dots Menu Button */}
        {isOpen && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveMenu(activeMenu === chat._id ? null : chat._id);
            }}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gemini-textMuted hover:text-gemini-textMain hover:bg-gemini-border transition-all",
              activeMenu === chat._id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <MoreVertical size={16} />
          </button>
        )}

        {/* Context Menu Dropdown */}
        {activeMenu === chat._id && isOpen && (
          <div className="absolute right-2 top-10 w-40 bg-[#282a2c] rounded-xl shadow-lg border border-[#444746] py-1.5 z-[100]">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTogglePin(chat);
              }}
              className="w-full text-left px-4 py-2 text-[14px] text-gemini-textMain hover:bg-[#333537] flex items-center space-x-2"
            >
              {chat.isPinned ? <PinOff size={14} /> : <Pin size={14} />} 
              <span>{chat.isPinned ? 'Unpin' : 'Pin'}</span>
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setChatToRename(chat);
                setRenameValue(chat.name);
                setIsRenameOpen(true);
                setActiveMenu(null);
              }}
              className="w-full text-left px-4 py-2 text-[14px] text-gemini-textMain hover:bg-[#333537] flex items-center space-x-2"
            >
              <Edit2 size={14} /> <span>Rename</span>
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteChat(chat);
              }}
              className="w-full text-left px-4 py-2 text-[14px] text-[#d96570] hover:bg-[#333537] flex items-center space-x-2"
            >
              <Trash2 size={14} /> <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-30 bg-gemini-surface flex flex-col transition-all duration-300 ease-in-out",
        isOpen ? "w-[280px] translate-x-0" : "w-[68px] -translate-x-full md:translate-x-0"
      )}>
        {/* Dismiss context menu when clicking outside - MOVED INSIDE ASIDE */}
        {activeMenu && (
          <div 
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(null);
            }}
          />
        )}

        <div className="flex-1 flex flex-col h-full overflow-hidden py-4 relative z-50">
          
          <div className="px-3 mb-4 flex items-center h-10">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "p-2.5 rounded-full hover:bg-gemini-surfaceHover transition-colors text-gemini-textMuted hover:text-gemini-textMain",
                !isOpen && "mx-auto"
              )}
            >
              <Menu size={24} />
            </button>
          </div>

          {/* New Chat Pill */}
          <div className="px-3 mb-6">
            <button 
              onClick={() => setIsNewChatOpen(true)} 
              className={cn(
              "w-full flex items-center space-x-3 bg-gemini-pillBg hover:bg-gemini-surfaceHover transition-colors rounded-full text-gemini-textMuted hover:text-gemini-textMain font-medium",
              isOpen ? "px-4 py-3" : "h-11 justify-center p-0 mx-auto"
            )}>
              <Plus size={20} className="shrink-0" />
              {isOpen && <span className="text-[14px]">New chat</span>}
            </button>
          </div>

          {/* Pinned Chats */}
          {isOpen && pinnedChats.length > 0 && (
            <div className="px-4 pb-2 mt-2">
              <span className="text-[13px] font-medium text-gemini-textMain ml-3">Pinned</span>
            </div>
          )}
          
          {pinnedChats.length > 0 && (
            <div className="px-3 mb-2">
              <nav className="space-y-1">
                {pinnedChats.map((chat) => renderChatLink(chat))}
              </nav>
            </div>
          )}

          {/* Recent Chats */}
          {isOpen && recentChats.length > 0 && (
            <div className="px-4 pb-2 mt-2">
              <span className="text-[13px] font-medium text-gemini-textMain ml-3">Recent</span>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto px-3 relative z-50">
            <nav className="space-y-1 relative z-50">
              {recentChats.map((chat) => renderChatLink(chat))}
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="px-3 mt-auto pt-4 flex flex-col gap-1">
            <Link to="/settings" onClick={handleLinkClick} className={cn(
              "flex items-center space-x-3 rounded-full transition-colors group text-gemini-textMuted hover:bg-gemini-surfaceHover hover:text-gemini-textMain",
              isOpen ? "px-4 py-2.5" : "w-11 h-11 justify-center mx-auto"
            )} title={!isOpen ? "Settings" : undefined}>
              <Settings size={20} className="shrink-0" />
              {isOpen && <span className="text-[14px] font-medium">Settings</span>}
            </Link>
            <button className={cn(
              "flex items-center space-x-3 rounded-full transition-colors group text-gemini-textMuted hover:bg-gemini-surfaceHover hover:text-gemini-textMain",
              isOpen ? "px-4 py-2.5" : "w-11 h-11 justify-center mx-auto"
            )} title={!isOpen ? "Help" : undefined}>
              <HelpCircle size={20} className="shrink-0" />
              {isOpen && <span className="text-[14px] font-medium">Help</span>}
            </button>

            <div className="h-px bg-[#444746] my-2 mx-2"></div>
            
            {user ? (
              <button 
                onClick={() => setIsSignOutOpen(true)} 
                className={cn(
                  "flex items-center space-x-3 rounded-full transition-colors group text-[#d96570] hover:bg-[#d96570]/10",
                  isOpen ? "px-4 py-2.5" : "w-11 h-11 justify-center mx-auto"
                )} 
                title={!isOpen ? "Sign Out" : undefined}
              >
                <LogOut size={20} className="shrink-0" />
                {isOpen && <span className="text-[14px] font-medium">Sign Out</span>}
              </button>
            ) : (
              <Link 
                to="/login" 
                className={cn(
                  "flex items-center space-x-3 rounded-full transition-colors group text-gemini-primary hover:bg-gemini-surfaceHover",
                  isOpen ? "px-4 py-2.5" : "w-11 h-11 justify-center mx-auto"
                )} 
                title={!isOpen ? "Sign In" : undefined}
              >
                <UserIcon size={20} className="shrink-0" />
                {isOpen && <span className="text-[14px] font-medium">Sign In</span>}
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* New Chat Overlay */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
          <div className="bg-gemini-surface w-full max-w-md rounded-2xl p-6 border border-[#444746] shadow-2xl relative">
            <button 
              onClick={() => setIsNewChatOpen(false)}
              className="absolute top-4 right-4 text-gemini-textMuted hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-medium text-white mb-6">Create New Chat</h2>
            <form onSubmit={handleCreateChat}>
              <div className="mb-6">
                <label className="block text-gemini-textMuted text-sm mb-2">Chat Name / Heading</label>
                <input 
                  type="text"
                  autoFocus
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  className="w-full bg-gemini-bg border border-[#444746] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gemini-primary transition-colors"
                  placeholder="e.g. Project Brainstorm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsNewChatOpen(false)}
                  className="px-5 py-2.5 rounded-full text-gemini-textMain hover:bg-gemini-surfaceHover transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-gemini-primary text-black hover:opacity-90 transition-opacity font-medium"
                >
                  Create Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Overlay */}
      {isRenameOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
          <div className="bg-gemini-surface w-full max-w-md rounded-2xl p-6 border border-[#444746] shadow-2xl relative">
            <button 
              onClick={() => setIsRenameOpen(false)}
              className="absolute top-4 right-4 text-gemini-textMuted hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-medium text-white mb-6">Rename Chat</h2>
            <form onSubmit={handleRenameSubmit}>
              <div className="mb-6">
                <input 
                  type="text"
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full bg-gemini-bg border border-[#444746] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gemini-primary transition-colors"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsRenameOpen(false)}
                  className="px-5 py-2.5 rounded-full text-gemini-textMain hover:bg-gemini-surfaceHover transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-gemini-primary text-black hover:opacity-90 transition-opacity font-medium"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {isSignOutOpen && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
          <div className="bg-gemini-surface w-full max-w-sm rounded-2xl p-6 border border-[#444746] shadow-2xl relative">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[#d96570]/10 border border-[#d96570]/20 flex items-center justify-center mb-4">
                <LogOut size={24} className="text-[#d96570]" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">Sign out?</h2>
              <p className="text-gemini-textMuted text-sm">Are you sure you want to sign out of MindChat?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsSignOutOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-full text-gemini-textMain hover:bg-gemini-surfaceHover transition-colors font-medium text-sm border border-[#444746]"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-full bg-[#d96570] hover:bg-[#c0555f] text-white transition-colors font-medium text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
