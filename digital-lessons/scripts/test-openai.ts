import { ChatOpenAI } from '@langchain/openai';

// Note: Make sure to run this with: bun run scripts/test-openai.ts
// Bun automatically loads .env files

async function testOpenAI() {
  console.log('Testing OpenAI API connection...\n');
  
  // Check if API key is set
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is not set in environment variables');
    process.exit(1);
  }
  
  const keyPreview = process.env.OPENAI_API_KEY.substring(0, 10) + '...';
  console.log(`✓ API Key found: ${keyPreview}\n`);
  
  try {
    console.log('Testing with gpt-4o-mini (cheaper model)...');
    const miniModel = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 100,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    
    const miniResponse = await miniModel.invoke('Say "Hello, World!" in one sentence.');
    console.log('✓ gpt-4o-mini works!');
    console.log('Response:', miniResponse.content, '\n');
  } catch (error) {
    console.error('❌ gpt-4o-mini failed:', error instanceof Error ? error.message : error);
    console.log('');
  }
  
  try {
    console.log('Testing with gpt-4o...');
    const model = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 100,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    
    const response = await model.invoke('Say "Hello, World!" in one sentence.');
    console.log('✓ gpt-4o works!');
    console.log('Response:', response.content, '\n');
  } catch (error) {
    console.error('❌ gpt-4o failed:', error instanceof Error ? error.message : error);
    
    if (error instanceof Error && error.message.includes('403')) {
      console.log('\n💡 Suggestion: Your API key might not have access to gpt-4o.');
      console.log('   You can either:');
      console.log('   1. Use gpt-4o-mini instead (change modelName in lesson-generator.ts)');
      console.log('   2. Check your OpenAI account billing and model access');
      console.log('   3. Get a new API key with appropriate permissions\n');
    }
  }
}

testOpenAI().catch(console.error);
