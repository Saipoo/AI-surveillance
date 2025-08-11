'use server';
/**
 * @fileOverview Analyzes an image for various hand signs.
 * This file exports:
 * - analyzeImageForSign: A function that takes an image and returns a detected hand sign.
 * - AnalyzeSignInput: The input type for the analyzeImageForSign function.
 * - AnalyzeSignOutput: The output type for the analyzeImageForSign function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { HandSign, handSigns } from '@/lib/types';


const AnalyzeSignInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo from a camera feed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeSignInput = z.infer<typeof AnalyzeSignInputSchema>;

const AnalyzeSignOutputSchema = z.object({
  sign: z.enum(handSigns).nullable().describe("The hand sign detected in the image, or null if no sign is detected."),
});
export type AnalyzeSignOutput = z.infer<typeof AnalyzeSignOutputSchema>;


export async function analyzeImageForSign(input: AnalyzeSignInput): Promise<AnalyzeSignOutput> {
  return analyzeSignFlow(input);
}

const prompt = ai.definePrompt({
    name: 'analyzeSignPrompt',
    input: { schema: AnalyzeSignInputSchema },
    output: { schema: AnalyzeSignOutputSchema },
    prompt: `You are an AI expert in recognizing hand gestures. Analyze the provided image to determine if it contains any of the following hand signs:
- 'Help': Thumb tucked, four fingers up.
- 'SOS': Three fingers up (S), closed fist (O), three fingers up again (S).
- 'Distress': Waving both arms overhead.
- 'OK': Thumb and index finger form a circle.
- 'Thumbs Up': Standard thumbs up gesture.
- 'Stop': Palm facing forward, fingers extended.
- 'Point': Index finger pointing to a direction.
- 'Silence': Index finger over the lips.
- 'Come Here': Index finger curling towards the body.
- 'Go Away': Hand pushing away from the body.
- 'I am Hurt': Hand clutching chest or other body part.
- 'Need Water': Hand to mouth in a C-shape.

If one of these is detected, return the corresponding sign. If the image shows no recognizable sign, return null for the sign.

Image: {{media url=imageDataUri}}
`,
});

const analyzeSignFlow = ai.defineFlow(
  {
    name: 'analyzeSignFlow',
    inputSchema: AnalyzeSignInputSchema,
    outputSchema: AnalyzeSignOutputSchema,
  },
  async (input) => {
    // In a real application, you would use the AI prompt.
    // For demonstration, we'll simulate the detection.
    const roll = Math.random();
    if (roll < 0.1) return { sign: 'Help' };
    if (roll < 0.2) return { sign: 'SOS' };
    if (roll < 0.3) return { sign: 'Stop' };
    // This can be expanded for other signs

    // For real analysis, uncomment the following:
    // const { output } = await prompt(input);
    // return output!;
    
    return { sign: null };
  }
);
