import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  User, 
  CheckCircle2, 
  Building, 
  Briefcase, 
  IndianRupee, 
  MapPin, 
  ShieldCheck, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { Language, UserProfile, ConversationalStep } from '../types';
import { getNextStep, parseConversationalAnswer, CONVERSATIONAL_STEPS } from '../lib/conversationEngine';

interface ConversationalIntakeProps {
  initialProfile?: UserProfile;
  language: Language;
  onComplete: (profile: UserProfile) => void;
  onCancel: () => void;
}

interface Message {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  quickReplies?: Array<{
    label: string;
    value: any;
  }>;
}

export const ConversationalIntake: React.FC<ConversationalIntakeProps> = ({
  initialProfile = {},
  language,
  onComplete,
  onCancel,
}) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [currentStep, setCurrentStep] = useState<ConversationalStep | null>(null);
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize first question
  useEffect(() => {
    const next = getNextStep(profile);
    setCurrentStep(next);

    if (next) {
      const qText = next.question[language] || next.question.en;
      const initialMsg: Message = {
        id: 'msg_init',
        sender: 'assistant',
        text: qText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: next.quickReplies?.map(qr => ({
          label: qr.label[language] || qr.label.en,
          value: qr.value
        }))
      };
      setMessages([initialMsg]);
    }
  }, [language]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Calculate profile completeness
  const coreFields: Array<keyof UserProfile> = ['name', 'age', 'gender', 'state', 'occupation', 'annual_income', 'category'];
  const filledCount = coreFields.filter(f => profile[f] !== undefined && profile[f] !== '').length;
  const progressPercent = Math.min(100, Math.round((filledCount / coreFields.length) * 100));

  const handleSendAnswer = async (answerValue: any, displayLabel?: string) => {
    if (!currentStep) return;

    const userText = displayLabel || String(answerValue);
    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsProcessing(true);

    try {
      // Call server conversation endpoint (with local parser fallback)
      let newProfile = { ...profile };

      try {
        const res = await fetch('/api/conversation/next', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile: newProfile,
            answer: answerValue,
            currentField: currentStep.field,
            language
          })
        });

        if (res.ok) {
          const data = await res.json();
          newProfile = { ...newProfile, ...data.updatedProfile };
        } else {
          // Fallback to local parser
          const localParsed = parseConversationalAnswer(String(answerValue), currentStep.field);
          newProfile = { ...newProfile, ...localParsed.updatedProfile };
        }
      } catch (err) {
        // Fallback to local parser
        const localParsed = parseConversationalAnswer(String(answerValue), currentStep.field);
        newProfile = { ...newProfile, ...localParsed.updatedProfile };
      }

      setProfile(newProfile);

      // Determine next step
      const next = getNextStep(newProfile);
      setCurrentStep(next);

      if (next) {
        const nextQText = next.question[language] || next.question.en;
        const botMsg: Message = {
          id: `bot_${Date.now()}`,
          sender: 'assistant',
          text: nextQText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickReplies: next.quickReplies?.map(qr => ({
            label: qr.label[language] || qr.label.en,
            value: qr.value
          }))
        };
        setTimeout(() => {
          setMessages(prev => [...prev, botMsg]);
          setIsProcessing(false);
        }, 350);
      } else {
        // Complete!
        const completeMsgText = language === 'hi' 
          ? "बहुत बढ़िया! आपकी प्रोफाइल पूर्ण हो गई है। अब हम पात्रता इंजन चला रहे हैं..."
          : language === 'hinglish'
          ? "Awesome! Profile ready ho chuki hai. Calculating eligible schemes now..."
          : "Excellent! Your profile is complete. Evaluating scheme eligibility rules now...";

        const botMsg: Message = {
          id: `bot_${Date.now()}`,
          sender: 'assistant',
          text: completeMsgText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
        setIsProcessing(false);

        setTimeout(() => {
          onComplete(newProfile);
        }, 800);
      }
    } catch (e) {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setProfile({});
    setMessages([]);
    const firstStep = CONVERSATIONAL_STEPS[0];
    setCurrentStep(firstStep);
    const qText = firstStep.question[language] || firstStep.question.en;
    setMessages([{
      id: 'msg_reset',
      sender: 'assistant',
      text: qText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: firstStep.quickReplies?.map(qr => ({
        label: qr.label[language] || qr.label.en,
        value: qr.value
      }))
    }]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100/90 px-2.5 py-0.5 rounded-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-700" />
            <span>AI Conversational Intake Assistant</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Build Your Citizen Profile
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'hi'
              ? "एक समय में एक प्रश्न का उत्तर दें। आप हिंदी, हिंग्लिश या अंग्रेजी में लिख सकते हैं।"
              : language === 'hinglish'
              ? "Ek-ek karke aasan sawalon ke answer dein. Hinglish jaise 'Meri age 21 hai' bhi chalega!"
              : "Answer one question at a time. Supports conversational natural language (e.g. 'I am 21 years old')."}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          {filledCount >= 3 && (
            <button
              onClick={() => onComplete(profile)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center space-x-1 shadow-sm cursor-pointer"
            >
              <span>Check Schemes Now ({filledCount}/7 ready)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chat Window (Col 1-8) */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[580px]">
          
          {/* Chat Header */}
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                AI
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <span>GovSahayak Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-[10px] text-slate-500">
                  Powered by Rule-Engine + Gemini NLU
                </div>
              </div>
            </div>

            {/* Step indicator */}
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-700">
                {filledCount} of {coreFields.length} Attributes
              </div>
              <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isBot = msg.sender === 'assistant';
              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-start space-x-2 max-w-[88%]">
                    {isBot && (
                      <div className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        AI
                      </div>
                    )}
                    <div 
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isBot 
                          ? 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tl-xs' 
                          : 'bg-blue-900 text-white shadow-xs rounded-tr-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>

                  {/* Quick Reply Pills (attached below bot question) */}
                  {isBot && msg.quickReplies && msg.quickReplies.length > 0 && msg.id === messages[messages.length - 1].id && !isProcessing && (
                    <div className="mt-2.5 ml-8 flex flex-wrap gap-1.5">
                      {msg.quickReplies.map((qr, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendAnswer(qr.value, qr.label)}
                          className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-medium transition-colors cursor-pointer"
                        >
                          {qr.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex items-center space-x-2 text-xs text-slate-500 pl-8">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Parsing your response into profile...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3.5 bg-white border-t border-slate-200">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (inputVal.trim() && !isProcessing) {
                  handleSendAnswer(inputVal.trim());
                }
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={
                  currentStep 
                    ? (currentStep.placeholder[language] || currentStep.placeholder.en)
                    : "Type your answer..."
                }
                disabled={isProcessing || !currentStep}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isProcessing || !currentStep}
                className="p-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium transition-colors shadow-sm cursor-pointer"
                aria-label="Send answer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1.5 px-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>Hinglish accepted (e.g. &quot;Main 21 saal ka hu&quot;)</span>
              <span>Question {Math.min(filledCount + 1, coreFields.length)} of {coreFields.length}</span>
            </div>
          </div>

        </div>

        {/* Live Profile Card (Col 9-12) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Your Citizen Profile</h3>
                  <p className="text-[10px] text-slate-500">Live structured record</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {progressPercent}%
              </span>
            </div>

            {/* Profile fields summary */}
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-500">Name</span>
                <span className="font-semibold text-slate-800">{profile.name || <span className="text-slate-400 italic">Waiting...</span>}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-500">Age</span>
                <span className="font-semibold text-slate-800">{profile.age ? `${profile.age} yrs` : <span className="text-slate-400 italic">Pending</span>}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-500">Gender</span>
                <span className="font-semibold text-slate-800">{profile.gender || <span className="text-slate-400 italic">Pending</span>}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-500">State</span>
                <span className="font-semibold text-slate-800">{profile.state || <span className="text-slate-400 italic">Pending</span>}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-500">Occupation</span>
                <span className="font-semibold text-slate-800">{profile.occupation || <span className="text-slate-400 italic">Pending</span>}</span>
              </div>

              {profile.occupation === 'Farmer' && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs">
                  <span className="text-emerald-700">Land Size</span>
                  <span className="font-semibold text-emerald-900">{profile.land_size_acres !== undefined ? `${profile.land_size_acres} Acres` : <span className="text-slate-400 italic">Pending</span>}</span>
                </div>
              )}

              {profile.occupation === 'Student' && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50 border border-blue-100 text-xs">
                  <span className="text-blue-700">Education</span>
                  <span className="font-semibold text-blue-900">{profile.education_level || <span className="text-slate-400 italic">Pending</span>}</span>
                </div>
              )}

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-500">Annual Income</span>
                <span className="font-semibold text-slate-800">
                  {profile.annual_income !== undefined ? `₹${profile.annual_income.toLocaleString('en-IN')}` : <span className="text-slate-400 italic">Pending</span>}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-500">Category</span>
                <span className="font-semibold text-slate-800">{profile.category || <span className="text-slate-400 italic">Pending</span>}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => onComplete(profile)}
              disabled={filledCount < 2}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Calculate Scheme Eligibility</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Rule engine runs deterministically on all 28+ schemes
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
