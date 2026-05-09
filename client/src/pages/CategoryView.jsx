import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useNotes } from '../context/NoteContext';
import { extractTags } from '../utils/formatters';
import { cn } from '../utils/cn';
import { 
  Trash2, 
  User as UserIcon, 
  Save, 
  Loader2, 
  Bold, 
  Italic, 
  Underline, 
  Highlighter,
  Type
} from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';

export default function CategoryView() {
  const { chatId } = useParams();
  const { notes, chats, setActiveChatId, setActiveCategory, addNote, editNote, deleteNote, loading, searchQuery } = useNotes();
  const messagesEndRef = useRef(null);
  const editorRef = useRef(null);
  
  // Notebook specific state
  const [isSaving, setIsSaving] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const saveTimeoutRef = useRef(null);
  
  // Find the chat by its unique _id
  const currentChat = chats.find(c => c._id === chatId);
  const title = currentChat?.name || 'Chat';
  const type = currentChat?.type || 'chat';

  useEffect(() => {
    if (chatId) {
      setActiveChatId(chatId);
      setActiveCategory(title);
    }
  }, [chatId, title, setActiveChatId, setActiveCategory]);

  // Sync notebook content when notes load
  useEffect(() => {
    if (type === 'notebook' && notes.length > 0 && editorRef.current) {
      // Only update if the editor is empty or we just switched chats
      // We don't want to overwrite what the user is currently typing
      const mergedContent = notes.map(n => n.content).join('<br><br>');
      if (editorRef.current.innerHTML !== mergedContent) {
        editorRef.current.innerHTML = mergedContent;
      }
    } else if (type === 'notebook' && notes.length === 0 && editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  }, [notes.length, type, chatId]);

  useEffect(() => {
    if (type !== 'notebook') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [notes, type]);

  const handleSave = async (content) => {
    if (!content.trim() || !chatId) return;
    await addNote(content, chatId);
  };

  const handleInput = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      if (!chatId || !editorRef.current) return;
      
      const content = editorRef.current.innerHTML;
      
      if (notes.length > 0) {
        await editNote(notes[0]._id, content);
      } else {
        await addNote(content, chatId);
      }
      setIsSaving(false);
    }, 1500);
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const highlightColors = [
    { name: 'Yellow', color: '#fef08a' },
    { name: 'Green', color: '#bbf7d0' },
    { name: 'Blue', color: '#bfdbfe' },
    { name: 'Purple', color: '#e9d5ff' },
    { name: 'Pink', color: '#fbcfe8' },
    { name: 'None', color: 'transparent' },
  ];

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    return note.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedNotes = filteredNotes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (type === 'notebook') {
    return (
      <Layout title={title}>
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-8 pt-24 pb-20 min-h-screen flex flex-col">
          
          {/* Notebook Toolbar */}
          <div className="sticky top-20 z-40 bg-gemini-bg/80 backdrop-blur-md py-4 border-b border-gemini-border flex items-center justify-between mb-6">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button 
                onClick={() => execCommand('bold')}
                className="p-2 rounded-lg hover:bg-gemini-surfaceHover text-gemini-textMain transition-colors"
                title="Bold"
              >
                <Bold size={18} />
              </button>
              <button 
                onClick={() => execCommand('italic')}
                className="p-2 rounded-lg hover:bg-gemini-surfaceHover text-gemini-textMain transition-colors"
                title="Italic"
              >
                <Italic size={18} />
              </button>
              <button 
                onClick={() => execCommand('underline')}
                className="p-2 rounded-lg hover:bg-gemini-surfaceHover text-gemini-textMain transition-colors"
                title="Underline"
              >
                <Underline size={18} />
              </button>
              
              <div className="w-px h-6 bg-gemini-border mx-1" />
              
              <div className="relative">
                <button 
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-2 rounded-lg hover:bg-gemini-surfaceHover text-gemini-textMain transition-colors flex items-center space-x-1"
                  title="Highlight Color"
                >
                  <Highlighter size={18} />
                </button>
                
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-2 p-2 bg-gemini-surface border border-gemini-border rounded-xl shadow-xl flex space-x-2 z-50">
                    {highlightColors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          execCommand('hiliteColor', c.color);
                          setShowColorPicker(false);
                        }}
                        className="w-6 h-6 rounded-full border border-black/10 transition-transform hover:scale-110"
                        style={{ backgroundColor: c.color }}
                        title={c.name}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 text-gemini-textMuted text-xs sm:text-sm">
              <span className="hidden sm:inline bg-gemini-pillBg px-3 py-1 rounded-full font-medium">Notebook Mode</span>
              {isSaving ? (
                <span className="flex items-center space-x-1 animate-pulse">
                  <Loader2 size={12} className="animate-spin" />
                  <span>Saving...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 text-green-500/70">
                  <Save size={12} />
                  <span>Saved</span>
                </span>
              )}
            </div>
          </div>

          {/* Notepad Area */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={() => setShowColorPicker(false)}
            placeholder="Start writing your thoughts here..."
            className="flex-1 w-full bg-transparent text-gemini-textMain text-lg leading-relaxed outline-none min-h-[500px] prose prose-gemini max-w-none focus:placeholder:opacity-0"
          />
          
          {/* Custom placeholder logic for contentEditable */}
          {!editorRef.current?.innerHTML && (
            <style>{`
              [contenteditable]:empty:before {
                content: attr(placeholder);
                color: #44474650;
                cursor: text;
              }
            `}</style>
          )}
        </div>
      </Layout>
    );
  }

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
                  {type === 'gem' ? '💎' : '✨'}
                </span>
              </div>
              <h3 className="text-gemini-textMain text-xl font-medium mb-2">Start a new thought in {title}</h3>
              <p className="text-gemini-textMuted text-[15px]">Type below or use the microphone to add your first note here.</p>
            </div>
          )}

          {sortedNotes.map((note) => {
            const { cleanContent } = extractTags(note.content);
            
            // GEM STYLE: Shimmering border + Echo
            const isGem = type === 'gem';

            return (
              <div key={note._id} className={cn(
                "flex flex-col group items-end w-full animate-fade-in-up",
                isGem ? "items-center" : "items-end"
              )}>
                <div className={cn(
                  "flex items-start space-x-4",
                  isGem ? "w-full max-w-[90%]" : "max-w-[85%]"
                )}>
                  <div className={cn(
                    "flex-1 min-w-0 bg-gemini-surface rounded-2xl px-5 py-3 border transition-all duration-500 relative",
                    isGem 
                      ? "border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.1)] rounded-tr-2xl hover:border-amber-400/60" 
                      : "rounded-tr-sm border-transparent group-hover:border-[#444746]"
                  )}>
                    
                    {isGem && (
                      <div className="absolute -top-2 -left-2 bg-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
                        BRAIN GEM
                      </div>
                    )}

                    <div 
                      className="text-[16px] text-gemini-textMain leading-[1.6] prose prose-gemini max-w-none break-words"
                      dangerouslySetInnerHTML={{ __html: cleanContent || '<p class="italic text-gemini-textMuted">Empty thought</p>' }}
                    />

                    {isGem && (
                      <div className="mt-4 pt-3 border-t border-amber-400/10 italic text-[14px] text-amber-200/60 flex items-start space-x-2">
                        <span className="text-amber-400 shrink-0">✨</span>
                        <span>Echo: This insight connects your vision to a broader perspective...</span>
                      </div>
                    )}
                    
                    <div className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => deleteNote(note._id)}
                        className="p-1.5 text-gemini-textMuted hover:text-[#d96570] hover:bg-[#d96570]/10 rounded-full transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {!isGem && (
                    <div className="w-8 h-8 rounded-full bg-gemini-surface border border-gemini-border flex items-center justify-center shrink-0 mt-1">
                      <UserIcon size={14} className="text-gemini-textMuted" />
                    </div>
                  )}
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


