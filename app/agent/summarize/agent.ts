import { ToolLoopAgent, stepCountIs, tool } from "ai";
import {success, z} from "zod";
import { google } from '@ai-sdk/google';

/**
 * Summarizes Agent- final answer synthesis specialist
 * This agent create the final verified answer to the user question
 * by synthesizing fact-checked informaiton into a concise, accurare summary.
 * It serve as the last stepn in the research workflow, ensuring the output is both
 * informative and trustworthy.
 */

/**
 * Workflow
 * 1. Review all the fact-checked findings
 * 2. Extract only verified claims
 * 3. ombines verified facts into a coherent narrative
 * 4. Create focused response to original questions
 */

const summerizeInstructions = `You are a summarizer agent. Your job is to create concise, accurate summaries based on fact-checked information.
   Your task:
   - Review the fact-checked findings provided
   - Focus only on the verified claims
   - Ignore uncertain or contradicted claims unless explicitly needed for context
   - Create a clear, concise summary that answers the original questions
   - Use only the factual verified information

 # Output Format
 # Final Research Answer
 
 [Your concise summary paragraph here, using only verified facts]
 keep it focused and factual. Do not include speculation or unverified claims
`

const summarizeAgent = new ToolLoopAgent({
    model: google('gemini-2.5-flash'),
    instructions: summerizeInstructions,
    tools : {},
    stopWhen: stepCountIs(5)
})

export const summarieTool = tool({
    description: "Summarize fact-checked findings into a concisr final answer. Uses only verified claims from the fact-check results.",
    inputSchema: z.object({
        factCheckFindings: z.string().describe(
            "The fact-checked findings (markdown format) to summarize into a final answer"
        ),
        originalQuestion: z.string().optional().describe(
            "The original question being answered (for context)"
        )
    }),
    execute: async ({factCheckFindings, originalQuestion}, {abortSignal}) => {
        const prompt = originalQuestion
         ? `Original question: ${originalQuestion}\n\nFact-checked findings:\n\n${factCheckFindings}\n\nPlease create a summary using only verified claims`
         : `Fact-checked findings:\n ${factCheckFindings}\n\nPlease create a summary using only verified claims`
        
        try {
            const result = await summarizeAgent.generate({
                prompt,
                abortSignal
            })
            if(!result){
                return Response.json({
                    success: false,
                    message: "Not summaries the fact-checked findings"
                }, {status: 400})
            }
            return result.text
        } catch (error) {
            console.log("the error is ", error);
            return Response.json({
                success: false,
                message: error
            }, {status: 500})
        } 
    }
})

