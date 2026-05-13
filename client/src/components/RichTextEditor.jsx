import { useState, useRef, useEffect } from 'react';
import { Mic, Send, Plus, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function RichTextEditor({ onSave, loading }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        
        setText(prev => {
          const space = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
          return prev + space + currentTranscript;
        });
      };

      recognitionRef.current.onend = () => setIsRecording(false);
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const toggleMic = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognitionRef.current?.start();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveClick();
    }
  };

  const handleSaveClick = () => {
    if (!text.trim() || loading) return;

    if (!user) {
      if (window.confirm("You need to be signed in to start a conversation. Would you like to sign in now?")) {
        navigate('/login');
      }
      return;
    }

    onSave(text);
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleTextareaChange = (e) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 md:left-[68px] lg:left-[280px] right-0 flex justify-center pb-8 pt-4 bg-gradient-to-t from-gemini-bg via-gemini-bg to-transparent px-4 z-50">
      <div className={`w-full max-w-[850px] relative flex items-end bg-gemini-surface rounded-[32px] shadow-lg border transition-all duration-300 ${isFocused ? 'border-gemini-primary ring-1 ring-gemini-primary/20' : 'border-gemini-border'}`}>
        
        {/* Left Action (Tools) */}
        <div className="pl-4 pb-3 pr-1">
          <button className="p-2 rounded-full hover:bg-gemini-surfaceHover text-gemini-textMain transition-colors">
            <Plus size={20} />
          </button>
        </div>

        {/* Input Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextareaChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Ask BrainChat"
          className="flex-1 bg-transparent resize-none overflow-y-auto px-2 py-5 text-[16px] text-gemini-textMain leading-[1.5] outline-none min-h-[64px] max-h-[200px]"
          rows={1}
          disabled={loading}
        />

        {/* Right Actions */}
        <div className="flex items-center space-x-1 pr-4 pb-3">
          {/* Model Selector */}
          <button className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-full hover:bg-gemini-surfaceHover text-gemini-textMuted hover:text-gemini-textMain transition-colors text-[13px] font-medium mr-2">
            <span>Fast</span>
            <ChevronDown size={14} />
          </button>

          <button 
            onMouseDown={(e) => { e.preventDefault(); toggleMic(); }} 
            className={`p-2.5 rounded-full transition-colors ${isRecording ? 'bg-red-500/20 text-red-400' : 'hover:bg-gemini-surfaceHover text-gemini-textMuted hover:text-gemini-textMain'}`}
            disabled={loading}
          >
            {isRecording ? <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div> : <Mic size={20} />}
          </button>
          
          <button 
            onClick={handleSaveClick}
            disabled={loading || !text.trim()}
            className="p-2.5 text-gemini-textMuted hover:text-gemini-textMain transition-colors disabled:opacity-30"
          >
            <Send size={20} />
          </button>
        </div>

      </div>
    </div>
  );
}
