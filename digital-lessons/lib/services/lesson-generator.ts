import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import * as ts from 'typescript';

const LESSON_GENERATION_PROMPT = `You are an expert educational content creator and TypeScript/React developer. Your task is to create an interactive, engaging lesson as a React component.

**CRITICAL REQUIREMENTS:**
1. Generate ONLY valid TypeScript/React code
2. The component MUST be a default export function component
3. Use ONLY React hooks (useState, useEffect, useCallback, useMemo) - they will be provided
4. DO NOT include any import statements
5. The component should be self-contained and interactive
6. Use modern, clean UI with proper styling using Tailwind CSS classes
7. Include educational content, examples, and interactive elements where appropriate
8. For quizzes: include questions, multiple choice options, answer checking, and score tracking
9. For explanations: include clear examples, visualizations (using HTML/CSS), and step-by-step breakdowns
10. Make it engaging and suitable for students
11, My website is dark themed so make sure you are using the colors that work with dark themes and light themes as well. You can use tailwindcss here 
**LESSON OUTLINE:**
{outline}

**OUTPUT FORMAT:**
Return ONLY the TypeScript code for the React component. No markdown, no explanations, no code blocks - just the raw TypeScript code starting with "function" or "const".

**EXAMPLE STRUCTURE:**
function LessonComponent() {{
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-2">Lesson Title</h2>
        <p className="text-lg opacity-90">Lesson description</p>
      </div>
      
      {{/* Interactive content here */}}
    </div>
  );
}}

export default LessonComponent;

Remember: Make it educational, interactive, and visually appealing!`;

export class LessonGeneratorService {
  private model: ChatOpenAI;
  private chain: any;

  constructor() {
    // Verify API key is present
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    this.model = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4000,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = ChatPromptTemplate.fromTemplate(LESSON_GENERATION_PROMPT);
    this.chain = prompt.pipe(this.model).pipe(new StringOutputParser());
  }

  async generateLesson(outline: string): Promise<{ code: string; title: string }> {
    try {
      // Generate the lesson code
      let code = await this.chain.invoke({ outline });

      // Clean up the code - remove markdown code blocks if present
      code = this.cleanGeneratedCode(code);

      // Extract title from the outline or generate one
      const title = this.extractTitle(outline);

      // Validate the generated TypeScript
      this.validateTypeScript(code);

      return { code, title };
    } catch (error) {
      console.error('Error generating lesson:', error);
      
      // Provide specific error messages for common issues
      if (error instanceof Error) {
        if (error.message.includes('403') || error.message.includes('Forbidden')) {
          throw new Error(
            'OpenAI API access denied. Please check: 1) API key is valid, 2) Account has billing enabled, 3) You have access to GPT-4o model'
          );
        }
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable');
        }
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          throw new Error('OpenAI API rate limit exceeded. Please try again in a few moments');
        }
      }
      
      throw new Error(
        `Failed to generate lesson: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private cleanGeneratedCode(code: string): string {
    // Remove markdown code blocks if present
    let cleaned = code.trim();
    
    // Remove ```typescript, ```tsx, ```jsx, or ```javascript at the start
    cleaned = cleaned.replace(/^```(?:typescript|tsx|jsx|javascript|ts|js)?\n?/i, '');
    
    // Remove closing ``` at the end
    cleaned = cleaned.replace(/\n?```\s*$/i, '');
    
    // Trim any extra whitespace
    cleaned = cleaned.trim();
    
    return cleaned;
  }

  private extractTitle(outline: string): string {
    // Simple title extraction - take first sentence or reasonable length
    const firstLine = outline.split('\n')[0].trim();
    if (firstLine.length < 100) {
      return firstLine;
    }
    return firstLine.substring(0, 97) + '...';
  }

  private validateTypeScript(code: string): void {
    try {
      // Use TypeScript compiler to check for syntax errors
      const result = ts.transpileModule(code, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2020,
          module: ts.ModuleKind.ESNext,
          jsx: ts.JsxEmit.React,
          strict: false,
        },
      });

      // Check if there are any diagnostics (errors)
      if (result.diagnostics && result.diagnostics.length > 0) {
        const errors = result.diagnostics
          .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))
          .join('\n');
        throw new Error(`TypeScript validation failed: ${errors}`);
      }
    } catch (error) {
      console.error('TypeScript validation error:', error);
      throw new Error(
        `Generated code has syntax errors: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
