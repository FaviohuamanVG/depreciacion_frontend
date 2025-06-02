'use server';

/**
 * @fileOverview A flow to generate a basic Angular project with a pre-defined folder structure.
 *
 * - generateAngularProject - A function that handles the project generation process.
 * - GenerateAngularProjectInput - The input type for the generateAngularProject function.
 * - GenerateAngularProjectOutput - The return type for the generateAngularProject function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAngularProjectInputSchema = z.object({
  folderStructureDescription: z
    .string()
    .describe(
      'A description of the desired Angular project folder structure, including main folders like core, feature, layout, and shared, and their subfolders and purposes.'
    ),
});
export type GenerateAngularProjectInput = z.infer<typeof GenerateAngularProjectInputSchema>;

const GenerateAngularProjectOutputSchema = z.object({
  projectFiles: z
    .record(z.string())
    .describe('A map of file paths to file contents for the generated Angular project.'),
});
export type GenerateAngularProjectOutput = z.infer<typeof GenerateAngularProjectOutputSchema>;

export async function generateAngularProject(input: GenerateAngularProjectInput): Promise<GenerateAngularProjectOutput> {
  return generateAngularProjectFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAngularProjectPrompt',
  input: {schema: GenerateAngularProjectInputSchema},
  output: {schema: GenerateAngularProjectOutputSchema},
  prompt: `You are an expert Angular project architect. Given the following description of the desired folder structure, generate a basic Angular project with the described structure. Ensure compatibility and avoid common version errors. Provide the output as a JSON object where the keys are file paths and the values are the file contents.\n\nFolder structure description: {{{folderStructureDescription}}}`,
});

const generateAngularProjectFlow = ai.defineFlow(
  {
    name: 'generateAngularProjectFlow',
    inputSchema: GenerateAngularProjectInputSchema,
    outputSchema: GenerateAngularProjectOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
