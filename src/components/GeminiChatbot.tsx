import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Check, 
  Copy, 
  Sliders,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage, ChatRole, ChatModelPreference } from '../types';

interface GeminiChatbotProps {
  currentSessionName?: string;
}

const ROLES: { id: ChatRole; label: string; description: string; icon: string }[] = [
  {
    id: 'security_advisor',
    label: 'Security Advisor',
    description: 'General Nimbus security intelligence, telemetry explanations, and awareness guidance.',
    icon: '🛡️'
  },
  {
    id: 'threat_analyst',
    label: 'Threat Analyst',
    description: 'Adversary reconnaissance vectors, risk modeling, and defensive mitigations.',
    icon: '⚡'
  },
  {
    id: 'privacy_auditor',
    label: 'Privacy Auditor',
    description: 'Explicit consent rules, zero-retention policies, and GDPR/compliance standards.',
    icon: '📋'
  },
  {
    id: 'technical_architect',
    label: 'Technical Architect',
    description: 'Browser sandboxes, network routing hops, and client fingerprint entropy.',
    icon: '🔧'
  }
];

const MODELS: { id: ChatModelPreference; label: string; modelName: string; tag: string }[] = [
  { id: 'maps', label: 'Maps Grounding', modelName: 'gemini-3.8-flash', tag: 'Google Maps' },
  { id: 'general', label: 'Balanced', modelName: 'gemini-3.8-flash', tag: 'Standard' },
  { id: 'fast', label: 'Fast', modelName: 'gemini-3.1-flash-lite', tag: 'Low Latency' },
  { id: 'complex', label: 'In-Depth', modelName: 'gemini-3.1-pro-preview', tag: 'Deep Reasoning' },
];

