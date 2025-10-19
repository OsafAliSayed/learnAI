import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import * as ts from 'typescript';
import { PROMPT_ENHANCER, LESSON_GENERATION_PROMPT, TEACHING_PROMPT, EXERCISE_PROMPT } from './lesson-prompts';

export class LessonGeneratorService {
  private model: ChatOpenAI;
  private enhancerChain: ReturnType<ChatPromptTemplate['pipe']>;
  private generatorChain: ReturnType<ChatPromptTemplate['pipe']>;
  private teachingChain: ReturnType<ChatPromptTemplate['pipe']>;
  private exerciseChain: ReturnType<ChatPromptTemplate['pipe']>;

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

    // Create separate chains for enhancing prompts and generating content
    const enhancerPrompt = ChatPromptTemplate.fromTemplate(PROMPT_ENHANCER);
    this.enhancerChain = enhancerPrompt.pipe(this.model).pipe(new StringOutputParser());

    const generatorPrompt = ChatPromptTemplate.fromTemplate(LESSON_GENERATION_PROMPT);
    this.generatorChain = generatorPrompt.pipe(this.model).pipe(new StringOutputParser());
    
    // New chains for separated teaching and exercise generation
    const teachingPrompt = ChatPromptTemplate.fromTemplate(TEACHING_PROMPT);
    this.teachingChain = teachingPrompt.pipe(this.model).pipe(new StringOutputParser());
    
    const exercisePrompt = ChatPromptTemplate.fromTemplate(EXERCISE_PROMPT);
    this.exerciseChain = exercisePrompt.pipe(this.model).pipe(new StringOutputParser());
  }

  async generateLesson(userInput: string): Promise<{ code: string; title: string }> {
    console.log('[LessonGeneratorService] generateLesson start', { userInputPreview: userInput.slice(0, 120) });

    try {
      // Step 1: Enhance the user's input into a comprehensive lesson outline
      console.log('[LessonGeneratorService] Step 1: Enhancing user input...');
      const enhancedOutline = await this.enhancerChain.invoke({ userInput });
      console.log('[LessonGeneratorService] Enhanced outline generated successfully.');
      console.log('[LessonGeneratorService] Enhanced outline preview:', 
        typeof enhancedOutline === 'string' 
          ? enhancedOutline.slice(0, 200) 
          : String(enhancedOutline).slice(0, 200)
      );

      // Step 2: Generate the lesson code using the enhanced outline
      console.log('[LessonGeneratorService] Step 2: Generating lesson code...');
      const result = await this.generatorChain.invoke({ 
        outline: typeof enhancedOutline === 'string' ? enhancedOutline : String(enhancedOutline) 
      });
      console.log('[LessonGeneratorService] Lesson code generated successfully.');

      let code = typeof result === 'string' ? result : String(result);

      // Clean up the code - remove markdown code blocks if present
      code = this.cleanGeneratedCode(code);

      // Extract title from the enhanced outline
      const title = this.extractTitle(
        typeof enhancedOutline === 'string' ? enhancedOutline : String(enhancedOutline)
      );

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
  
  async generateTeachingComponent(userInput: string): Promise<{ code: string; title: string; outline: string }> {
    console.log('[LessonGeneratorService] generateTeachingComponent start', { userInputPreview: userInput.slice(0, 120) });

    try {
      // Step 1: Enhance the user's input into a comprehensive lesson outline
      console.log('[LessonGeneratorService] Step 1: Enhancing user input...');
      const enhancedOutline = await this.enhancerChain.invoke({ userInput });
      console.log('[LessonGeneratorService] Enhanced outline generated successfully.');
      
      // Step 2: Generate the teaching component code using the enhanced outline
      console.log('[LessonGeneratorService] Step 2: Generating teaching component code...');
      const result = await this.teachingChain.invoke({ 
        outline: typeof enhancedOutline === 'string' ? enhancedOutline : String(enhancedOutline) 
      });
      console.log('[LessonGeneratorService] Teaching component code generated successfully.');

      let code = typeof result === 'string' ? result : String(result);

      // Clean up the code - remove markdown code blocks if present
      code = this.cleanGeneratedCode(code);

      // Extract title from the enhanced outline
      const title = this.extractTitle(
        typeof enhancedOutline === 'string' ? enhancedOutline : String(enhancedOutline)
      );

      // Validate the generated TypeScript
      this.validateTypeScript(code);

      const outlineString = typeof enhancedOutline === 'string' ? enhancedOutline : String(enhancedOutline);
      return { code, title, outline: outlineString };
    } catch (error) {
      console.error('Error generating teaching component:', error);
      this.handleApiError(error);
      throw new Error(
        `Failed to generate teaching component: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async generateExercisesComponent(outline: string): Promise<{ code: string }> {
    console.log('[LessonGeneratorService] generateExercisesComponent start');

    try {
      // Generate the exercise component code using the provided outline
      console.log('[LessonGeneratorService] Generating exercise component code...');
      const result = await this.exerciseChain.invoke({ outline });
      console.log('[LessonGeneratorService] Exercise component code generated successfully.');

      let code = typeof result === 'string' ? result : String(result);

      // Clean up the code - remove markdown code blocks if present
      code = this.cleanGeneratedCode(code);

      // Validate the generated TypeScript
      this.validateTypeScript(code);

      return { code };
    } catch (error) {
      console.error('Error generating exercise component:', error);
      this.handleApiError(error);
      throw new Error(
        `Failed to generate exercise component: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  
  private handleApiError(error: unknown): void {
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
