/**
 * this agent is responsible for verifiying the research findings against
 * the source and make sure only the verified information makes it into the final answer without any hallucinations
 */

import { ToolLoopAgent, stepCountIs, tool} from "ai";
import { google } from '@ai-sdk/google';
import { z} from "zod"



/**
 * Instruction for the fact -agent checker
 * 
 * Verifications process
 * 1. Identify the factual statement that can be verified
 * 2. Source analysis claims with the provided citations
 * Evaluate the strength f supoorting evidence
 */

const factCheckerInstruction = `You are a fact-hecker agent. Your job is to verify the claim and the information from thre research notes
  Your task:
  - Review the provided the research notes and the claims.
  - Identify key factual claims that need verification.
  - Cross-reference claims with the provided sources
  - Mark each claim as :
    - Verified: Multiple source agree, or claim is well supported.
    - Uncertain: Conflicting information or insufficient sources.
    - Contradicted: Sources disagrees or claim is unsupported.

   Output Format
   # Fact Check
   
   ##verified claims
   - [claim text] (Sources: [citation])

   ## uncertain claims
   - [claim text] (Reason: [why unccertain], Sources: [citiation])

   ## Contradicted Claims
   - [claim text] (Reason: [why contradicted], Sources: [citation])
   
   Be thoroughly but concise. Focus on factual accuracy.


`
const factCheckerAgent = new ToolLoopAgent({
    model: google('gemini-2.5-flash'),
    instructions: factCheckerInstruction,
    tools: {}, // No external tool calls - only for analyzes 
    stopWhen: stepCountIs(5)
})

export const factCheckTool = tool({
    description: "Fact-checker research notes and claims. Verifies information against sources and identifies verified, uncertain or contradicted claims.",
    inputSchema: z.object({
        researchNotes: z.string().describe(
            "The research notes, claims or information to fact-check. Should include the sources and the citations.",
        )
    }),
    execute: async ({researchNotes}, {abortSignal}) => {
        try {
            const result = await factCheckerAgent.generate({
                prompt: `Please fact-check the following research notes:\n\n${researchNotes}`,
                abortSignal
            })
            if(!result){
                return Response.json({
                    success: false,
                    message: "Expected results not have factual claims"
                }, {status: 404})
            }
            return result.text;

        } catch (error) {
            console.log("the errror is ", error)
            return Response.json({
                success: false,
                message: error
            }, {status: 500})
        }
    }
})