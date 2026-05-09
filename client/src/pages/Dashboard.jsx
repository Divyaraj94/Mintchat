import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NoteContext';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { PenTool, BrainCircuit, Briefcase, Lightbulb } from 'lucide-react';
import { cn } from '../utils/cn';
import RichTextEditor from '../components/RichTextEditor';

export default function Dashboard() {
  const { user } = useAuth();
  const { setActiveCategory, setActiveChatId, addNote, createChat } = useNotes();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setActiveCategory('All');
    setActiveChatId(null);
  }, [setActiveCategory, setActiveChatId]);

  const firstName = (user?.name || user?.username || 'Guest').split(' ')[0];

  const handleStartChat = async (content, predefinedTitle = null, type = 'chat') => {
    if (!content.trim() && !content.includes('<img')) return;
    
    if (!user) {
      if (window.confirm("You need to be signed in to start a new chat. Would you like to sign in now?")) {
        navigate('/login');
      }
      return;
    }

    setIsSubmitting(true);
    
    let chatTitle = predefinedTitle;
    if (!chatTitle) {
      chatTitle = content.trim().split(' ').slice(0, 4).join(' ') || 'New Chat';
      if (chatTitle.length > 30) chatTitle = chatTitle.substring(0, 30) + '...';
    }

    const uniqueId = Math.random().toString(36).substring(2, 6);
    const finalTitle = `${chatTitle} - ${uniqueId}`;

    const newChat = await createChat(finalTitle, type);
    if (newChat) {
      await addNote(content, newChat._id);
      setIsSubmitting(false);
      navigate(`/chat/${newChat._id}`);
    } else {
      setIsSubmitting(false);
    }
  };

  const handleCardClick = (promptText, type = 'chat') => {
    handleStartChat(promptText, null, type);
  };

  return (
    <Layout title="Home">
      <div className="w-full max-w-[900px] mx-auto px-4 sm:px-8 mt-12 md:mt-24 mb-32 flex flex-col items-center md:items-start text-center md:text-left">
        
        {/* Gemini Greeting */}
        <div className="mb-12">
          <h1 className="text-[44px] md:text-[56px] font-medium leading-tight tracking-tight mb-2">
            <span className="gemini-gradient">Hi {firstName}</span>
          </h1>
          <h2 className="text-[32px] md:text-[44px] font-medium text-gemini-textMuted leading-tight tracking-tight">
            Where should we start?
          </h2>
        </div>
 
        {/* Prompt Chips (BrainChat Style) */}
        <div className="flex flex-wrap gap-3 w-full justify-center md:justify-start">
          <button 
            onClick={() => handleCardClick('Start a new story about...', 'notebook')} 
            className="flex items-center space-x-2 px-4 py-2.5 bg-gemini-surface hover:bg-gemini-surfaceHover rounded-full border border-[#444746] transition-all group"
          >
            <span className="text-[#f87171] group-hover:scale-110 transition-transform">✍️</span>
            <span className="text-[14px] text-gemini-textMain">Start a story</span>
          </button>

          <button 
            onClick={() => handleCardClick('Valuable idea: ', 'gem')} 
            className="flex items-center space-x-2 px-4 py-2.5 bg-gemini-surface hover:bg-gemini-surfaceHover rounded-full border border-amber-400/30 transition-all group shadow-[0_0_10px_rgba(251,191,36,0.05)]"
          >
            <span className="text-[#fbbf24] group-hover:scale-110 transition-transform">💎</span>
            <span className="text-[14px] text-gemini-textMain">Capture a Gem</span>
          </button>

          <button 
            onClick={() => handleCardClick('Today\'s work goals:', 'notebook')} 
            className="flex items-center space-x-2 px-4 py-2.5 bg-gemini-surface hover:bg-gemini-surfaceHover rounded-full border border-[#444746] transition-all group"
          >
            <span className="text-[#60a5fa] group-hover:scale-110 transition-transform">📅</span>
            <span className="text-[14px] text-gemini-textMain">Plan my work</span>
          </button>

          <button 
            onClick={() => handleCardClick('Just a quick thought...', 'chat')} 
            className="flex items-center space-x-2 px-4 py-2.5 bg-gemini-surface hover:bg-gemini-surfaceHover rounded-full border border-[#444746] transition-all group"
          >
            <span className="text-[#a78bfa] group-hover:scale-110 transition-transform">💭</span>
            <span className="text-[14px] text-gemini-textMain">Quick thought</span>
          </button>
        </div>

      </div>

      {/* Floating Bottom Input Bar */}
      <RichTextEditor onSave={handleStartChat} loading={isSubmitting} />
    </Layout>
  );
}
