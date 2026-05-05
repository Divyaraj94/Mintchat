import { Trash2 } from 'lucide-react';
import { useNotes } from '../context/NoteContext';

export default function MessageBubble({ note }) {
  const { deleteNote } = useNotes();
  const date = new Date(note.createdAt);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  // A subtle map of colors based on category if we wanted to color code them, 
  // but keeping it uniform aesthetic is usually better for chat. We'll show a small badge.
  const catColors = {
    'Personal': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Ideas': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Work': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Random Thoughts': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  };

  return (
    <div className="flex justify-end group">
      <div className="max-w-[85%] md:max-w-[70%] relative">
        <div className="bg-primary-500 text-white rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-sm">
          <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{note.content}</p>
        </div>
        
        <div className="flex items-center justify-end mt-1.5 space-x-2 px-1">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${catColors[note.category] || catColors['Personal']}`}>
            {note.category}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {dateString} • {timeString}
          </span>
          <button
            onClick={() => deleteNote(note._id)}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1 -mr-1"
            title="Delete Note"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
