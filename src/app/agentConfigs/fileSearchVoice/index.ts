import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { sampleDocs } from './sampleDocs';

function rankDocuments(query: string) {
  const searchTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (searchTerms.length === 0) {
    return [];
  }

  return sampleDocs
    .map((doc) => {
      const haystack = `${doc.title} ${doc.summary} ${doc.content}`.toLowerCase();
      const score = searchTerms.reduce((acc, term) => acc + (haystack.includes(term) ? 1 : 0), 0);
      return score > 0
        ? {
            doc,
            score,
          }
        : null;
    })
    .filter((entry): entry is { doc: (typeof sampleDocs)[number]; score: number } => Boolean(entry))
    .sort((a, b) => b.score - a.score);
}

const fileSearchTool = tool({
  name: 'file_search',
  description:
    'Search the local project knowledge base (README, agent configs, and UI overview) to retrieve supporting text for user questions.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'What the user wants to know, typically their last utterance.',
      },
      topK: {
        type: 'integer',
        minimum: 1,
        maximum: 5,
        description: 'Maximum number of snippets to return, defaults to 3.',
      },
    },
    required: ['query'],
    additionalProperties: false,
  },
  async execute(input: { query: string; topK?: number }) {
    const topK = Math.min(Math.max(input.topK ?? 3, 1), 5);
    const ranked = rankDocuments(input.query).slice(0, topK);

    return {
      query: input.query,
      results: ranked.map(({ doc, score }) => ({
        title: doc.title,
        path: doc.path,
        summary: doc.summary,
        snippet: doc.content,
        relevance: score,
      })),
    };
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
- Whenever the user asks for factual information about the project, ALWAYS call file_search before you answer, even if you think you know the response.
- Summarize the most relevant snippet from the tool output and cite the file name conversationally.
- If file_search returns no results, ask the user to rephrase or explain what part of the repo they are interested in.

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
