import { getServerSession } from "next-auth";
import { handleAuthOption } from "@/lib/auth";
import { google } from '@ai-sdk/google';
import { streamText, tool, convertToModelMessages, stepCountIs,} from 'ai';
import { NextRequest} from "next/server";
import { z } from 'zod';

interface maxSteps{
    maxSteps: number
}



export const POST = async(req: NextRequest) => {
   const session = await getServerSession(handleAuthOption);
   if(!session?.user.id){
      return Response.json({
         message: "You are not logged In",
         success: false
        },
       {
          status: 403
       })
    }
   const {messages} : {messages: any} = await req.json();
   console.log("the messages is ", messages);
   
   const model = google('gemini-2.5-flash');

   const prompt = `You are an expert Research AI Agent. Your goal is to provide deep, fact-based insights by effectively using the tools provided.
        ### OPERATIONAL RULES:
        1. **Always Verify**: If a user asks for facts, prices, or current events, use the 'researchEngine' tool immediately. Do not rely on your internal training data for post-2024 information.
        2. **Step-by-Step Synthesis**: 
        - First, analyze the search results. 
        - Second, extract the most relevant data.
        - Third, synthesize a coherent answer that addresses the user's specific intent.

        ### FORMATTING GUIDELINES:
        - **Citations**: Every claim must be cited. Use markdown links: [Source Title](URL). 
        - **Data Visualization**: Use Markdown Tables for comparing prices, specs, or dates. 
        - **Structure**: Use Bold headers for different sections of the research.
        - **Clarity**: If search results are conflicting (e.g., different prices on different sites), highlight this discrepancy to the user.

        ### TONE:
        Professional, objective, and analytical. Avoid conversational fluff like "I found this for you." Start directly with the findings.`
   try {
       const result = streamText({
           model,
           system: prompt,
           stopWhen: stepCountIs(5),
           messages: await convertToModelMessages(messages),
           maxRetries: 3,
           tools: {
               researchEngine: tool({
                   description: "Use this tool when you need to research or look up information that you don't have in your knowledge base",
                   inputSchema: z.object({
                       query: z.string().describe("The research query or question to investigate"),
                       max_results : z.number().describe("Maximum number of results"),
                    }),
                   execute: async ({query, max_results = 5}) => {
                       try {
                             // calling the tavily for searching
                            const searchResult = await callingTavily(query, max_results);
                            return searchResult.map((result: any) => ({
                                title: result.title,
                                snippet: result.content,
                                source: result.url

                            }))
                       } catch (error) {
                           console.error('Tavily error:', error);
                           // Return error info so AI can inform user
                           return [{
                               title: "Search Error",
                               snippet: "Unable to fetch results. Please try again.",
                               source: ""
                           }];
                       }

                    }
                   
               }),
            },
            
           
        })
     return  result.toTextStreamResponse()
        
   } catch (error) {
       return Response.json({
           message: "Error processing request",
           success: false,
           error: error instanceof Error ? error.message : 'Unknown error'
       }, { status: 500 });
   }
   
}

async function callingTavily(query: string, max_results: number) {
    // apikey 
    const apikey = process.env.TAVILY_API;
    
    if(!apikey){
         throw new Error('TAVILY_API_KEY not configured');
    }
    // calling the tavily
    const response  = await fetch('https://api.tavily.com/search', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apikey}`
        },
        body: JSON.stringify({
            query: query,
            max_results: max_results
        })
    })
    if (!response.ok) {
        throw new Error(`Tavily API error: ${response.status}`);
    }
    const data = await response.json();

    return data.results;
  
}
