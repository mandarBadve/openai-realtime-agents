import { RealtimeAgent, tool } from '@openai/agents/realtime';

const vectorStoreId =
  process.env.NEXT_PUBLIC_VECTOR_VOICE_STORE_ID ??
  process.env.NEXT_PUBLIC_FILE_SEARCH_VECTOR_STORE_ID;

if (!vectorStoreId) {
  throw new Error(
    'NEXT_PUBLIC_VECTOR_VOICE_STORE_ID (or NEXT_PUBLIC_FILE_SEARCH_VECTOR_STORE_ID) is required for the vectorVoiceSearch agent.',
  );
}

async function runVectorSearch(query: string) {
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
            'You summarize internal knowledge base snippets. Include the source file path when citing a snippet.',
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
    const errBody = await response.text();
    throw new Error(`Vector search failed: ${errBody}`);
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

  return (
    answer ||
    "I couldn't find a relevant snippet in the knowledge base right now."
  );
}

const vectorSearchTool = tool({
  name: 'vectorSearch',
  description:
    'Search the voice knowledge base (vector store) for the most relevant snippet related to the user request.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The exact natural language request from the caller.',
      },
    },
    required: ['query'],
    additionalProperties: false,
  },
  async execute(rawInput: unknown) {
    const input = (rawInput ?? {}) as { query?: string };
    const query = input.query?.trim();
    if (!query) {
      return { answer: 'Missing query text for vector search.' };
    }

    try {
      const answer = await runVectorSearch(query);
      return { answer };
    } catch (error) {
      console.error('[vectorSearch] lookup failed', error);
      return {
        answer:
          "I'm having trouble reaching the knowledge base. Please try again in a moment.",
      };
    }
  },
});

export const vectorVoiceAgent = new RealtimeAgent({
  name: 'vectorVoice',
  voice: 'alloy',
  instructions: `
You are a speech-first knowledge agent. Every time the user asks a factual or how-to question, call the vectorSearch tool, then speak back a concise answer that cites the source file in natural language.

- Greet callers with "Hi, you're connected to the knowledge assistant. What would you like to know?"
- Responses must stay under three sentences.
- Always mention the source, for example "In README.md it states..."
- If vectorSearch reports no answer, apologize and ask for clarification.
`,
  tools: [vectorSearchTool],
  handoffs: [],
});

export const vectorVoiceScenario = [vectorVoiceAgent];
export const vectorVoiceCompanyName = 'Voice Vector Desk';

export default vectorVoiceScenario;
