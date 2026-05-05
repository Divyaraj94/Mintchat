import { useEffect, useRef } from 'react';
import { useNotes } from '../context/NoteContext';
import { Menu } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

export default function ChatWindow({ onMenuClick }) {
  const { notes, activeCategory, loading } = useNotes();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [notes]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="h-16 flex items-center px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <button 
          onClick={onMenuClick}
          className="mr-4 md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          <Menu size={24} />
        </button>
        <div className="flex flex-col">
          <h1 className="font-semibold text-slate-900 dark:text-white">
            {activeCategory}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {notes.length} note{notes.length !== 1 && 's'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <div className="w-24 h-24 mb-4 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <span className="text-4xl">💭</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm">
              It's quiet here. Start chatting with yourself to save your thoughts!
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <MessageBubble key={note._id} note={note} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <MessageInput />
      </div>
    </div>
  );
}
