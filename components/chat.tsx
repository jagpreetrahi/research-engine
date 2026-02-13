'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

export default function Chat() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat/',
    }),
  });

  const [input, setInput] = useState('');

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map(message => (
          <div 
            key={message.id}
            className={`p-4 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-100 ml-auto max-w-[80%]' 
                : 'bg-gray-100 mr-auto max-w-[80%]'
            }`}
          >
            <div className="font-semibold mb-1">
              {message.role === 'user' ? '👤 You' : '🤖 AI'}
            </div>
            
            <div className="space-y-2">
              {message.parts.map((part, index) => {
                // Render text
                if (part.type === 'text') {
                  return (
                    <div key={index} className="whitespace-pre-wrap">
                      {part.text}
                    </div>
                  );
                }
                
                // Render tool call - access properties safely
                if (part.type === 'tool-call') {
                  const toolName = (part as any).toolName || 'researchEngine';
                  const query = (part as any).args?.query || 
                                (part as any).query || 
                                'Searching...';
                  
                  return (
                    <div key={index} className="p-3 bg-yellow-50 rounded border border-yellow-200">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="animate-spin">🔍</span>
                        <div>
                          <div className="font-semibold">Researching</div>
                          <div className="text-xs text-gray-600">"{query}"</div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // Debug: show what we're getting
                return (
                  <div key={index} className="text-xs text-gray-400">
                    {JSON.stringify(part)}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {status === 'streaming' && (
          <div className="flex items-center gap-2 text-gray-500">
            <span className="animate-pulse">●●●</span>
            <span>Thinking...</span>
          </div>
        )}
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput('');
          }
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={status !== 'ready'}
          placeholder="Ask me anything..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button 
          type="submit" 
          disabled={status !== 'ready'}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg"
        >
          Send
        </button>
      </form>
    </div>
  );
}