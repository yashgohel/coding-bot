'use client';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('API error', res.status, text);
        setMessages([...newMessages, { role: 'assistant', content: `Error ${res.status}: ${text}` }]);
        return;
      }

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error('Send message error', err);
      setMessages([...newMessages, { role: 'assistant', content: 'An error occurred while sending your message.' }]);
    }
  };

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Code Helper Bot</h1>
      <div className="border p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-white'}`}>
              {m.content}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="border p-2 flex-grow"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a coding question..."
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white p-2">Send</button>
      </div>
    </div>
  );
}