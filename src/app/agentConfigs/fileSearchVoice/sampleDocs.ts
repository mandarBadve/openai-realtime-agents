export interface SampleDoc {
  title: string;
  path: string;
  summary: string;
  content: string;
}

export const sampleDocs: SampleDoc[] = [
  {
    title: 'Realtime API Agents Overview',
    path: 'README.md',
    summary:
      'Explains the two demo patterns (chat-supervisor and sequential handoff) plus setup instructions for the Next.js app.',
    content:
      'This demo pairs the OpenAI Realtime API with the Agents SDK to showcase voice-first workflows, including a chat agent supervised by GPT-4.1 and a sequential handoff of intent-specific agents for Snowy Peak Boards.',
  },
  {
    title: 'UI Architecture',
    path: 'src/app/App.tsx',
    summary:
      'Details how the App component wires transcript logs, event logs, codec selection, and agent switching into a single-page control room.',
    content:
      'The App component coordinates search params, session connection, simulated user turns, push-to-talk state, guardrails, and audio recording so developers can inspect every part of a realtime call.',
  },
  {
    title: 'Supervisor Pattern',
    path: 'src/app/agentConfigs/chatSupervisor/index.ts',
    summary:
      'Describes the realtime chat agent that funnels most requests through a supervisor model via getNextResponseFromSupervisor.',
    content:
      'The chatSupervisor scenario demonstrates how a lightweight realtime agent can keep the conversation natural while delegating logic and tool usage to a higher-capability supervisor model that calls policy/account/store tools.',
  },
  {
    title: 'Customer Service Retail Scenario',
    path: 'src/app/agentConfigs/customerServiceRetail/index.ts',
    summary:
      'Introduces the Snowy Peak Boards multi-agent flow for authentication, returns, and sales handoffs.',
    content:
      'Four agents—authentication, returns, sales, and a simulated human—share detailed prompts, verification rules, and policies so the system can hand customers between specialists without repeating context.',
  },
];
