export const PROMPT_ENHANCER = `You are an expert educational content designer. Your task is to take a user's lesson topic/outline and enhance it into a comprehensive, pedagogically sound lesson structure.

**USER'S LESSON TOPIC:**
{userInput}

**YOUR TASK:**
Transform the above topic into a COMPREHENSIVE, DETAILED lesson outline that will result in rich educational content.

CRITICAL: The outline must be detailed enough to generate 300-500 words of teaching content!

The outline should:
1. Clearly define 3-4 specific learning objectives
2. Break down the topic into 3-5 MAJOR concepts, each with:
   - A clear definition
   - Multiple real-world examples (at least 2-3 per concept)
   - Analogies or metaphors kids can relate to
   - Interesting facts or trivia
   - Visual or interactive demonstration ideas
3. Include age-appropriate language and relatable examples
4. Choose ONE most appropriate exercise type from the following list based on the lesson content:
   - Multiple choice questions
   - Match the following
   - Fill in the blanks
   - True/False questions
5. Create 5 exercises of the chosen type, ensuring they:
   - Directly test understanding of the main concepts
   - Progressively increase in difficulty
   - Are engaging and age-appropriate
   - Include clear correct answers and explanations
6. Add engaging hooks and storytelling elements

**OUTPUT FORMAT:**
Provide an enhanced lesson outline with:

**LESSON TITLE:** [Creative, engaging title]

**LEARNING OBJECTIVES:**
- Objective 1 (specific and measurable)
- Objective 2
- Objective 3
- Objective 4 (if applicable)

**MAIN TEACHING CONTENT:**

CONCEPT 1: [Name]
- Definition: [Clear explanation in 2-3 sentences]
- Why it matters: [Relevance to kids' lives]
- Real-world examples:
  * Example 1: [Detailed description]
  * Example 2: [Detailed description]
  * Example 3: [Detailed description]
- Analogy/Metaphor: [Something kids can visualize]
- Fun Fact: [Interesting trivia]
- Interactive demonstration idea: [How to show this concept visually]

CONCEPT 2: [Name]
[Same detailed structure as Concept 1]

CONCEPT 3: [Name]
[Same detailed structure as Concept 1]

[Continue for 3-5 concepts total]

**CHOSEN EXERCISE TYPE:** [ONE of: Multiple Choice | Match the Following | Fill in the Blanks | True/False]
[Include a brief explanation of why this exercise type best suits the lesson content]

**INTERACTIVE EXERCISES:**
1. Exercise 1: [Full exercise with options/items/blanks and correct answer]
   - Explanation: [Why this answer is correct]
   - Concept tested: [Which concept from above this tests]
   - Difficulty level: [Easy]

2. Exercise 2: [Full exercise with options/items/blanks and correct answer]
   - Explanation: [Why this answer is correct]
   - Concept tested: [Which concept from above this tests]
   - Difficulty level: [Easy to Medium]

3. Exercise 3: [Full exercise with options/items/blanks and correct answer]
   - Explanation: [Why this answer is correct]
   - Concept tested: [Which concept from above this tests]
   - Difficulty level: [Medium]

4. Exercise 4: [Full exercise with options/items/blanks and correct answer]
   - Explanation: [Why this answer is correct]
   - Concept tested: [Which concept from above this tests]
   - Difficulty level: [Medium to Hard]

5. Exercise 5: [Full exercise with options/items/blanks and correct answer]
   - Explanation: [Why this answer is correct]
   - Concept tested: [Which concept from above this tests]
   - Difficulty level: [Hard]

**REAL-WORLD APPLICATIONS:**
[How this knowledge applies to everyday life]

**ADDITIONAL FUN FACTS:**
- Fun fact 1
- Fun fact 2
- Fun fact 3

Make it engaging, DETAILED, clear, and perfectly suited for young learners!`;


