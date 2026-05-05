import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useNotes } from '../context/NoteContext';

export default function MessageInput() {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Personal');
  const { addNote, activeCategory } = useNotes();
  const textareaRef = useRef(null);

  useEffect(() => {
    // If active category is a specific one (not 'All'), default the dropdown to it
    if (activeCategory !== 'All') {
      setCategory(activeCategory);
    }
  }, [activeCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    await addNote(content, category);
    setContent('');
    
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-2 max-w-4xl mx-auto">
      <div className="flex items-end space-x-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all shadow-sm">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-primary-500 transition-colors"
        >
          <option value="Personal">Personal</option>
          <option value="Ideas">Ideas</option>
          <option value="Work">Work</option>
          <option value="Random Thoughts">Random</option>
        </select>
        
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Jot down a thought... (Shift+Enter for new line)"
          className="flex-1 max-h-[150px] min-h-[40px] bg-transparent resize-none outline-none py-2 px-3 text-slate-700 dark:text-slate-200 custom-scrollbar placeholder:text-slate-400"
          rows={1}
        />

        <button
          type="submit"
          disabled={!content.trim()}
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:hover:bg-primary-500 transition-colors shrink-0 shadow-sm"
        >
          <Send size={18} className="ml-0.5" />
        </button>
      </div>
    </form>
  );
}
