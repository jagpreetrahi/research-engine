'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, } from 'ai';
import { useState } from 'react';
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";



export default function Chat() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat/',
    }),
    //   async onToolCall({ toolCall }) {
    //   // Check if it's a dynamic tool first for proper type narrowing
    //   if (toolCall.dynamic) {
    //     return;
    //   }

    //   if (toolCall.toolName === 'research-engine') {
    //     // No await - avoids potential deadlocks
    //     addToolOutput({
    //       tool: 'research-engine',
    //       toolCallId: toolCall.toolCallId,
    //       output: 
    //     });
    //   }
    // },
  });
   
  const [input, setInput] = useState('');

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <div className="flex-1  overflow-y-auto space-y-4 mb-4">
        {messages.map(message => (
          
          <div 
            key={message.id}
            className={`p-2 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-100 ml-auto max-w-[80%]' 
                : 'bg-gray-100 mr-auto max-w-[80%]'
            }`}
          >
            <div className="font-semibold mb-1">
              {message.role === 'user' ? ' You' : 'AI'}
            </div>
            
            <div className="space-y-2">
              {message.parts.map((part,index) => {
                const stableKeys = part.type === "tool-researchEngine"
                  ? `${part.toolCallId}-${index}-${part.state}`
                  : `${part.type}-${index}`
                switch(part.type) {
                  case 'text':
                    return <div key={`text-${index}`}>{part.text}</div>
                  
                  // for tool parts, use the typed tool part names:
                  case 'tool-researchEngine': {
                      const callId = part.toolCallId;

                      switch(part.state) {
                        case('input-streaming'):
                          return (
                            <div key={stableKeys}>
                                <Tool>
                               <ToolHeader state={part.state} type={part.type} />
                                <ToolContent>
                                  <ToolInput input={part.input} />
                                </ToolContent>
                            </Tool> 
                            </div>
                           
                          );
                        case('input-available'):
                          return <div key={stableKeys}>
                              <Tool>
                               <ToolHeader state={part.state} type={part.type} />
                                <ToolContent>
                                  <ToolInput input={part.input} />
                                </ToolContent>
                            </Tool> 
                          </div>; 
                          
                        case('output-available'):
                          if(typeof part.output === 'object') {
                            return <div key={stableKeys}>
                                   <Tool>
                                      <ToolHeader state={part.state} type={part.type} />
                                      <ToolContent>
                                        <ToolInput input={part.input} />
                                         <ToolOutput
                                            errorText={part.errorText}
                                            output={part.output}
                                          />
                                        
                                      </ToolContent>
                                    </Tool>
                            </div>

                          }
                        case 'output-error':
                          return (
                            <div key={stableKeys}>
                              Error getting results: {part.errorText}
                            </div>
                          ); 
                        default: return null   
                      }
                    
                  }
                    
                }

              })}
            </div>
          </div>
        ))}
        
        {/* {status === 'streaming' && (
          <div className="flex items-center gap-2 text-gray-500">
            <span className="animate-pulse">●●●</span>
            <span>Thinking...</span>
          </div>
        )} */}
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          if (input.trim()) {
              sendMessage({
                parts: [{ type: 'text', text: input }],
              });
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

function addToolOutput(arg0: { tool: string; toolCallId: string; output: string; }) {
  throw new Error('Function not implemented.');
}
