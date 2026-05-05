import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useNotes } from '../context/NoteContext';
import { extractTags } from '../utils/formatters';
import { Trash2, User as UserIcon } from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';

export default function CategoryView() {
  const { categoryId } = useParams();
  const { notes, setActiveCategory, addNote, deleteNote, loading, searchQuery } = useNotes();
  const messagesEndRef = useRef(null);
  
  const title = categoryId ? categoryId.charAt(0).toUpperCase() + categoryId.slice(1) : 'Home';

  useEffect(() => {
    setActiveCategory(title);
  }, [title, setActiveCategory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notes]);

  const handleSave = async (content) => {
    if (!content.trim()) return;
    await addNote(content, title);
  };

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    return note.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedNotes = filteredNotes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <Layout title={title}>
      <div className="w-full max-w-[800px] mx-auto px-4 sm:px-8 pt-20 pb-32 flex flex-col">
        
        {/* Chat History View */}
        <div className="flex-1 flex flex-col justify-end space-y-6 mt-8">
          {loading && notes.length === 0 && (
            <div className="flex justify-center text-gemini-textMuted text-[15px] py-4">
              <span className="animate-pulse">Thinking...</span>
            </div>
          )}

          {!loading && notes.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-20 opacity-60 animate-fade-in-up">
              <div className="w-16 h-16 rounded-full bg-gemini-surfaceHover flex items-center justify-center mb-6 shadow-sm border border-[#444746]">
                <span className="text-3xl">
                  {title === 'Personal' ? '👤' : title === 'Work' ? '💼' : title === 'Ideas' ? '💡' : title === 'Random Thoughts' ? '💭' : '✨'}
                </span>
              </div>
              <h3 className="text-gemini-textMain text-xl font-medium mb-2">Start a new thought in {title}</h3>
              <p className="text-gemini-textMuted text-[15px]">Type below or use the microphone to add your first note here.</p>
            </div>
          )}

          {sortedNotes.map((note) => {
            const { cleanContent } = extractTags(note.content);
            
            return (
              <div key={note._id} className="flex flex-col group items-end w-full animate-fade-in-up">
                <div className="flex items-start space-x-4 max-w-[85%]">
                  <div className="flex-1 min-w-0 bg-gemini-surface rounded-2xl rounded-tr-sm px-5 py-3 border border-transparent group-hover:border-[#444746] transition-colors relative">
                    
                    {/* Content rendered as chat bubble */}
                    <div 
                      className="text-[16px] text-gemini-textMain leading-[1.6] prose prose-gemini max-w-none break-words"
                      dangerouslySetInnerHTML={{ __html: cleanContent || '<p class="italic text-gemini-textMuted">Empty thought</p>' }}
                    />
                    
                    {/* Delete Action (Visible on hover) */}
                    <div className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => deleteNote(note._id)}
                        className="p-1.5 text-gemini-textMuted hover:text-[#d96570] hover:bg-[#d96570]/10 rounded-full transition-colors"
                        title="Delete message"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* User Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gemini-surface border border-gemini-border flex items-center justify-center shrink-0 mt-1">
                    <UserIcon size={14} className="text-gemini-textMuted" />
                  </div>
                </div>
              </div>
            );
          })}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Bottom Input Bar */}
      <RichTextEditor onSave={handleSave} loading={loading} />
    </Layout>
  );
}
