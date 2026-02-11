import { getServerSession } from "next-auth";
import { handleAuthOption } from "@/lib/auth";
import { google } from '@ai-sdk/google';
import { streamText, tool, convertToModelMessages, UIMessage} from 'ai';
import { NextRequest} from "next/server";
import {  z } from 'zod';




export const POST = async(req: NextRequest) => {
   const session = await getServerSession(handleAuthOption);
   console.log("the sesssion is ", session)
   if(!session?.user.id){
      return Response.json({
         message: "You are not logged In",
         success: false
        },
       {
          status: 403
       })
    }
   const {messages} : {messages: UIMessage[]} = await req.json();
   console.log("the messages is ", messages);
   
   const model = google('gemini-2.5-flash')
   try {
       const result = streamText({
           model,
           messages: await convertToModelMessages(messages),
           
           tools: {
               researchEngine: tool({
                   description: "Use this tool when you need to research or look up information that you don't have in your knowledge base",
                   inputSchema: z.object({
                       query: z.string().describe("The research query or question to investigate"),
                       max_results : z.number().describe("Maximum number of results"),
                    }),
                   execute: async ({query, max_results = 5}) => {
                       console.log('Calling Tavily with:', query);

                       // calling the tavily for searching
                       const searchResult = await callingTavily(query, max_results);

                        console.log('Got', searchResult.length, 'results');

                       return {
                           results: searchResult
                       };
                   }
               }),
           },
            
           
       })
         console.log("the resulrr is ", result)
        return result.toTextStreamResponse()
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
    if(response){
        const data =  await response.json()
        console.log("the data is", data);
        return data.results.slice(0, max_results).map((r: any) => ({
            title: r.title,
            snippet: r.content,
            url: r.url
        }))  
         
    }
    throw new Error("Function not implemented.");
}
