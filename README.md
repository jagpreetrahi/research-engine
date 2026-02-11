# Agentic AI Research Engine

An autonomous research assistant that bridges the gap between LLM knowledge cutoffs and real-time data using **Gemini 2.5 Flash** and the **Tavily Search API**.

![Next.js](https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=next.js&logoColor=white)
![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-000?style=for-the-badge&logo=vercel&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)

##  Overview
Unlike standard chatbots, this engine functions as an **Autonomous Agent**. It doesn't just "chat"; it performs **multi-step reasoning** to identify when its internal knowledge is insufficient, triggers a real-time web search, and synthesizes the findings into a cited research report.

##  Key Features
- **Agentic Workflows**: Utilizes `maxSteps` to allow the AI to "think," "search," and "summarize" in a single request.
- **Real-Time Web Access**: Integrated with **Tavily AI** for high-precision, LLM-optimized search results.
- **Streaming UI**: Leverages Vercel AI SDK's `useChat` for instant token-by-token streaming.
- **Source Citations**: Automatically generates markdown links for every fact retrieved from the web.

## Architecture
The system follows a **ReAct (Reason + Act)** pattern:

1. **User Prompt**: "What is the latest price of iPhone 17?"
2. **Decision Layer**: Gemini detects a need for real-time data.
3. **Tool Execution**: Agent calls `researchEngine` tool (Tavily API).
4. **Synthesis**: Agent receives search snippets and summaries them based on the system prompt.
5. **Final Output**: A structured report with tables and clickable citations.

##  Tech Stack
- **Framework**: Next.js 15 (App Router)
- **AI Orchestration**: Vercel AI SDK (Core, UI, & Stream)
- **Language Models**: Google Gemini 2.0 Flash / Groq Llama 3.3
- **Search Engine**: Tavily Search API
- **Styling**: Tailwind CSS & Shadcn/UI

## Getting Started

### Setup Instructions
1. **Clone the Repo**:
   ```bash
   git clone <repo url>

2. **Environment Variables: Create a .env.local file**:
   ```bash      
   TAVILY_API_KEY=your_key_here
   GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
  

## Install & Run:
```bash
npm install
npm run dev