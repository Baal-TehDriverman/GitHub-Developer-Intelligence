import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Sparkles, Bot, User, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { GitHubRepo, ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';

interface AiChatAssistantProps {
  username: string;
  selectedRepo: GitHubRepo | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AiChatAssistant: React.FC<AiChatAssistantProps> = ({
  username,
  selectedRepo,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
      // Add welcome message if empty
      if (messages.length === 0) {
        setMessages([{
          role: 'assistant',
          content: `Initializing AI assistant for user **${username}**${selectedRepo ? ` inspecting "${selectedRepo.name}"` : ''}. Awaiting your question.`,
          timestamp: new Date().toISOString(),
        }]);
      }
    }
  }, [isOpen, username, selectedRepo, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    const currentInput = input;
    setInput('');

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          selectedRepo,
          userQuery: currentInput,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: data.text,
          timestamp: new Date().toISOString(),
        }]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'I encountered an error. Please check your connection and try again.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col animate-slide-in-right">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Chat Panel */}
      <div className={`relative flex-1 flex flex-col bg-slate-950 border-l border-slate-800 max-w-md w-full md:max-w-lg lg:max-w-xl ${isExpanded ? 'md:max-w-2xl' : ''} animate-slide-in-right`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-800/60">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Hermes Architect</h3>
              <p className="text-xs text-slate-400">
                {selectedRepo ? `Analyzing ${selectedRepo.name}` : `NSSP Mesh`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 glass hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 glass hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
          {messages.map((message, index) => (
            <div
              key={`${message.timestamp}-${index}`}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-cyan-500/20 border border-cyan-500/30'
                    : 'bg-purple-500/20 border border-purple-500/30'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Bot className="w-4 h-4 text-purple-400" />
                )}
              </div>
              <div
                className={`max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-cyan-950/50 border border-cyan-800/60 rounded-2xl rounded-br-md'
                    : 'bg-slate-900/60 border border-slate-800/60 rounded-2xl rounded-bl-md'
                } p-4`}
              >
                <div className="prose prose-invert max-w-none text-sm">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <span className="text-[10px] text-slate-500">{formatTime(message.timestamp)}</span>
                  <button
                    onClick={() => copyMessage(message.content, `${message.timestamp}-${index}`)}
                    className="p-1 glass hover:bg-slate-700 rounded text-[10px] text-slate-500 hover:text-white transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              </div>
              <div className="glass rounded-2xl rounded-bl-md p-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-slate-900/95">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about architecture, patterns, tech stack..."
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none resize-none min-h-[44px] max-h-32"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Powered by Hermes NSSP Mesh • Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
};