import { useState, useRef, useEffect } from 'react';
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
  User as UserIcon,
  Search,
  FolderHeart,
  ChevronDown,
  Diamond
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
  const [chatToRename, setChatToRename] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewNotebookOpen, setIsNewNotebookOpen] = useState(false);
  const [isNewGemOpen, setIsNewGemOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const sortPinnedFirst = (items) => {
    return [...items].sort((a, b) => {
      if (a.isPinned === b.isPinned) return 0;
      return a.isPinned ? -1 : 1;
    });
  };

  const chatItems = chats.filter(chat => (chat.type === 'chat' || !chat.type));
  const notebookItems = chats.filter(chat => chat.type === 'notebook');
  const gemItems = chats.filter(chat => chat.type === 'gem');

  const filteredChats = sortPinnedFirst(chatItems.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  ));
  const filteredNotebooks = sortPinnedFirst(notebookItems.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  ));
  const filteredGems = sortPinnedFirst(gemItems.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  const handleLogout = () => {
    logout();
    setIsSignOutOpen(false);
    navigate('/');
  };



  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const handleCreateChat = async (e) => {
    e.preventDefault();
    if (!newChatName.trim()) return;
    
    const newChat = await createChat(newChatName.trim());
    if (newChat) {
      setIsNewChatOpen(false);
      setNewChatName('');
      navigate(`/chat/${newChat._id}`);
      if (window.innerWidth < 768) setIsOpen(false);
    }
  };

  const handleCreateItem = async (type) => {
    if (!newItemTitle.trim()) return;
    const item = await createChat(newItemTitle, type);
    if (item) {
      setNewItemTitle('');
      if (type === 'notebook') setIsNewNotebookOpen(false);
      if (type === 'gem') setIsNewGemOpen(false);
      navigate(`/chat/${item._id}`);
    }
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renameValue.trim() || !chatToRename) return;
    
    await renameChat(chatToRename._id, renameValue.trim());
    setIsRenameOpen(false);
    const renamedChatId = chatToRename._id;
    setChatToRename(null);
    setRenameValue('');
    navigate(`/chat/${renamedChatId}`);
  };

  const handleDeleteChat = async (chat) => {
    if (window.confirm(`Are you sure you want to delete "${chat.name}" and all its messages?`)) {
      await deleteChatHistory(chat._id);
      if (location.pathname === `/chat/${chat._id}`) {
        navigate('/');
      }
    }
    setActiveMenu(null);
  };

  const handleTogglePin = async (chat) => {
    await togglePinChat(chat._id);
    setActiveMenu(null);
  };

  // Ref to capture the 3-dot button position for the floating menu
  const menuButtonRefs = useRef({});
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleOpenMenu = (e, chatId) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeMenu === chatId) {
      setActiveMenu(null);
      return;
    }
    // Calculate position from the button
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.top,
      left: rect.left - 180, // Position to the left of the button
    });
    setActiveMenu(chatId);
  };

  const renderChatLink = (chat) => {
    if (!chat.name) return null;
    const path = `/chat/${chat._id}`;
    const isActive = location.pathname === path;
    
    return (
      <div key={chat._id} className="relative group">
        <Link
          to={path}
          onClick={handleLinkClick}
          className={cn(
            "flex items-center space-x-3 rounded-full transition-colors pr-10",
            isOpen ? "pl-4 py-2.5" : "w-11 h-11 justify-center mx-auto pr-0",
            isActive 
              ? "bg-gemini-surfaceHover text-gemini-primary font-medium" 
              : "text-gemini-textMuted hover:bg-gemini-surfaceHover hover:text-gemini-textMain"
          )}
          title={!isOpen ? chat.name : undefined}
        >
          {chat.type === 'notebook' ? (
            <Edit2 size={18} className="shrink-0 text-gemini-textMuted" />
          ) : chat.type === 'gem' ? (
            <Diamond size={18} className="shrink-0 text-gemini-primary" />
          ) : (
            <MessageSquare size={18} className="shrink-0" />
          )}
          {isOpen && (
            <div className="flex-1 flex items-center justify-between min-w-0">
              <span className="truncate text-[14px]">{chat.name}</span>
              {chat.isPinned && <Pin size={10} className="shrink-0 text-gemini-primary rotate-45 ml-2" />}
            </div>
          )}
        </Link>

        {/* Three Dots Menu Button */}
        {isOpen && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <button 
              onClick={(e) => handleOpenMenu(e, chat._id)}
              className={cn(
                "p-1.5 rounded-full text-gemini-textMuted hover:text-gemini-textMain hover:bg-gemini-border transition-all",
                activeMenu === chat._id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              <MoreVertical size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 bg-gemini-surface flex flex-col transition-all duration-300 ease-in-out",
        isOpen ? "w-[280px] translate-x-0" : "w-[68px] -translate-x-full md:translate-x-0",
        activeMenu ? "z-[100]" : "z-30"
      )}>
        <div className="flex-1 flex flex-col h-full overflow-hidden py-4 relative z-50">
          
          <div className="px-3 mb-4 flex items-center justify-between h-10">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-full hover:bg-gemini-surfaceHover transition-colors text-gemini-textMuted hover:text-gemini-textMain"
            >
              <Menu size={24} />
            </button>
            {isOpen && (
              <div className="flex-1 ml-2 flex items-center bg-gemini-surfaceHover rounded-full px-3 py-1.5 border border-[#444746] focus-within:border-gemini-primary transition-colors">
                <Search size={16} className="text-gemini-textMuted" />
                <input 
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-[13px] text-gemini-textMain pl-2 w-full"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-gemini-textMuted hover:text-gemini-textMain">
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* New Chat Pill */}
          <div className="px-3 mb-2">
            <button 
              onClick={() => {
                if (!user) {
                  if (window.confirm("Sign in to create your first chat!")) navigate('/login');
                } else {
                  setIsNewChatOpen(true);
                }
              }} 
              className={cn(
              "w-full flex items-center space-x-3 bg-gemini-pillBg hover:bg-gemini-surfaceHover transition-colors rounded-full text-gemini-textMuted hover:text-gemini-textMain font-medium",
              isOpen ? "px-4 py-3" : "h-11 justify-center p-0 mx-auto"
            )}>
              <Edit2 size={20} className="shrink-0" />
              {isOpen && <span className="text-[14px]">New chat</span>}
            </button>
          </div>

          {/* My Stuff */}
          <div className="px-3 mb-4">
            <button className={cn(
              "w-full flex items-center space-x-3 rounded-full transition-colors group text-gemini-textMuted hover:bg-gemini-surfaceHover hover:text-gemini-textMain",
              isOpen ? "px-4 py-2.5" : "w-11 h-11 justify-center mx-auto"
            )}>
              <FolderHeart size={18} className="shrink-0" />
              {isOpen && <span className="text-[14px] font-medium">My stuff</span>}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-6 relative z-50">

            {/* Notebooks Section */}
            <div>
              <div className="flex items-center justify-between px-4 mb-2">
                {isOpen && <span className="text-[13px] font-semibold text-gemini-textMain">Notebooks</span>}
                {isOpen && <ChevronDown size={14} className="text-gemini-textMuted" />}
              </div>
              <div className="space-y-1">
                <button 
                  onClick={() => setIsNewNotebookOpen(true)}
                  className={cn(
                    "w-full flex items-center space-x-3 rounded-full transition-colors group text-gemini-textMuted hover:bg-gemini-surfaceHover hover:text-gemini-textMain",
                    isOpen ? "px-4 py-2" : "w-11 h-11 justify-center mx-auto"
                  )}
                >
                  <Plus size={18} className="shrink-0" />
                  {isOpen && <span className="text-[13px]">New notebook</span>}
                </button>
                {filteredNotebooks.map((nb) => renderChatLink(nb))}
              </div>
            </div>

            {/* Gems Section */}
            <div>
              <div className="flex items-center justify-between px-4 mb-2">
                {isOpen && <span className="text-[13px] font-semibold text-gemini-textMain">Gems</span>}
                {isOpen && <ChevronDown size={14} className="text-gemini-textMuted" />}
              </div>
              <div className="space-y-1">
                <button 
                  onClick={() => setIsNewGemOpen(true)}
                  className={cn(
                    "w-full flex items-center space-x-3 rounded-full transition-colors group text-gemini-textMuted hover:bg-gemini-surfaceHover hover:text-gemini-textMain",
                    isOpen ? "px-4 py-2" : "w-11 h-11 justify-center mx-auto"
                  )}
                >
                  <Diamond size={18} className="shrink-0 text-gemini-primary" />
                  {isOpen && <span className="text-[13px]">New Gem Idea</span>}
                </button>
                {filteredGems.map((gem) => renderChatLink(gem))}
              </div>
            </div>

            {user ? (
              <>
                {/* Chats Section */}
                <div>
                  {isOpen && <div className="px-4 mb-2 text-[13px] font-semibold text-gemini-textMain">Chats</div>}
                  <nav className="space-y-1">
                    {filteredChats.map((chat) => renderChatLink(chat))}
                  </nav>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <div className="p-3 rounded-full bg-gemini-bg mb-3 border border-gemini-border">
                  <MessageSquare size={24} className="text-gemini-textMuted" />
                </div>
                {isOpen && <p className="text-xs text-gemini-textMuted">Sign in to save your work</p>}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="px-3 mt-auto pt-4 border-t border-gemini-border flex flex-col gap-1">
            <Link to="/settings" onClick={handleLinkClick} className={cn(
              "flex items-center space-x-3 rounded-full transition-colors group text-gemini-textMuted hover:bg-gemini-surfaceHover hover:text-gemini-textMain",
              isOpen ? "px-4 py-2.5" : "w-11 h-11 justify-center mx-auto"
            )} title={!isOpen ? "Settings and help" : undefined}>
              <Settings size={20} className="shrink-0" />
              {isOpen && <span className="text-[14px] font-medium">Settings and help</span>}
            </Link>
          </div>
        </div>
      </aside>

      {/* Global Overlay + Floating Context Menu */}
      {activeMenu && (
        <>
          <div 
            className="fixed inset-0 z-[150] bg-black/5"
            onClick={() => setActiveMenu(null)}
          />
          {/* Floating Context Menu - rendered above the overlay */}
          {(() => {
            const chat = chats.find(c => c._id === activeMenu);
            if (!chat) return null;
            return (
              <div 
                className="fixed w-44 bg-gemini-surface rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-[#444746] py-1.5 z-[200] animate-fade-in ring-1 ring-black/20"
                style={{ top: menuPosition.top, left: menuPosition.left }}
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleTogglePin(chat);
                  }}
                  className="w-full text-left px-4 py-2 text-[14px] text-gemini-textMain hover:bg-gemini-surfaceHover flex items-center space-x-2"
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
                  className="w-full text-left px-4 py-2 text-[14px] text-gemini-textMain hover:bg-gemini-surfaceHover flex items-center space-x-2"
                >
                  <Edit2 size={14} /> <span>Rename</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteChat(chat);
                  }}
                  className="w-full text-left px-4 py-2 text-[14px] text-[#d96570] hover:bg-gemini-surfaceHover flex items-center space-x-2 rounded-lg"
                >
                  <Trash2 size={14} /> <span>Delete</span>
                </button>
              </div>
            );
          })()}
        </>
      )}

      {/* New Chat Overlay */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
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
        <div 
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up"
          onClick={() => setIsRenameOpen(false)}
        >
          <div 
            className="bg-gemini-surface w-full max-w-md rounded-2xl p-6 border border-[#444746] shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
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
              <p className="text-lg font-semibold text-white mb-1">Sign out?</p>
              <p className="text-gemini-textMuted text-sm">Are you sure you want to sign out of BrainChat?</p>
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
      {/* New Notebook Overlay */}
      {isNewNotebookOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
          <div className="bg-gemini-surface w-full max-w-md rounded-2xl p-6 border border-[#444746] shadow-2xl relative">
            <button 
              onClick={() => setIsNewNotebookOpen(false)}
              className="absolute top-4 right-4 text-gemini-textMuted hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-medium text-white mb-6">Start New Notebook</h2>
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="e.g. My Next Story, Daily Journal..."
              className="w-full bg-gemini-bg border border-[#444746] rounded-xl px-4 py-3 text-white outline-none focus:border-gemini-primary transition-colors mb-6"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateItem('notebook')}
            />
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsNewNotebookOpen(false)}
                className="px-4 py-2 text-gemini-textMuted hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleCreateItem('notebook')}
                disabled={!newItemTitle.trim()}
                className="px-6 py-2 bg-gemini-primary hover:bg-gemini-primary/90 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Notebook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Gem Overlay */}
      {isNewGemOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
          <div className="bg-gemini-surface w-full max-w-md rounded-2xl p-6 border border-[#444746] shadow-2xl relative">
            <button 
              onClick={() => setIsNewGemOpen(false)}
              className="absolute top-4 right-4 text-gemini-textMuted hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-medium text-white mb-6 flex items-center">
              <Diamond size={24} className="text-gemini-primary mr-2" />
              Capture Brain Gem
            </h2>
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="What's the core idea?"
              className="w-full bg-gemini-bg border border-[#444746] rounded-xl px-4 py-3 text-white outline-none focus:border-gemini-primary transition-colors mb-6"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateItem('gem')}
            />
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsNewGemOpen(false)}
                className="px-4 py-2 text-gemini-textMuted hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleCreateItem('gem')}
                disabled={!newItemTitle.trim()}
                className="px-6 py-2 bg-gemini-primary hover:bg-gemini-primary/90 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(138,180,248,0.3)]"
              >
                Save Gem
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
