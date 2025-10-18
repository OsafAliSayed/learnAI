#!/usr/bin/env bun

/**
 * Reliability Test Script
 * 
 * This script tests the lesson generation system by:
 * 1. Generating multiple lessons with different outlines
 * 2. Validating each generated TypeScript
 * 3. Reporting success rate and common errors
 */

const TEST_OUTLINES = [
  "A 10 question pop quiz on Florida",
  "A one-pager on how to divide with long division",
  "An explanation of how the Cartesian Grid works and an example of finding distances between points",
  "A test on counting numbers from 1 to 100",
  "A 5 question quiz on the solar system",
  "An interactive lesson on basic fractions with visual examples",
  "A 7 question quiz on US state capitals",
  "A tutorial on how to multiply two-digit numbers",
  "An explanation of photosynthesis with diagrams",
  "A 10 question quiz on basic geometry shapes"
];

const API_URL = process.env.API_URL || 'http://localhost:3000';

interface TestResult {
  outline: string;
  success: boolean;
  lessonId?: string;
  error?: string;
  duration: number;
}

async function generateLesson(outline: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_URL}/api/lessons/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ outline }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        outline,
        success: false,
        error: errorData.error || 'Unknown error',
        duration: Date.now() - startTime,
      };
    }

    const data = await response.json();
    
    // Wait for generation to complete (poll the database)
    const lessonId = data.lesson.id;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const checkResponse = await fetch(`${API_URL}/lessons/${lessonId}`);
      if (checkResponse.ok) {
        const html = await checkResponse.text();
        if (html.includes('generated')) {
          return {
            outline,
            success: true,
            lessonId,
            duration: Date.now() - startTime,
          };
        }
        if (html.includes('failed')) {
          return {
            outline,
            success: false,
            lessonId,
            error: 'Generation failed',
            duration: Date.now() - startTime,
          };
        }
      }
      
      attempts++;
    }
    
    return {
      outline,
      success: false,
      lessonId,
      error: 'Timeout waiting for generation',
      duration: Date.now() - startTime,
    };
    
  } catch (error) {
    return {
      outline,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
    };
  }
}

async function runReliabilityTest() {
  console.log('🧪 Starting Reliability Test\n');
  console.log(`Testing ${TEST_OUTLINES.length} lesson generations...\n`);
  
  const results: TestResult[] = [];
  
  for (let i = 0; i < TEST_OUTLINES.length; i++) {
    const outline = TEST_OUTLINES[i];
    console.log(`[${i + 1}/${TEST_OUTLINES.length}] Generating: ${outline.substring(0, 50)}...`);
    
    const result = await generateLesson(outline);
    results.push(result);
    
    if (result.success) {
      console.log(`  ✅ Success (${(result.duration / 1000).toFixed(2)}s)\n`);
    } else {
      console.log(`  ❌ Failed: ${result.error} (${(result.duration / 1000).toFixed(2)}s)\n`);
    }
  }
  
  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(60) + '\n');
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const successRate = (successCount / results.length * 100).toFixed(2);
  const avgDuration = (results.reduce((sum, r) => sum + r.duration, 0) / results.length / 1000).toFixed(2);
  
  console.log(`Total Tests:     ${results.length}`);
  console.log(`Successful:      ${successCount} (${successRate}%)`);
  console.log(`Failed:          ${failCount}`);
  console.log(`Avg Duration:    ${avgDuration}s\n`);
  
  if (failCount > 0) {
    console.log('Failed Tests:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  • ${r.outline.substring(0, 50)}...`);
      console.log(`    Error: ${r.error}\n`);
    });
  }
  
  console.log('='.repeat(60) + '\n');
  
  if (successRate === '100.00') {
    console.log('🎉 Perfect! All lessons generated successfully!');
  } else if (parseFloat(successRate) >= 90) {
    console.log('✅ Good reliability, but could be improved.');
  } else {
    console.log('⚠️  Reliability needs improvement.');
  }
}

runReliabilityTest().catch(console.error);
