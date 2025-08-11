'use server';

/**
 * @fileOverview Analyzes an image to detect if a person is wearing a face mask.
 * This file exports:
 * - analyzeImageForMask: A function that takes an image and returns the mask status.
 * - AnalyzeMaskInput: The input type for the analyzeImageForMask function.
 * - AnalyzeMaskOutput: The output type for the analyzeImageForMask function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MaskStatus } from '@/lib/types';

const maskStatuses: [MaskStatus, ...MaskStatus[]] = ['Worn', 'Not Worn', 'Unknown'];

const AnalyzeMaskInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo from a camera feed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeMaskInput = z.infer<typeof AnalyzeMaskInputSchema>;


const AnalyzeMaskOutputSchema = z.object({
  maskStatus: z.enum(maskStatuses).describe("The status of face mask wearing in the image."),
});
export type AnalyzeMaskOutput = z.infer<typeof AnalyzeMaskOutputSchema>;


export async function analyzeImageForMask(input: AnalyzeMaskInput): Promise<AnalyzeMaskOutput> {
  return analyzeMaskFlow(input);
}


const prompt = ai.definePrompt({
    name: 'analyzeMaskPrompt',
    input: { schema: AnalyzeMaskInputSchema },
    output: { schema: AnalyzeMaskOutputSchema },
    prompt: `You are an AI model that specializes in image analysis for safety compliance. Analyze the provided image and determine if the person in it is wearing a face mask.

- If a mask is clearly being worn correctly, return 'Worn'.
- If a mask is not being worn, or is worn incorrectly (e.g., under the chin), return 'Not Worn'.
- If there is no person in the image, or it's impossible to tell, return 'Unknown'.

Image: {{media url=imageDataUri}}
`,
});


const analyzeMaskFlow = ai.defineFlow(
  {
    name: 'analyzeMaskFlow',
    inputSchema: AnalyzeMaskInputSchema,
    outputSchema: AnalyzeMaskOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
