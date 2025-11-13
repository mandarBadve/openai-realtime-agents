export interface TutorDoc {
  id: string;
  title: string;
  path: string;
  body: string;
}

export const tutorDocs: TutorDoc[] = [
  {
    id: 'readme-overview',
    title: 'Realtime API Overview',
    path: 'README.md',
    body: `The Realtime API pairs low-latency audio streaming with the OpenAI Agents SDK so that voice agents can take tool actions mid-conversation. Two built-in demos ship with this repo: a chat-supervisor pattern and a sequential handoff pattern.`,
  },
  {
    id: 'setup',
    title: 'Setup Instructions',
    path: 'README.md',
    body: `To run the demo install dependencies with npm install, set OPENAI_API_KEY, then start Next.js via npm run dev. Navigate to http://localhost:3000 to try the scenarios.`,
  },
  {
    id: 'architecture',
    title: 'App Architecture',
    path: 'src/app/App.tsx',
    body: `The App.tsx component coordinates transcript logging, event logging, codec selection, push-to-talk state, and the realtime session hook. It connects through useRealtimeSession which wraps RealtimeSession and wires guardrails plus tool breadcrumbs.`,
  },
];

export function fuzzyMatchDocs(query: string) {
  const normalized = query.toLowerCase().split(/\s+/).filter(Boolean);
  return tutorDocs
    .map((doc) => {
      const haystack = `${doc.title} ${doc.body}`.toLowerCase();
      const score = normalized.reduce(
        (acc, term) => acc + (haystack.includes(term) ? 1 : 0),
        0,
      );
      return { doc, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ doc }) => doc);
}
