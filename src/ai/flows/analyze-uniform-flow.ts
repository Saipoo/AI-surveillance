'use server';

/**
 * @fileOverview Analyzes if a person in the camera feed is wearing the registered uniform.
 * This file exports:
 * - analyzeImageForUniform: A function that compares a camera image to a registered uniform image.
 * - AnalyzeUniformInput: The input type for the analyzeImageForUniform function.
 * - AnalyzeUniformOutput: The output type for the analyzeImageForUniform function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeUniformInputSchema = z.object({
  cameraImageUri: z
    .string()
    .describe(
      "A photo from a camera feed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  registeredUniformUri: z
    .string()
    .describe(
      "The registered uniform image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeUniformInput = z.infer<typeof AnalyzeUniformInputSchema>;


const AnalyzeUniformOutputSchema = z.object({
  isMatch: z.boolean().describe("Whether the person in the camera feed is wearing the registered uniform."),
});
export type AnalyzeUniformOutput = z.infer<typeof AnalyzeUniformOutputSchema>;


export async function analyzeImageForUniform(input: AnalyzeUniformInput): Promise<AnalyzeUniformOutput> {
  return analyzeUniformFlow(input);
}


const prompt = ai.definePrompt({
    name: 'analyzeUniformPrompt',
    input: { schema: AnalyzeUniformInputSchema },
    output: { schema: AnalyzeUniformOutputSchema },
    prompt: `You are an AI system that verifies if a person is wearing a specific uniform.

You will be given two images:
1. A reference image of the official registered uniform.
2. An image from a live camera feed showing a person.

Analyze the image from the camera feed and determine if the person is wearing a uniform that matches the reference image. Consider color, pattern, and logo if visible.

If the uniform matches, return true. Otherwise, return false.

Registered Uniform Reference:
{{media url=registeredUniformUri}}

Camera Feed Image:
{{media url=cameraImageUri}}
`,
});


const analyzeUniformFlow = ai.defineFlow(
  {
    name: 'analyzeUniformFlow',
    inputSchema: AnalyzeUniformInputSchema,
    outputSchema: AnalyzeUniformOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
