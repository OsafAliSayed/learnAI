'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import * as ts from 'typescript';

interface LessonRendererProps {
  code: string;
}

export function LessonRenderer({ code }: LessonRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderLesson = async () => {
      try {
        // Clean and transform the TypeScript code into executable JavaScript
        let transformedCode = code.trim();
        
        // Remove import statements
        transformedCode = transformedCode
          .replace(/^import\s+.*from\s+['"]react['"];?\n?/gm, '')
          .replace(/^import\s+.*from\s+['"].*['"];?\n?/gm, '');
        
        // Handle different export patterns:
        // 1. "export default function Name() {}" -> "function Name() {}"
        // 2. "export default Name;" -> "return Name;"
        // 3. Check if there's a standalone "export default ComponentName;" at the end
        const exportDefaultMatch = transformedCode.match(/^export\s+default\s+(\w+);?\s*$/m);
        
        if (exportDefaultMatch) {
          // Pattern: "export default ComponentName;"
          // Remove the export line and add a return statement at the end
          const componentName = exportDefaultMatch[1];
          transformedCode = transformedCode.replace(/^export\s+default\s+\w+;?\s*$/m, '');
          transformedCode = transformedCode.trim() + `\n\nreturn ${componentName};`;
        } else {
          // Handle inline exports
          transformedCode = transformedCode
            .replace(/^export\s+default\s+function/, 'function')
            .replace(/^export\s+default\s+/, 'return ');
        }
        
        // Transpile TypeScript to JavaScript to remove type annotations
        const transpiled = ts.transpileModule(transformedCode, {
          compilerOptions: {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.ESNext,
            jsx: ts.JsxEmit.React,
            removeComments: false,
          },
        });
        
        transformedCode = transpiled.outputText;
        
        // Wrap in try-catch for better error reporting
        const wrappedCode = `
          'use strict';
          try {
            ${transformedCode}
          } catch (err) {
            console.error('Component execution error:', err);
            throw err;
          }
        `;

        // Create a function that returns the component
        // Note: The Function constructor properly handles template literals
        const componentFactory = new Function(
          'React',
          'useState',
          'useEffect',
          'useCallback',
          'useMemo',
          wrappedCode
        );

        // Import React hooks
        const React = await import('react');
        const { useState, useEffect, useCallback, useMemo } = React;

        // Execute the factory to get the component
        const GeneratedComponent = componentFactory(
          React,
          useState,
          useEffect,
          useCallback,
          useMemo
        );

        setComponent(() => GeneratedComponent);
        setError(null);
      } catch (err) {
        console.error('Error rendering lesson:', err);
        setError(err instanceof Error ? err.message : 'Failed to render lesson');
      }
    };

    renderLesson();
  }, [code]);

  if (error) {
    return (
      <Card className="border-red-300 dark:border-red-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 text-red-800 dark:text-red-300">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Failed to Render Lesson</h3>
              <p className="text-sm mb-2">{error}</p>
              <details className="text-xs mt-2">
                <summary className="cursor-pointer font-medium">View code (debug)</summary>
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded overflow-auto max-h-96 max-w-full">
                  <code className="text-xs">{code}</code>
                </pre>
              </details>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!Component) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse">Loading lesson...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="lesson-content">
      <Component />
    </div>
  );
}
