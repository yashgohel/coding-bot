'use client';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);

  const sendMessage = async () => {
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: newMessages }),
    });
    
    const data = await res.json();
    setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    setInput('');
  };

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Code Helper Bot</h1>
      <div className="border p-4 h-96 overflow-y-auto mb-4">
        {messages.map((m, i) => <p key={i}><strong>{m.role}:</strong> {m.content}</p>)}
      </div>
      <input 
        className="border p-2 w-full"
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        placeholder="Ask a coding question..."
      />
      <button onClick={sendMessage} className="bg-blue-500 text-white p-2 mt-2">Send</button>
    </div>
  );
}