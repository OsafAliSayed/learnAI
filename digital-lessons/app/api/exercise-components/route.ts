import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

export async function GET() {
  try {
    const componentsDir = path.join(process.cwd(), 'components', 'exercises');

    const componentFiles = [
      'ExerciseInput.tsx',
      'ExerciseButton.tsx',
      'ExerciseLabel.tsx',
      'ProgressTracker.tsx',
      'MultipleChoiceQuestion.tsx',
      'TrueFalseQuestion.tsx',
      'DragDropMatcher.tsx',
      'NumberLine.tsx',
      'CartesianPlane.tsx',
      'FractionVisualizer.tsx',
      'ClockVisualizer.tsx',
      'ExerciseManager.tsx',
      'LessonManager.tsx',
    ];

    let bundledCode = '';

    for (const file of componentFiles) {
      const filePath = path.join(componentsDir, file);
      console.log("filepath:", filePath);

      if (fs.existsSync(filePath)) {
        let code = fs.readFileSync(filePath, 'utf-8');

        // Remove 'use client' directive
        code = code.replace(/'use client';?\n?/g, '');

        // Remove import statements
        code = code.replace(/^import\s+.*from\s+['"].*['"];?\n?/gm, '');

        // Transpile TypeScript to JavaScript FIRST
        const transpiled = ts.transpileModule(code, {
          compilerOptions: {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.ESNext,
            jsx: ts.JsxEmit.React,
            jsxFactory: 'React.createElement',
            jsxFragmentFactory: 'React.Fragment',
            removeComments: false,
            esModuleInterop: true,
            isolatedModules: true,
          },
        });

        // NOW remove exports from transpiled code
        let jsCode = transpiled.outputText;

        // Extract component name before removing exports
        const exportMatch = jsCode.match(/(?:export\s+)?default\s+function\s+(\w+)/) ||
          jsCode.match(/function\s+(\w+)/) ||
          code.match(/export\s+default\s+function\s+(\w+)/);
        const componentName = exportMatch ? exportMatch[1] : file.replace('.tsx', '');

        // Remove all export statements and related code
        jsCode = jsCode.replace(/^export\s+default\s+function\s+/gm, 'function ');
        jsCode = jsCode.replace(/^default\s+function\s+/gm, 'function '); // ADD THIS LINE
        jsCode = jsCode.replace(/^export\s+default\s+/gm, '');
        jsCode = jsCode.replace(/^export\s+\{[^}]*\};?\n?/gm, '');
        jsCode = jsCode.replace(/^import\s+.*from\s+['"].*['"];?\n?/gm, '');
        jsCode = jsCode.replace(/Object\.defineProperty\(exports.*\n/g, '');
        jsCode = jsCode.replace(/exports\.__esModule.*\n/g, '');
        jsCode = jsCode.replace(/exports\.default\s*=\s*/g, '');

        bundledCode += `\n// ${componentName}\n${jsCode}\nwindow.${componentName} = ${componentName};\n`;

        // Add typo compatibility for ExerciseInput
        if (componentName === 'ExerciseInput') {
          bundledCode += `window.ExcerciseInput = ${componentName};\n`;
        }
      }
    }
    
    return new NextResponse(bundledCode, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error bundling exercise components:', error);
    return new NextResponse('Error bundling components', { status: 500 });
  }
}
