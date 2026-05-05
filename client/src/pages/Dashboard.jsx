import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NoteContext';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { PenTool, BrainCircuit, Briefcase, Lightbulb } from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';

export default function Dashboard() {
  const { user } = useAuth();
  const { setActiveCategory, addNote } = useNotes();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setActiveCategory('All');
  }, [setActiveCategory]);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Divya';

  const handleStartChat = async (content, predefinedTitle = null) => {
    if (!content.trim() && !content.includes('<img')) return;
    setIsSubmitting(true);
    
    // Generate a title from content or use predefined
    let chatTitle = predefinedTitle;
    if (!chatTitle) {
      chatTitle = content.trim().split(' ').slice(0, 4).join(' ') || 'New Chat';
      if (chatTitle.length > 30) chatTitle = chatTitle.substring(0, 30) + '...';
    }

    // Append a random string to make it definitely unique
    const uniqueId = Math.random().toString(36).substring(2, 6);
    const finalCategory = `${chatTitle} - ${uniqueId}`;

    // Create the chat first so it immediately appears in sidebar and is persistent
    await createChat(finalCategory);

    // Then add the note to the newly created chat
    await addNote(content, finalCategory);
    
    setIsSubmitting(false);
    navigate(`/category/${encodeURIComponent(finalCategory)}`);
  };

  const handleCardClick = (promptText) => {
    handleStartChat(promptText);
  };

  return (
    <Layout title="Home">
      <div className="w-full max-w-[900px] mx-auto px-4 sm:px-8 mt-12 md:mt-24 mb-32 flex flex-col items-center md:items-start text-center md:text-left">
        
        {/* Gemini Greeting */}
        <h1 className="text-[44px] md:text-[56px] font-medium leading-tight mb-2 tracking-tight">
          <span className="gemini-gradient">Hello, {firstName}</span>
        </h1>
        <h2 className="text-[32px] md:text-[44px] font-medium text-[#444746] leading-tight mb-12 tracking-tight">
          How can I help you today?
        </h2>

        {/* Prompt Cards (Suggestions) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full">
          <button onClick={() => handleCardClick('Jot down a personal reflection or journal entry')} className="bg-gemini-surface hover:bg-gemini-surfaceHover transition-colors rounded-2xl p-4 flex flex-col justify-between h-[120px] md:h-[200px] group border border-transparent hover:border-[#444746] text-left">
            <p className="text-[15px] text-gemini-textMain leading-snug">Jot down a personal reflection or journal entry</p>
            <div className="w-8 h-8 rounded-full bg-gemini-bg flex items-center justify-center mt-auto self-end text-gemini-textMain group-hover:scale-110 transition-transform">
              <PenTool size={16} />
            </div>
          </button>
          
          <button onClick={() => handleCardClick('Brainstorm a new project or big idea')} className="bg-gemini-surface hover:bg-gemini-surfaceHover transition-colors rounded-2xl p-4 flex flex-col justify-between h-[120px] md:h-[200px] group border border-transparent hover:border-[#444746] text-left">
            <p className="text-[15px] text-gemini-textMain leading-snug">Brainstorm a new project or big idea</p>
            <div className="w-8 h-8 rounded-full bg-gemini-bg flex items-center justify-center mt-auto self-end text-gemini-textMain group-hover:scale-110 transition-transform">
              <Lightbulb size={16} />
            </div>
          </button>

          <button onClick={() => handleCardClick('Organize your work tasks and meeting notes')} className="bg-gemini-surface hover:bg-gemini-surfaceHover transition-colors rounded-2xl p-4 flex flex-col justify-between h-[120px] md:h-[200px] group border border-transparent hover:border-[#444746] text-left">
            <p className="text-[15px] text-gemini-textMain leading-snug">Organize your work tasks and meeting notes</p>
            <div className="w-8 h-8 rounded-full bg-gemini-bg flex items-center justify-center mt-auto self-end text-gemini-textMain group-hover:scale-110 transition-transform">
              <Briefcase size={16} />
            </div>
          </button>

          <button onClick={() => handleCardClick('Drop random thoughts and links for later')} className="bg-gemini-surface hover:bg-gemini-surfaceHover transition-colors rounded-2xl p-4 flex flex-col justify-between h-[120px] md:h-[200px] group border border-transparent hover:border-[#444746] text-left">
            <p className="text-[15px] text-gemini-textMain leading-snug">Drop random thoughts and links for later</p>
            <div className="w-8 h-8 rounded-full bg-gemini-bg flex items-center justify-center mt-auto self-end text-gemini-textMain group-hover:scale-110 transition-transform">
              <BrainCircuit size={16} />
            </div>
          </button>
        </div>

      </div>

      {/* Floating Bottom Input Bar */}
      <RichTextEditor onSave={handleStartChat} loading={isSubmitting} />
    </Layout>
  );
}
