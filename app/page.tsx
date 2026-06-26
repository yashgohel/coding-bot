'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Chat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        let errorMessage = 'An error occurred while sending your message.';
        try {
          const errorData = await res.json();
          errorMessage = typeof errorData.error === 'string' 
            ? errorData.error 
            : errorData.error?.message || `Error ${res.status}`;
        } catch {
          errorMessage = `Error ${res.status}: ${await res.text()}`;
        }
        
        console.error('API error', res.status, errorMessage);
        
        // Add a friendly suggestion for 503/429
        if (res.status === 503 || res.status === 429) {
          errorMessage = `The AI model is currently experiencing high demand. Please wait a moment and try again.`;
        }
        
        setMessages([...newMessages, { role: 'assistant', content: `**Error:** ${errorMessage}` }]);
        return;
      }

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error('Send message error', err);
      setMessages([...newMessages, { role: 'assistant', content: 'An error occurred while sending your message.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#0B0F19] via-[#1A1025] to-[#0B0F19] text-white font-sans selection:bg-purple-500/30">
      {/* Header */}
      <header className="flex items-center gap-3 p-6 border-b border-white/10 bg-black/20 backdrop-blur-md z-10 sticky top-0 shadow-lg shadow-purple-900/5">
        <div className="p-1 bg-white/10 rounded-xl shadow-lg backdrop-blur-sm border border-white/20">
          <img src="/logo.png" alt="Bot Logo" className="w-8 h-8 object-contain" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Code Bot
          </h1>
          <p className="text-xs text-purple-300/70 font-medium tracking-wide">AI CODING ASSISTANT</p>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50"
            >
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <Bot className="w-12 h-12 text-purple-400 mb-2 mx-auto" />
                <p className="text-lg font-medium text-white/80">Hello! I'm your coding assistant.</p>
                <p className="text-sm text-white/50">Ask me anything about code, bugs, or architecture.</p>
              </div>
            </motion.div>
          ) : (
            messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`flex gap-4 max-w-4xl mx-auto ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm ${m.role === 'user'
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                    : 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                  }`}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`px-5 py-3.5 rounded-2xl max-w-[80%] shadow-xl backdrop-blur-md leading-relaxed text-[15px] ${m.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 text-blue-50 rounded-tr-sm'
                    : 'bg-white/5 border border-white/10 text-gray-100 rounded-tl-sm'
                  }`}>
                  <div className="whitespace-pre-wrap">
                    <ReactMarkdown 
                      components={{
                        strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                        code: ({node, className, children, ...props}) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return !match ? (
                            <code className="bg-black/30 rounded px-1.5 py-0.5 text-purple-300 font-mono text-[13px]" {...props}>
                              {children}
                            </code>
                          ) : (
                            <pre className="bg-black/40 rounded-lg p-3 overflow-x-auto my-2 border border-white/10">
                              <code className="text-gray-300 font-mono text-[13px]" {...props}>
                                {children}
                              </code>
                            </pre>
                          );
                        }
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 max-w-4xl mx-auto"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm bg-purple-500/20 border border-purple-500/30 text-purple-300">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-black/20 border-t border-white/10 backdrop-blur-xl shrink-0">
        <div className="max-w-4xl mx-auto relative flex items-center">
          <input
            className="w-full bg-white/5 border border-white/10 focus:border-purple-500/50 focus:bg-white/10 focus:ring-4 focus:ring-purple-500/10 text-white rounded-2xl px-6 py-4 pr-16 outline-none transition-all duration-300 placeholder:text-white/30"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask a coding question..."
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 p-2.5 bg-purple-500 hover:bg-purple-400 disabled:bg-white/5 disabled:text-white/20 text-white rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 disabled:shadow-none"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
        <p className="text-center text-xs text-white/30 mt-3">Press Enter to send, Shift + Enter for new line</p>
      </div>
    </div>
  );
}