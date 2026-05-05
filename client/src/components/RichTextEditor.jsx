import { useState, useRef, useEffect } from 'react';
import { Mic, Send } from 'lucide-react';

export default function RichTextEditor({ onSave, loading }) {
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
        
        // Append the new transcript segment to existing text
        setText(prev => {
          // Add a space if the previous text doesn't end with one
          const space = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
          return prev + space + currentTranscript;
        });
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
      
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
    // Save on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveClick();
    }
  };

  const handleSaveClick = () => {
    if (!text.trim() || loading) return;
    onSave(text);
    setText('');
    
    // reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleTextareaChange = (e) => {
    setText(e.target.value);
    // Auto resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 md:left-[68px] lg:left-[280px] right-0 flex justify-center pb-6 pt-4 bg-gradient-to-t from-gemini-bg via-gemini-bg to-transparent px-4">
      <div className={`w-full max-w-[800px] relative flex flex-col bg-gemini-surface rounded-[24px] shadow-sm border transition-colors ${isFocused ? 'border-[#686b6e]' : 'border-transparent'}`}>
        
        {/* Input Area */}
        <div className="flex items-end px-3 py-3">
          
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextareaChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Gemini / Type a thought..."
            className="flex-1 bg-transparent resize-none overflow-y-auto px-3 py-2 text-[16px] text-gemini-textMain leading-[1.5] outline-none min-h-[48px] max-h-[200px]"
            rows={1}
            disabled={loading}
          />

          <div className="flex items-center space-x-2 shrink-0 ml-2 mb-1">
            <button 
              onMouseDown={(e) => { e.preventDefault(); toggleMic(); }} 
              className={`p-2.5 rounded-full transition-colors ${isRecording ? 'bg-red-500/20 text-red-400' : 'hover:bg-gemini-surfaceHover text-gemini-textMuted hover:text-gemini-textMain'}`}
              title={isRecording ? "Stop recording" : "Use microphone"}
              disabled={loading}
            >
              {isRecording ? <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse m-[5px]"></span> : <Mic size={20} />}
            </button>
            
            <button 
              onClick={handleSaveClick}
              disabled={loading || !text.trim()}
              className="p-2.5 bg-gemini-textMuted hover:bg-gemini-textMain text-gemini-bg rounded-full transition-colors disabled:opacity-50"
              title="Send"
            >
              <Send size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