const QUICK_PROMPTS = [
  'Explore surrounding physical infrastructure with Google Maps',
  'Why is IP geolocation less accurate than GPS telemetry?',
  'How does WebGL GPU detection work in browser fingerprinting?',
  'What explicit consent requirements apply to security awareness demos?'
];

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ currentSessionName }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [role, setRole] = useState<ChatRole>('security_advisor');
  const [modelPref, setModelPref] = useState<ChatModelPreference>('general');
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: `Hello. I am **Nimbus Intelligence**, powered by Google Gemini.

I can assist with telemetry analysis, browser security models, consent compliance, and interpreting awareness demonstration results.

How can I assist your evaluation today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
      roleTitle: 'Nimbus Security Intelligence Specialist'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        role: 'assistant',
        content: `Session restarted. I am ready to advise on telemetry and authorized security assessments.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.8-flash',
        roleTitle: 'Nimbus Intelligence'
      }
    ]);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const userText = textToSend || input.trim();
    if (!userText || loading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const allMessages = newMessages
        .filter(m => m.id !== 'msg-init')
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }));

      const isMapsQuery = modelPref === 'maps' || /map|nearby|infrastructure|location|coordinates|address/i.test(userText);
      const response = await api.sendChatMessage({
        messages: allMessages,
        role,
        modelPreference: isMapsQuery ? 'maps' : modelPref,
        useMaps: isMapsQuery
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: response.modelUsed,
        roleTitle: response.roleTitle,
        mapsLinks: response.mapsLinks
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat failure:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `*Error:* Failed to reach Nimbus Intelligence service. Please verify your connection or try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-[#111113]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-[#111113]/80">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 border border-[#111113] bg-[#EFECE6] text-[#111113] text-[10px] font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const activeRoleObj = ROLES.find(r => r.id === role) || ROLES[0];
  const activeModelObj = MODELS.find(m => m.id === modelPref) || MODELS[0];

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-mono">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="nimbus-gemini-chat-popup"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.15 }}
              className="w-[92vw] sm:w-[440px] h-[580px] max-h-[82vh] mb-3 bg-[#F8F7F4] border-2 border-[#111113] shadow-[8px_8px_0px_#111113] flex flex-col overflow-hidden text-[#111113]"
            >
              {/* Chat Header */}
              <div className="px-4 py-3 bg-white border-b-2 border-[#111113] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#111113] bg-[#111113] text-[#F8F7F4] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-syne text-xs font-bold tracking-tight uppercase text-[#111113]">
                        NIMBUS AI
                      </h3>
                      <span className="px-1 py-0.2 text-[9px] font-bold uppercase bg-[#E63946] text-white">
                        GEMINI
                      </span>
                    </div>
                    <p className="text-[10px] text-[#111113]/70 truncate max-w-[200px]">
                      {activeRoleObj.label} · {activeModelObj.label}
                    </p>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    id="nimbus-chat-toggle-config"
                    onClick={() => setShowConfig(!showConfig)}
                    title="Role & model settings"
                    className={`border-2 border-[#111113] p-1 text-xs transition-colors ${
                      showConfig 
                        ? 'bg-[#111113] text-[#F8F7F4]' 
                        : 'bg-white text-[#111113] hover:bg-[#EFECE6]'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id="nimbus-chat-reset-button"
                    onClick={handleResetChat}
                    title="Reset history"
                    className="border-2 border-[#111113] bg-white p-1 text-[#111113] hover:bg-[#EFECE6] transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id="nimbus-chat-close-button"
                    onClick={() => setIsOpen(false)}
                    className="border-2 border-[#111113] bg-white p-1 text-[#111113] hover:bg-[#EFECE6] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Role & Model Configuration Panel */}
              <AnimatePresence>
                {showConfig && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="bg-white border-b-2 border-[#111113] p-3 text-xs overflow-hidden"
                  >
                    <div className="mb-3">
                      <span className="label-spec mb-1">[DIRECTIVE ROLE]</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {ROLES.map(r => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              setRole(r.id);
                              setShowConfig(false);
                            }}
                            className={`p-2 text-left border-2 border-[#111113] transition-all ${
                              role === r.id
                                ? 'bg-[#111113] text-[#F8F7F4]'
                                : 'bg-[#F8F7F4] text-[#111113] hover:bg-[#EFECE6]'
                            }`}
                          >
                            <div className="font-bold text-xs truncate">
                              {r.icon} {r.label}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="label-spec mb-1">[MODEL PRESET]</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {MODELS.map(m => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setModelPref(m.id);
                              setShowConfig(false);
                            }}
                            className={`p-1.5 text-left border-2 border-[#111113] transition-all ${
                              modelPref === m.id
                                ? 'bg-[#111113] text-[#F8F7F4]'
                                : 'bg-[#F8F7F4] text-[#111113] hover:bg-[#EFECE6]'
                            }`}
                          >
                            <div className="font-bold text-[11px] truncate flex items-center justify-between">
                              <span>{m.label}</span>
                              {modelPref === m.id && <Check className="w-3 h-3 text-[#E63946]" />}
                            </div>
                            <p className="text-[9px] opacity-70 truncate font-mono mt-0.5">
                              {m.tag}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message Thread Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-mono">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] p-3.5 relative border-2 border-[#111113] ${
                          isUser
                            ? 'bg-[#111113] text-[#F8F7F4]'
                            : 'bg-white text-[#111113] shadow-[3px_3px_0px_#111113]'
                        }`}
                      >
                        {!isUser && (
                          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#111113]/20 text-[10px]">
                            <span className="font-bold text-[#E63946] uppercase flex items-center gap-1">
                              • {msg.roleTitle || 'NIMBUS AI'}
                            </span>
                            {msg.modelUsed && (
                              <span className="font-mono text-[9px] text-[#111113]/50 uppercase">
                                {msg.modelUsed}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="break-words leading-relaxed whitespace-pre-wrap">
                          {renderFormattedText(msg.content)}
                        </div>

                        {msg.mapsLinks && msg.mapsLinks.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-[#111113]/20 space-y-1.5">
                            <div className="text-[10px] font-bold text-[#E63946] flex items-center gap-1 uppercase tracking-wider">
                              <MapPin className="w-3 h-3" />
                              <span>Google Maps Citations & Locations</span>
                            </div>
                            <div className="space-y-1">
                              {msg.mapsLinks.map((link, lIdx) => (
                                <a
                                  key={lIdx}
                                  href={link.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between gap-1 p-1.5 bg-[#F8F7F4] border border-[#111113] hover:border-[#E63946] text-[10px] transition-colors"
                                >
                                  <span className="font-bold text-[#111113] truncate">{link.title}</span>
                                  <ExternalLink className="w-3 h-3 text-[#E63946] shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <div
                          className={`flex items-center gap-2 mt-2 text-[10px] ${
                            isUser ? 'text-[#F8F7F4]/60 justify-end' : 'text-[#111113]/50 justify-between'
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {!isUser && (
                            <button
                              onClick={() => handleCopyText(msg.id, msg.content)}
                              className="p-0.5 hover:text-[#111113]"
                              title="Copy text"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3 h-3 text-[#E63946]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex flex-col items-start">
                    <div className="bg-white border-2 border-[#111113] p-3 text-xs flex items-center gap-2 shadow-[3px_3px_0px_#111113]">
                      <Sparkles className="w-3.5 h-3.5 text-[#E63946] animate-spin" />
                      <span className="font-bold uppercase">NIMBUS AI ANALYZING TELEMETRY...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              {messages.length <= 2 && !loading && (
                <div className="px-4 py-2 border-t-2 border-[#111113] bg-white">
                  <span className="label-spec mb-1">[QUICK QUERIES]</span>
                  <div className="flex flex-wrap gap-1">
                    {QUICK_PROMPTS.slice(0, 2).map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="text-[10px] text-[#111113] bg-[#F8F7F4] hover:bg-[#EFECE6] border border-[#111113] px-2 py-1 text-left truncate max-w-full font-bold"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t-2 border-[#111113] flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  id="nimbus-gemini-chat-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="QUERY SECURITY INTELLIGENCE..."
                  disabled={loading}
                  className="flex-1 border-2 border-[#111113] bg-[#F8F7F4] focus:bg-white focus:outline-none px-3 py-2 text-xs text-[#111113] placeholder-[#111113]/40 font-mono"
                />

                <button
                  id="nimbus-gemini-chat-send-btn"
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="btn-ink px-3 py-2 text-xs flex items-center justify-center disabled:opacity-40"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Trigger Button */}
        <motion.button
          id="nimbus-gemini-chat-trigger"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close Nimbus Chat' : 'Open Nimbus Intelligence Chatbot'}
          className="border-2 border-[#111113] bg-[#111113] text-[#F8F7F4] hover:bg-[#E63946] shadow-[4px_4px_0px_#111113] px-4 py-2.5 flex items-center gap-2 font-mono text-xs font-bold uppercase transition-all"
        >
          {isOpen ? (
            <>
              <X className="w-4 h-4" />
              <span>CLOSE INTELLIGENCE</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#E63946]" />
              <span>NIMBUS AI</span>
              <span className="text-[10px] opacity-75 border-l border-white/30 pl-2">
                ASSISTANT
              </span>
            </>
          )}
        </motion.button>
      </div>
    </>
  );
};
