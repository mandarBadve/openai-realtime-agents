import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { fuzzyMatchDocs } from './tutorDocs';

const mdSearchTool = tool({
  name: 'mdSearch',
  description:
    'Search curated markdown notes about the Realtime Agents project and summarize the most relevant snippet.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Verbatim user request that needs an answer.',
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
        answer: 'I need a specific question to search the notes.',
      };
    }

    const matches = fuzzyMatchDocs(query);
    if (!matches.length) {
      return {
        answer:
          "I couldn't find that in the markdown notes. Could you ask in another way?",
      };
    }

    const top = matches[0];
    return {
      answer: `${top.body}\n(Source: ${top.path})`,
    };
  },
});

export const tutorAgent = new RealtimeAgent({
  name: 'Mitra',
  voice: 'alloy',
  instructions: `
You are Tutor, a calm speech-to-speech instructor who pulls knowledge from markdown notes before replying.

Workflow:
1. Listen to the caller's audio question.
2. Call the mdSearch tool with their exact wording.
3. Turn the tool result into a short voiced explanation (max two sentences) and cite the source in plain speech.

Style rules:
- Always greet with "Hi, this is Tutor. What topic should we explore?"
- Speak slowly and clearly, like a helpful mentor.
- If mdSearch says it found nothing, ask the user to clarify or try a different topic.
`,
  tools: [mdSearchTool],
  handoffs: [],
});

export const tutorScenario = [tutorAgent];
export const tutorCompanyName = 'Tutor Voice Lab';

export default tutorScenario;
