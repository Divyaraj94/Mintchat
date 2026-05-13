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
  const [activeHighlightColor, setActiveHighlightColor] = useState('transparent');
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

  const toggleHighlight = () => {
    if (activeHighlightColor !== 'transparent') {
      document.execCommand('styleWithCSS', false, true);
      document.execCommand('hiliteColor', false, 'rgba(0,0,0,0)');
      setActiveHighlightColor('transparent');
      editorRef.current?.focus();
    } else {
      setShowColorPicker(!showColorPicker);
    }
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
                  onClick={toggleHighlight}
                  className="p-2 rounded-lg hover:bg-gemini-surfaceHover text-gemini-textMain transition-colors flex items-center space-x-1"
                  title="Highlight Color"
                >
                  <Highlighter size={18} />
                  {activeHighlightColor !== 'transparent' && (
                    <span className="inline-block w-2 h-2 rounded-full ml-1" style={{ backgroundColor: activeHighlightColor }} />
                  )}
                </button>
                
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-2 p-2 bg-gemini-surface border border-gemini-border rounded-xl shadow-xl flex space-x-2 z-50">
                    {highlightColors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          if (c.color === 'transparent') {
                            document.execCommand('styleWithCSS', false, true);
                            document.execCommand('hiliteColor', false, 'rgba(0,0,0,0)');
                          } else {
                            execCommand('hiliteColor', c.color);
                          }
                          setActiveHighlightColor(c.color);
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
        
        {/* Dream Mode Button */}
        {type === 'gem' && notes.length > 0 && (
          <div className="flex justify-center mt-4 mb-8 animate-fade-in-up">
            <button 
              onClick={() => window.location.href = `/dream/${chatId}`}
              className="group relative px-8 py-3 bg-[#050816] hover:bg-[#0a0f25] text-white rounded-full font-semibold text-sm transition-all duration-500 flex items-center space-x-3 shadow-2xl hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] overflow-hidden border border-white/10 hover:border-indigo-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="text-amber-400 text-lg relative z-10 animate-pulse">🌌</span>
              <span className="relative z-10 tracking-wide">Enter Dream Mode</span>
            </button>
          </div>
        )}

        {/* Chat History View */}
        <div className={cn(
          "flex-1",
          type === 'gem' && notes.length > 0 ? "grid grid-cols-1 sm:grid-cols-2 gap-6 items-start content-start" : "flex flex-col justify-end space-y-6 mt-4"
        )}>
          {loading && notes.length === 0 && (
            <div className="flex justify-center text-gemini-textMuted text-[15px] py-4 w-full col-span-full">
              <span className="animate-pulse">Thinking...</span>
            </div>
          )}

          {!loading && notes.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-20 opacity-60 animate-fade-in-up w-full col-span-full">
              <div className="w-16 h-16 rounded-full bg-gemini-surfaceHover flex items-center justify-center mb-6 shadow-sm border border-gemini-border">
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
            const isGem = type === 'gem';

            if (isGem) {
              return (
                <div key={note._id} className="group relative flex flex-col bg-gemini-surface rounded-3xl p-7 border border-gemini-border shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in-up min-h-[220px]">
                  
                  <div className="flex items-center space-x-2 mb-4 justify-between">
                    <div className="bg-amber-400 text-black text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm tracking-wider uppercase">
                      Brain Gem
                    </div>
                    {/* Status Badge */}
                    <div className={cn(
                      "text-[10px] px-2 py-0.5 rounded-md border font-medium",
                      note.status === 'completed' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                      note.status === 'pending' ? "bg-slate-500/10 text-slate-400 border-slate-500/20" :
                      "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                    )}>
                      {note.status?.toUpperCase() || 'ACTIVE'}
                    </div>
                  </div>
                  
                  <div 
                    className="text-[15px] text-gemini-textMain leading-relaxed prose prose-gemini max-w-none break-words flex-1 mb-6"
                    dangerouslySetInnerHTML={{ __html: cleanContent || '<p class="italic text-gemini-textMuted">Empty thought</p>' }}
                  />
                  
                  <div className="mt-auto pt-4 border-t border-gemini-border/50 italic text-[13px] text-gemini-textMuted flex items-start space-x-2 bg-gemini-bg/30 -mx-7 -mb-7 p-5 rounded-b-3xl">
                    <span className="text-amber-500 dark:text-amber-400 shrink-0">✨</span>
                    <span>Echo: This insight connects your vision to a broader perspective...</span>
                  </div>
                  
                  <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gemini-surface rounded-full shadow-lg border border-gemini-border">
                    <button 
                      onClick={() => deleteNote(note._id)}
                      className="p-2 text-gemini-textMuted hover:text-[#d96570] hover:bg-[#d96570]/10 rounded-full transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={note._id} className="flex flex-col group items-end w-full animate-fade-in-up">
                <div className="flex items-start space-x-4 max-w-[85%]">
                  <div className="flex-1 min-w-0 bg-gemini-surface rounded-2xl px-5 py-3 border transition-all duration-500 relative rounded-tr-sm border-transparent group-hover:border-gemini-border">
                    
                    <div 
                      className="text-[16px] text-gemini-textMain leading-[1.6] prose prose-gemini max-w-none break-words"
                      dangerouslySetInnerHTML={{ __html: cleanContent || '<p class="italic text-gemini-textMuted">Empty thought</p>' }}
                    />
                    
                    <div className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => deleteNote(note._id)}
                        className="p-1.5 text-gemini-textMuted hover:text-[#d96570] hover:bg-[#d96570]/10 rounded-full transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
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