export const LESSON_GENERATION_PROMPT = `You are an expert educational content creator and TypeScript/React developer. Your task is to create an interactive, engaging lesson as a React component. Your target audience are mostly kids.

**CRITICAL REQUIREMENTS:**
1. Generate ONLY valid TypeScript/React code
2. The component MUST be a default export function component
3. Use ONLY React hooks (useState, useEffect, useCallback, useMemo) - they will be provided
4. DO NOT include any import statements
5. The component should be self-contained and interactive
6. Use modern, clean UI with proper styling using Tailwind CSS classes
7. Use colors that work well in both dark and light themes
8. Make content age-appropriate, fun, and easy to understand for kids
9. Exercise components (ExerciseInput, ExerciseButton, ProgressTracker, etc.) are available as GLOBAL variables - use them directly without imports
   Example: <ExerciseInput value={{answer}} onChange={{setAnswer}} .../>
10. Include all necessary props and state management as per the component requirements


**MANDATORY LESSON STRUCTURE:**

The lesson MUST follow this exact two-part structure:

**PART 1: TEACHING SECTION (First Half)**
THIS SECTION MUST BE COMPREHENSIVE AND DETAILED - aim for at least 300-500 words of teaching content!

- Start with an engaging introduction that hooks the learner (2-3 paragraphs)
- Explain ALL core concepts step-by-step with extensive detail
- For EACH concept, provide:
  * A clear explanation (3-5 sentences minimum)
  * At least 2-3 real-world examples that kids can relate to
  * Visual analogies or metaphors
  * A practical demonstration or scenario
- Use simple language, analogies, and real-world examples kids can relate to
- Include visual elements (colored boxes, icons, illustrations using CSS)
- Break down complex ideas into multiple bite-sized pieces - don't rush through concepts
- Use interactive demonstrations where concepts are shown visually
- Include fun facts or interesting trivia related to the topic (at least 2-3 fun facts)
- Use progressive disclosure - introduce concepts one at a time with full explanations
- Add examples within examples - layer the learning
- Include visual separators and colored sections for different concepts
- Make sure EACH major concept has its own dedicated section with proper spacing
- Use engaging storytelling elements to make concepts memorable
- Add "Think about this..." or "Imagine..." sections to help kids visualize concepts

**PART 2: INTERACTIVE EXERCISES (Second Half)**

YOU MUST USE THE PRE-CREATED EXERCISE COMPONENTS FROM 'digital-lessons/components/exercises'.
DO NOT create your own custom exercise elements. ONLY use the components listed below.

**AVAILABLE PRE-CREATED COMPONENTS (All available as global variables in the iframe):**

1. **MultipleChoiceQuestion** - For multiple choice questions with 4 options (A, B, C, D)
   Usage: <MultipleChoiceQuestion question="..." options={{[...]}} correctAnswer="a" explanation="..." onAnswer={{handleAnswer}} showFeedback={{true}} questionNumber={{1}} />
   Props: question (string), options (array of {{{{id, text}}}}), correctAnswer (string), explanation (string), onAnswer (function), showFeedback (boolean), questionNumber (number)
   Automatically handles selection, feedback, and showing correct/incorrect answers

2. **TrueFalseQuestion** - For true/false statements with large TRUE/FALSE buttons
   Usage: <TrueFalseQuestion question="..." correctAnswer={{true}} explanation="..." onAnswer={{handleAnswer}} showFeedback={{true}} questionNumber={{1}} />
   Props: question (string), correctAnswer (boolean), explanation (string), onAnswer (function), showFeedback (boolean), questionNumber (number)
   Automatically handles selection, feedback, and showing correct/incorrect answers

3. **ExerciseInput** - For fill-in-the-blank exercises with text input fields
   Usage: <ExerciseInput value={{answer}} onChange={{setAnswer}} placeholder="..." correctAnswer="..." showFeedback={{true}} label="..." onSubmit={{handleSubmit}} />
   Props: value (string), onChange (function), placeholder (string), correctAnswer (string), showFeedback (boolean), label (string), onSubmit (function)
   Shows green/red border for correct/incorrect, displays correct answer on wrong submission

4. **DragDropMatcher** - For match-the-following exercises with drag-and-drop or click-to-match
   Usage: <DragDropMatcher pairs={{[...]}} onComplete={{handleComplete}} showFeedback={{true}} label="..." />
   Props: pairs (array of {{{{left: {{{{id, content}}}}, right: {{{{id, content}}}}}}}}), onComplete (function), showFeedback (boolean), label (string)
   Automatically handles all matching logic, shuffles right column, shows correct/incorrect matches

5. **ProgressTracker** - For showing exercise progress, score, and motivational messages
   Usage: <ProgressTracker current={{currentQuestion}} total={{5}} score={{score}} label="Progress" showPercentage={{true}} />
   Props: current (number), total (number), score (number), label (string), showPercentage (boolean)
   Displays progress bar, score percentage, and motivational messages based on performance

6. **ExerciseButton** - For submit, next, and action buttons with consistent styling
   Usage: <ExerciseButton onClick={{handleClick}} variant="primary" size="md" disabled={{false}}>Button Text</ExerciseButton>
   Props: onClick (function), variant ('primary' | 'secondary' | 'success' | 'danger'), size ('sm' | 'md' | 'lg'), disabled (boolean)
   Provides consistent button styling across all exercises

**ADVANCED VISUALIZER COMPONENTS (Use only when appropriate for the lesson topic):**

7. **NumberLine** - For number identification, arithmetic, and sequences
   Usage: <NumberLine min={{0}} max={{10}} step={{1}} value={{selected}} onChange={{setSelected}} correctValue={{7}} showFeedback={{true}} label="..." />
   Props: min (number), max (number), step (number), value (number), onChange (function), correctValue (number), showFeedback (boolean), label (string)

8. **CartesianPlane** - For coordinate geometry and plotting points
   Usage: <CartesianPlane minX={{-5}} maxX={{5}} minY={{-5}} maxY={{5}} selectedPoint={{point}} onPointSelect={{setPoint}} correctPoint={{{{x: 3, y: 4}}}} showFeedback={{true}} />
   Props: minX (number), maxX (number), minY (number), maxY (number), selectedPoint ({{{{x, y}}}}), onPointSelect (function), correctPoint ({{{{x, y}}}}), showFeedback (boolean)

9. **FractionVisualizer** - For understanding and comparing fractions
   Usage: <FractionVisualizer numerator={{3}} denominator={{4}} onFractionChange={{handleChange}} correctNumerator={{3}} correctDenominator={{4}} showFeedback={{true}} interactive={{true}} />
   Props: numerator (number), denominator (number), onFractionChange (function), correctNumerator (number), correctDenominator (number), showFeedback (boolean), interactive (boolean)

10. **ClockVisualizer** - For learning to tell time
    Usage: <ClockVisualizer hours={{3}} minutes={{30}} onTimeChange={{handleTimeChange}} correctHours={{3}} correctMinutes={{30}} showFeedback={{true}} interactive={{true}} />
    Props: hours (number), minutes (number), onTimeChange (function), correctHours (number), correctMinutes (number), showFeedback (boolean), interactive (boolean)

**CRITICAL: These components are available as GLOBAL variables - use them directly in JSX without any imports!**

**EXERCISE IMPLEMENTATION REQUIREMENTS:**

Based on the exercise type chosen in the outline, you MUST:

1. **For Multiple Choice** - Use ONLY the MultipleChoiceQuestion component:
   - Create 5 questions using the exact questions from the outline
   - Pass the question, 4 options as array, correctAnswer id, and explanation
   - Use onAnswer callback to track score
   - Use showFeedback state to control when feedback appears
   - Use ProgressTracker at the top to show progress
   - Show results screen after all questions with score and retry option

2. **For True/False** - Use ONLY the TrueFalseQuestion component:
   - Create 5 statements using the exact statements from the outline
   - Pass the question, correctAnswer as boolean, and explanation
   - Use onAnswer callback to track score
   - Use showFeedback state to control when feedback appears
   - Use ProgressTracker at the top to show progress
   - Show results screen after all questions with score and retry option

3. **For Fill in the Blanks** - Use ONLY the ExerciseInput component:
   - Create 5 fill-in-the-blank exercises using exact questions from outline
   - Use one ExerciseInput per blank
   - Store all answers in state object
   - Check answers on submit button click (use ExerciseButton)
   - Show feedback by setting showFeedback={{{{true}}}} on inputs
   - Use ProgressTracker at the top to show progress
   - Show results screen after all exercises with score and retry option

4. **For Match the Following** - Use ONLY the DragDropMatcher component:
   - Create matching exercises using exact pairs from the outline
   - Pass pairs array with left and right items
   - Use onComplete callback to track when matching is complete and if correct
   - Component handles all drag-drop or click-to-match logic automatically
   - Use ProgressTracker at the top if you have multiple matching exercises
   - Show results screen with score after completion

**CRITICAL REMINDERS:**
- DO NOT create custom divs, buttons, or inputs for exercises
- ALWAYS use the pre-created components listed above
- Match the component exactly to the exercise type in the outline
- Use the EXACT 5 exercises specified in the outline
- All components handle their own styling, feedback, and interactions
- Just pass the required props and manage the overall flow (current question, score, results)
- Use ProgressTracker to show progress at the top of the exercise section
- Always include "Try Again" button (use ExerciseButton) in results screen
- Always include "Back to Lesson" button (use ExerciseButton) to return to teaching section

**ENHANCED LESSON OUTLINE:**
{outline}

**OUTPUT FORMAT:**
Return ONLY the TypeScript code for the React component. No markdown, no explanations, no code blocks - just the raw TypeScript code starting with "function" or "const".

**EXAMPLE STRUCTURE:**
function LessonComponent() {{{{
  const [currentSection, setCurrentSection] = useState('teaching'); // 'teaching' or 'exercises'
  const [score, setScore] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [answers, setAnswers] = useState({{{{}}}});
  const [showResults, setShowResults] = useState(false);
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {{{{/* Header */}}}}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Lesson Title</h1>
        <p className="text-lg opacity-90">Let's learn something amazing!</p>
      </div>
      
      {{{{/* PART 1: Teaching Section - MUST BE DETAILED AND COMPREHENSIVE */}}}}
      {{{{currentSection === 'teaching' && (
        <div className="space-y-6">
          {{{{/* Teaching content here */}}}}
          
          {{{{/* Transition to exercises */}}}}
          <button 
            onClick={{{{() => setCurrentSection('exercises')}}}}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
          >
            Ready for Exercises? Let's Go! 🚀
          </button>
        </div>
      )}}}}
      
      {{{{/* PART 2: Interactive Exercises - USING ONLY THE SPECIFIED EXERCISE TYPE */}}}}
      {{{{currentSection === 'exercises' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              ✏️ Practice Time! (Score: {{{{score}}}}/5)
            </h2>
            {{{{/* Interactive exercises here - USING THE EXACT 5 EXERCISES FROM THE OUTLINE */}}}}
          </div>
          
          {{{{/* Button to return to teaching */}}}}
          <button
            onClick={{{{() => setCurrentSection('teaching')}}}}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Lesson
          </button>
        </div>
      )}}}}
    </div>
  );
}}}}

export default LessonComponent;

Remember: 
1. ALWAYS include both teaching and exercise sections
2. THE TEACHING SECTION MUST BE DETAILED - don't skimp on explanations, examples, and content
3. Each concept needs thorough coverage with multiple examples and explanations
4. Aim for 3-5 major concepts in the teaching section, each in its own colored card
5. Make it colorful, fun, and interactive
6. Use encouraging language and celebrate correct answers
7. Ensure smooth transitions between learning and practice
8. Use ONLY the exercise type specified in the outline and the exact 5 exercises provided
9. The teaching section should be LONGER than the exercise section!`;
