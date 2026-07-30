import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, HelpCircle } from 'lucide-react';

export default function ChatbotShell() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am CloudLeaf Assistant. I continuously monitor your cloud infrastructure telemetry. How can I help you understand your sustainability audit today?',
      timestamp: 'Just now',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const cannedQuestions = [
    {
      q: 'Why was instance i-03f92a18d9 flagged for downsizing?',
      a: 'CloudWatch telemetry recorded average CPU utilization under 6.4% and peak RAM under 2.1 GB across 14 days. Transitioning from m5.2xlarge to t4g.xlarge saves $420/mo and reduces 185 kg CO2/mo with zero SLA impact.',
    },
    {
      q: 'How is carbon reduction calculated?',
      a: 'CloudLeaf computes CO2 using: Power Consumption (kW) × Running Hours × Regional Grid Emission Factor (kg CO2/kWh). For example, in us-east-1 (N. Virginia), grid intensity is 0.385 kg/kWh.',
    },
    {
      q: 'What is CloudLeaf’s auto-approval safety rule?',
      a: 'Low-risk actions (such as non-prod DB sleeping, storage tiering, unattached volume cleanup) with auto-rollback snapshots are auto-approved. High-risk or mission-critical tagged resources always require explicit human approval.',
    },
  ];

  const handleAskQuestion = (qa) => {
    // Add user question
    const userMsg = { id: Date.now(), sender: 'user', text: qa.q, timestamp: 'Just now' };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botMsg = { id: Date.now() + 1, sender: 'bot', text: qa.a, timestamp: 'Just now' };
      setMessages((prev) => [...prev, botMsg]);
    }, 800);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-40">
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-3.5 rounded-full bg-gradient-to-r from-[#10b981] to-[#4edea3] text-slate-950 shadow-2xl hover:scale-110 hover:shadow-[#4edea3]/30 transition-all flex items-center gap-2 font-bold text-xs"
        >
          <Bot className="w-6 h-6 fill-current" />
          <span className="hidden sm:inline">CloudLeaf AI</span>
          <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping" />
        </button>
      )}

      {/* Floating Panel */}
      {isOpen && (
        <div className="glass-panel w-80 sm:w-96 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden animate-scale-in max-h-[520px]">
          {/* Header */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#10b981]/20 text-[#4edea3] border border-[#4edea3]/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  CloudLeaf Assistant
                  <Sparkles className="w-3.5 h-3.5 text-[#4edea3]" />
                </h3>
                <span className="text-[10px] text-emerald-400 font-medium">Online • Static Hackathon Shell</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat History */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[220px] max-h-[300px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 text-xs ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-[#10b981]/20 text-[#4edea3] flex items-center justify-center shrink-0 mt-0.5 border border-[#4edea3]/30 text-[10px] font-bold">
                    AI
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#10b981]/30 text-emerald-100 rounded-br-none border border-[#4edea3]/30'
                      : 'bg-slate-900 text-slate-200 rounded-bl-none border border-slate-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <div className="w-6 h-6 rounded-full bg-[#10b981]/20 text-[#4edea3] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>CloudLeaf Bedrock engine responding...</span>
              </div>
            )}
          </div>

          {/* Canned Quick Questions */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-[#adc6ff]" /> Suggested Questions
            </span>
            <div className="flex flex-col gap-1">
              {cannedQuestions.map((qa, index) => (
                <button
                  key={index}
                  onClick={() => handleAskQuestion(qa)}
                  disabled={isTyping}
                  className="text-left text-[11px] text-[#adc6ff] hover:text-white p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition-colors truncate"
                >
                  💬 {qa.q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
