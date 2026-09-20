import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  CheckCircle2, 
  Clock, 
  Hospital, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { AICoordinatorMessage, UrgencyLevel, BloodGroup, ComponentType } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AiEmergencyCoordinatorProps {
  messages: AICoordinatorMessage[];
  onSendMessage: (text: string) => void;
  onDispatchFromAI: (triagedCard: AICoordinatorMessage['triagedCard']) => void;
}

export const AiEmergencyCoordinator: React.FC<AiEmergencyCoordinatorProps> = ({
  messages,
  onSendMessage,
  onDispatchFromAI,
}) => {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');

  const quickPrompts = [
    'I need 3 units O- platelets within 30 minutes',
    'Find nearest O+ PRBC for polytrauma ICU (urgent)',
    'Dengue patient platelet count dropped to 9,000/μL',
    'Emergency 2 units A+ whole blood at Ruby Hall',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handlePromptClick = (p: string) => {
    onSendMessage(p);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px] font-sans">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-md">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-base text-white">
                MEDITECH AI Emergency Coordinator
              </h3>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active 24/7 Triage</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Natural Language Clinical Dispatcher & Automated Resource Allocator
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-block text-[11px] bg-white/10 px-3 py-1 rounded-lg text-slate-300 font-mono">
          Model: MEDITECH-Triage-v2
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-slate-900 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-1 gap-4">
                <span className={`font-bold ${msg.sender === 'user' ? 'text-slate-300' : 'text-slate-900'}`}>
                  {msg.sender === 'user' ? 'Hospital Incharge / Doctor' : 'MEDITECH AI Coordinator'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
              </div>
              <p>{msg.text}</p>

              {/* Triaged Clinical Output Card */}
              {msg.triagedCard && (
                <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200 text-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="flex items-center space-x-1.5 text-xs font-black text-rose-600 uppercase">
                      <Zap className="w-4 h-4 text-rose-600 fill-rose-600" />
                      <span>🔴 Critical Code Red Request</span>
                    </span>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-black rounded text-[11px]">
                      {msg.triagedCard.bloodGroup} {msg.triagedCard.component.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold block">Compatible Blood Banks</span>
                      <strong className="text-slate-900 font-bold">{msg.triagedCard.compatibleBanksFound} Verified Centers</strong>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold block">Eligible Standby Donors</span>
                      <strong className="text-emerald-700 font-bold">{msg.triagedCard.eligibleDonorsFound} Donors Within 5km</strong>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold block">Nearest Optimal Resource</span>
                      <strong className="text-slate-900 font-bold">{msg.triagedCard.nearestResourceDistance}</strong>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-semibold block">Estimated Delivery ETA</span>
                      <strong className="text-blue-700 font-bold">{msg.triagedCard.estimatedResponseEta}</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-900 text-[11px] leading-snug">
                    <strong>Recommended Protocol:</strong> {msg.triagedCard.recommendedAction}
                  </div>

                  <button
                    onClick={() => onDispatchFromAI(msg.triagedCard)}
                    className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Execute Auto-Dispatch & Lock Reserve</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Click Prompts */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center space-x-2 overflow-x-auto text-[11px]">
        <span className="text-slate-500 shrink-0 font-bold flex items-center">
          <Sparkles className="w-3 h-3 mr-1 text-purple-600" />
          Test Query:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePromptClick(prompt)}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-medium whitespace-nowrap transition cursor-pointer border border-slate-200"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200 flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask AI Coordinator (e.g. 'I need 2 units O- platelets within 20 mins')..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-slate-50"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center justify-center cursor-pointer shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
