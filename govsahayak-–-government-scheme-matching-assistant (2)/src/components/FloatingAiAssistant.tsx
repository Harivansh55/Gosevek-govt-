import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Minimize2, 
  Maximize2, 
  Building2, 
  ExternalLink, 
  Bot, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { Language, UserProfile, Scheme } from '../types';

interface FloatingAiAssistantProps {
  profile?: UserProfile;
  language: Language;
  prefilledQuery?: string | null;
  onClearPrefilledQuery?: () => void;
  onViewSchemeDetails?: (scheme: Scheme) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  groundedSchemes?: Scheme[];
  suggestedQuestions?: string[];
}

export const FloatingAiAssistant: React.FC<FloatingAiAssistantProps> = ({
  profile,
  language,
  prefilledQuery,
  onClearPrefilledQuery,
  onViewSchemeDetails
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_msg',
      sender: 'assistant',
      text: language === 'hi'
        ? "नमस्ते! मैं गोवसहायक एआई हूँ। आप मुझसे किसी भी सरकारी योजना की पात्रता, आवश्यक दस्तावेज या आवेदन प्रक्रिया के बारे में पूछ सकते हैं।"
        : language === 'hinglish'
        ? "Namaste! Main GovSahayak AI hu. Aap mujhse kisi bhi Indian government scheme ke documents, eligibility ya apply process ke baare me pooch sakte hain."
        : "Namaste! I am GovSahayak AI. Ask me anything about Indian government schemes, eligibility rules, document requirements, or application procedures.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuestions: [
        language === 'hi' ? "विद्यार्थियों के लिए छात्रवृत्ति बताएं" : "What scholarships are available for students?",
        language === 'hi' ? "पीएम किसान योजना की पात्रता क्या है?" : "What is PM-KISAN eligibility?",
        language === 'hi' ? "महिलाओं के लिए ऋण योजनाएं" : "Schemes for women entrepreneurs"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Handle prefilled query from parent (e.g. from SchemeCard "Ask AI")
  useEffect(() => {
    if (prefilledQuery) {
      setIsOpen(true);
      handleSendMessage(prefilledQuery);
      if (onClearPrefilledQuery) {
        onClearPrefilledQuery();
      }
    }
  }, [prefilledQuery]);

  const handleSendMessage = async (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: clean,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: clean,
          profile,
          language
        })
      });

      if (!response.ok) {
        throw new Error('Chat API returned error');
      }

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: data.answer || "I have received your query.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundedSchemes: data.groundedSchemes,
        suggestedQuestions: data.suggestedQuestions
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const fallbackMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        sender: 'assistant',
        text: "Apologies, I encountered a temporary network issue. Please check your query or verify the scheme on the official portal.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-blue-900 hover:bg-blue-950 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl border-2 border-amber-400 flex items-center space-x-2.5 transition-all transform hover:scale-105 cursor-pointer group"
          aria-label="Open GovSahayak AI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-blue-900 animate-pulse" />
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-wide hidden sm:inline">
            Ask GovSahayak AI
          </span>
        </button>
      )}

      {/* Chat Window Dialog */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[420px] h-[550px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6">
          
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-blue-950 to-indigo-900 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>GovSahayak RAG Assistant</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/30 text-emerald-300 font-semibold">
                    Grounding Active
                  </span>
                </div>
                <div className="text-[10px] text-blue-200">
                  Multilingual AI • 28+ Verified Schemes
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => {
              const isBot = msg.sender === 'assistant';
              return (
                <div key={msg.id} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
                  <div 
                    className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed max-w-[90%] whitespace-pre-wrap ${
                      isBot 
                        ? 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tl-xs' 
                        : 'bg-blue-900 text-white shadow-xs rounded-tr-xs'
                    }`}
                  >
                    {msg.text}

                    {/* Grounded Schemes Citations */}
                    {isBot && msg.groundedSchemes && msg.groundedSchemes.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Verified Government Sources:
                        </div>
                        {msg.groundedSchemes.slice(0, 2).map((s) => (
                          <div 
                            key={s.id}
                            className="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200 text-blue-900 font-semibold cursor-pointer hover:bg-blue-50"
                            onClick={() => onViewSchemeDetails && onViewSchemeDetails(s)}
                          >
                            <span className="truncate max-w-[200px]">{s.name}</span>
                            <span className="text-[10px] text-blue-700 underline flex items-center space-x-0.5">
                              <span>Details</span>
                              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Suggested follow-up pills */}
                  {isBot && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1 max-w-[95%]">
                      {msg.suggestedQuestions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSendMessage(q)}
                          className="text-[10px] px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-medium transition-colors text-left"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center space-x-2 text-xs text-slate-500 pl-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[11px]">Retrieving scheme rules & grounding answer...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex items-center space-x-1.5"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? "योजना, पात्रता या दस्तावेज के बारे में पूछें..."
                    : language === 'hinglish'
                    ? "Koi bhi question poochein (Hinglish/English)..."
                    : "Ask about eligibility, documents, or schemes..."
                }
                disabled={isLoading}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2 rounded-xl bg-blue-900 hover:bg-blue-950 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium transition-colors"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};
