import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-emergency-flow.ts';
import '@/ai/flows/provide-contextual-help.ts';
import '@/ai/flows/analyze-emergency-flow.ts';
import '@/ai/flows/analyze-mask-flow.ts';
import '@/ai/flows/analyze-uniform-flow.ts';
import '@/ai/flows/analyze-sign-flow.ts';
