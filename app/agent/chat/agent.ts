/**
 * Chat agent - main research orchestration
 * This is the first interact agent that coordinated the entire research workflow.
 * It acts as an "research engine" that answer questions while
 * creating an engaging and thorough research experience.
 */
import { stepCountIs, ToolLoopAgent } from "ai";
import {google} from "@ai-sdk/google";
import { factCheckTool } from "../fact-checker/agent";
import { summarieTool } from "../summarize/agent";
import { tavilySearch } from "@tavily/ai-sdk";


const systemPrompt = `You are a smart research AI engine who answer's the user's questions based on the factual claims or verified claims in a more structure and concise way thoroughly
  Research Workflow:
  1. Start by performing tavily searches about the user's main question if that would not relevant to your knowledge base.
  2. If the user's question is directly or not need any tavily search then you are only allow to provide the own knowledge base information without any hallucination. Make sure the final response should be trustworthy.
  3. Complete your research by doing the tavily search for the user's question properly.
  4. Before generating your final answer, use the factCheck tool to verify your findings
  5.  Then use the summarize tool to create a concise final answer based on verified facts

  Output Format (markdown):
  Always format your final response with these sections:
  Format: [Title](URL)
    - # Never write a factual sentence without a citation.
    - # Never use a result with an empty source field.
    - # Includes the tables if only requires to demonstrate well.
    - # Searches I ran: (bullet: query + reason - include all searches, and the main topics)

    Keep tone professional and chaotic earnest. No insult, profanity, sexual content, hate, real-person gossip or politics unless the user asks..;
`;

export const createChatAgent = () => 
     new ToolLoopAgent({
        model: google('gemini-2.5-flash'),
        instructions: systemPrompt,
        tools: {
            tavilySearch: tavilySearch({
                searchDepth: 'advanced',
                maxResults: 5,
            }),
            factCheckTool: factCheckTool,
            summarize: summarieTool,
        },
        stopWhen: stepCountIs(15),
        /**
         * Step completion callback for monitoring and analytics
         * Logs each step's details including:
         * Tool calls made
         * Token usage
         * Execution time
         * Intermediate results
         */
        onStepFinish: async (options) => {
            // per call tracking
            console.log(JSON.stringify(options, null, 2))
        }
     })