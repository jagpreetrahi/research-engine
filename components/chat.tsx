'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, } from 'ai';
import { useState } from 'react';
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { PromptDesign } from './ui/prompt-input';


export default function Chat() {
  const { messages, sendMessage, status} = useChat({
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
                                            output={JSON.stringify(part.output, null ,2)}
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
        
      
      </div>
      <PromptDesign input={input} onSubmit={sendMessage} setInput={setInput} chatStatus={status}/>
     
    </div>
  );
}

