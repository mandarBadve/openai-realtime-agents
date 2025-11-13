import { simpleHandoffScenario } from './simpleHandoff';
import { customerServiceRetailScenario } from './customerServiceRetail';
import { chatSupervisorScenario } from './chatSupervisor';
import { fileSearchVoiceScenario } from './fileSearchVoice';
import { vectorVoiceScenario } from './vectorVoiceSearch';
import { tutorScenario } from './tutorVoice';

import type { RealtimeAgent } from '@openai/agents/realtime';

// Map of scenario key -> array of RealtimeAgent objects
export const allAgentSets: Record<string, RealtimeAgent[]> = {
  // simpleHandoff: simpleHandoffScenario,
  // customerServiceRetail: customerServiceRetailScenario,
  // chatSupervisor: chatSupervisorScenario,
  // fileSearchVoice: fileSearchVoiceScenario,
  // vectorVoice: vectorVoiceScenario,
  tutor: tutorScenario,
};

export const defaultAgentSetKey = 'chatSupervisor';
