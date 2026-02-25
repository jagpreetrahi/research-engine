import { getServerSession, } from "next-auth";
import { handleAuthOption } from "@/lib/auth";
import { google } from '@ai-sdk/google';
import { streamText, tool, pruneMessages, stepCountIs, type UIMessage, convertToModelMessages} from 'ai';
import { NextRequest} from "next/server";
import { z } from 'zod';

interface TavilyResult{
    title: string,
    content: string,
    url: string
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
    
   const {messages} : {messages: UIMessage[]} = await req.json();
   const modalMessages = await convertToModelMessages(messages)
   const model = google('gemini-2.5-flash');
    const prompt =`You are a Research AI Agent.

        DECISION RULE — silently classify before every response:
        - NEEDS researchEngine: current events, prices, weather, sports stats, 
        match results, standings, any data after 2024, anything that changes over time
        - NO researchEngine: math, code, stable concepts, geography facts, 
        definitions, things that never change

        MANDATORY WORKFLOW when researchEngine is needed:
        Step 1 → call researchEngine
        Step 2 → ALWAYS call factChecker after researchEngine, no exceptions
        Step 3 → write final response only after factChecker confirms isSufficient: true

        CITATION RULE:
        Every factual claim must be cited using the source field from researchEngine results.
        Format: [Title](URL)
        Never write a factual sentence without a citation.
        Never use a result with an empty source field.
    `
    let researchHasRun = false;
    try {
       const result = streamText({
           model,
           system: prompt,
           stopWhen: stepCountIs(5),
           messages: modalMessages,
           maxRetries: 3,
           tools: {
               researchEngine: tool({
                   description: `Search the web for current data. 
                        IMPORTANT: After receiving results, you MUST call factChecker 
                        before writing your final response.
                    `,
                   inputSchema: z.object({
                       query: z.string(),
                       max_results : z.number().default(5).describe("Maximum number of results"),
                    }),
                   execute: async ({query, max_results}) => {
                       try {
                            console.log("inside the research engine tool")
                            researchHasRun = true
                            console.log(researchHasRun);
                            // calling the tavily for searching
                            const searchResult = await callingTavily(query, max_results);
                            if(!searchResult){
                                return [{
                                    title: "Search is Unavailable",
                                    snippet: "Unable to fetch results. Please try again",
                                    source: ""
                                }]
                            }
                            
                            return searchResult.map((result: TavilyResult) => ({
                                title: result.title,
                                snippet: result.content,
                                source: result.url

                            }))
                       } catch (error) {
                           console.error('Tavily error:', error);
                           // Return error info so AI can inform user
                           return [{
                               title: "Internal Error",
                               snippet: "Something went wrong, please try later",
                               source: ""
                           }];
                       }

                    }
                }),
                factChecker: tool({
                    description: `ALWAYS call this after researchEngine before responding.
                       Evaluates if gathered research is sufficient and accurate.
                     `,
                    inputSchema: z.object({
                        findings: z.string().describe("The information gathered so far"),
                        query: z.string().describe("the original user intent")

                    }),
                    execute: async ({findings, query}) => {
                        console.log("inside the fact checker tool ")
                        console.log(researchHasRun)
                            if(!researchHasRun) {
                                return  {
                                    isSufficient: false,
                                    suggestion: "Call researchEngine first."
                                }
                            }
                            return {
                                isSufficient: true,
                                evaluation: findings.length > 100
                                    ? "Data is sufficient. Proceed to write the analysis."
                                    : "Data seems thin. Consider calling researchEngine again with a refined query."
                            }
                        }
                   })
               },
            
            })
        return  result.toUIMessageStreamResponse()
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
        return [{
            "title": "COnfiguration Error",
            "snippet": "Search Search Unavailbale",
            "source": ""
        }]
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
