import { RealtimeAgent, tool } from '@openai/agents/realtime';

const vectorStoreId = process.env.NEXT_PUBLIC_FILE_SEARCH_VECTOR_STORE_ID;

if (!vectorStoreId) {
  throw new Error(
    'NEXT_PUBLIC_FILE_SEARCH_VECTOR_STORE_ID is not defined. Set it to the OpenAI vector store id you want the file_search tool to use.',
  );
}

async function runVectorStoreQuery(query: string) {
  const response = await fetch('/api/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content:
            'You are a documentation summarizer. Quote the most relevant line and mention the file path the snippet came from.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
      tools: [{ type: 'file_search' }],
      attachments: [
        {
          tools: [{ type: 'file_search' }],
          vector_store_ids: [vectorStoreId],
        },
      ],
      parallel_tool_calls: false,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to query vector store');
  }

  const completion = await response.json();
  const outputItems: any[] = completion?.output ?? [];

  const answer = outputItems
    .filter((item) => item.type === 'message')
    .flatMap((msg: any) => msg.content ?? [])
    .filter((c: any) => c.type === 'output_text')
    .map((c: any) => c.text.trim())
    .join('\n')
    .trim();

  return answer || "I couldn't find a relevant snippet in the vector store.";
}

const fileSearchTool = tool({
  name: 'fileSearchProxy',
  description:
    'Look up documentation for the Realtime Agents repo via the OpenAI File Search API.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Exact question the user just asked.',
      },
    },
    required: ['query'],
    additionalProperties: false,
  },
  async execute(rawInput: unknown) {
    const input = (rawInput ?? {}) as { query?: string };
    const query = input.query?.trim();
    if (!query) {
      return {
        answer: 'Missing query text for file search.',
      };
    }

    try {
      const answer = await runVectorStoreQuery(query);
      return { answer };
    } catch (error) {
      console.error('[fileSearchProxy] vector search failed', error);
      return {
        answer:
          "Sorry, I'm having trouble reaching the documentation store right now.",
      };
    }
  },
});

export const fileSearchVoiceAgent = new RealtimeAgent({
  name: 'voiceFileSearch',
  voice: 'alloy',
  instructions: `
You are a friendly technical voice assistant that can verbally answer questions about the Realtime Agents demo repository.

# Style
- Keep a confident, upbeat delivery that sounds like an on-call developer walking a teammate through the codebase.
- Speak in short paragraphs (two sentences max) so the speech output feels natural.
- Mention the file or doc you pulled information from when you answer (for example, "In README.md it says...").

# Tool use
- Whenever the user asks for factual information about the project, ALWAYS call the fileSearchProxy tool before you answer, even if you think you know the response.
- Summarize the most relevant snippet from the tool output and cite the file name conversationally.
- If fileSearchProxy returns no results, ask the user to rephrase or explain what part of the repo they are interested in.

# Voice responses
- Greet the user with "Hi, this is the Realtime knowledge assistant—what would you like to explore?" when the conversation starts.
- After providing an answer, invite the user to continue with "Anything else you'd like me to look up?"
- If the user requests something unrelated to the repo, explain that you only have access to the shared documentation.
`,
  tools: [fileSearchTool],
  handoffs: [],
});

export const fileSearchVoiceScenario = [fileSearchVoiceAgent];
export const fileSearchVoiceCompanyName = 'Realtime Knowledge Base';

export default fileSearchVoiceScenario;
