'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import * as ts from 'typescript';

interface LessonRendererProps {
  code: string;
}

export function LessonRenderer({ code }: LessonRendererProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const renderLesson = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Clean and transform the TypeScript code
        let transformedCode = code.trim();

        // Remove import statements
        transformedCode = transformedCode
          .replace(/^import\s+.*from\s+['"]react['"];?\n?/gm, '')
          .replace(/^import\s+.*from\s+['"].*['"];?\n?/gm, '');

        // Handle different export patterns
        const exportDefaultMatch = transformedCode.match(/^export\s+default\s+(\w+);?\s*$/m);

        if (exportDefaultMatch) {
          const componentName = exportDefaultMatch[1];
          transformedCode = transformedCode.replace(/^export\s+default\s+\w+;?\s*$/m, '');
          transformedCode = transformedCode.trim() + `\n\nwindow.__LESSON_COMPONENT__ = ${componentName};`;
        } else {
          transformedCode = transformedCode
            .replace(/^export\s+default\s+function/, 'function')
            .replace(/^export\s+default\s+/, 'window.__LESSON_COMPONENT__ = ');
        }

        // Transpile TypeScript to JavaScript
        const transpiled = ts.transpileModule(transformedCode, {
          compilerOptions: {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.None,
            jsx: ts.JsxEmit.React,
            jsxFactory: 'React.createElement',
            jsxFragmentFactory: 'React.Fragment',
            removeComments: false,
          },
        });

        const jsCode = transpiled.outputText;

        // Create the iframe HTML document
        const iframeHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      padding: 1.5rem;
      line-height: 1.6;
      color: #1f2937;
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin-bottom: 1rem;
      font-weight: 600;
      line-height: 1.3;
    }
    
    h1 { font-size: 2rem; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }
    
    p {
      margin-bottom: 1rem;
    }
    
    button {
      background-color: #3b82f6;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    
    button:hover {
      background-color: #2563eb;
    }
    
    button:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
    
    input[type="text"],
    input[type="number"],
    textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }
    
    input:focus,
    textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .question {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background-color: #f9fafb;
      border-radius: 0.5rem;
      border-left: 4px solid #3b82f6;
    }
    
    .option {
      display: block;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      background-color: white;
      border: 2px solid #e5e7eb;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .option:hover {
      border-color: #3b82f6;
      background-color: #eff6ff;
    }
    
    .option.selected {
      border-color: #3b82f6;
      background-color: #dbeafe;
    }
    
    .option.correct {
      border-color: #10b981;
      background-color: #d1fae5;
    }
    
    .option.incorrect {
      border-color: #ef4444;
      background-color: #fee2e2;
    }
    
    .result {
      padding: 1rem;
      border-radius: 0.5rem;
      margin-top: 1rem;
      font-weight: 500;
    }
    
    .result.correct {
      background-color: #d1fae5;
      color: #065f46;
      border: 1px solid #10b981;
    }
    
    .result.incorrect {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #ef4444;
    }
    
    .score {
      font-size: 1.5rem;
      font-weight: 700;
      text-align: center;
      padding: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 0.5rem;
      margin: 1rem 0;
    }
    
    .grid {
      display: grid;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .card {
      padding: 1rem;
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    code {
      background-color: #f3f4f6;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    
    pre {
      background-color: #1f2937;
      color: #f9fafb;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin-bottom: 1rem;
    }
    
    pre code {
      background-color: transparent;
      padding: 0;
      color: inherit;
    }
    
    ul, ol {
      margin-left: 1.5rem;
      margin-bottom: 1rem;
    }
    
    li {
      margin-bottom: 0.5rem;
    }
    
    .error {
      background-color: #fee2e2;
      border: 1px solid #ef4444;
      color: #991b1b;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }
    
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #1f2937;
        color: #f9fafb;
      }
      
      .question {
        background-color: #374151;
      }
      
      .option {
        background-color: #374151;
        border-color: #4b5563;
      }
      
      .option:hover {
        background-color: #4b5563;
      }
      
      .card {
        background-color: #374151;
        border-color: #4b5563;
      }
      
      input[type="text"],
      input[type="number"],
      textarea {
        background-color: #374151;
        border-color: #4b5563;
        color: #f9fafb;
      }
    }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <!-- Load React and ReactDOM from CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  
  <script>
    (function() {
      'use strict';
      
      try {
        // Make React available globally
        const { useState, useEffect, useCallback, useMemo } = React;
        
        // Execute the transpiled code
        ${jsCode}
        
        // Render the component
        const root = ReactDOM.createRoot(document.getElementById('root'));
        
        if (window.__LESSON_COMPONENT__) {
          root.render(React.createElement(window.__LESSON_COMPONENT__));
          
          // Auto-resize iframe to fit content
          const resizeObserver = new ResizeObserver(() => {
            const height = document.body.scrollHeight;
            window.parent.postMessage({ type: 'resize', height }, '*');
          });
          resizeObserver.observe(document.body);
          
          // Initial resize
          setTimeout(() => {
            const height = document.body.scrollHeight;
            window.parent.postMessage({ type: 'resize', height }, '*');
          }, 100);
        } else {
          throw new Error('Component not found. Make sure your code exports a default component.');
        }
      } catch (err) {
        console.error('Error in lesson:', err);
        document.getElementById('root').innerHTML = 
          '<div class="error"><strong>Error:</strong> ' + err.message + '</div>';
        window.parent.postMessage({ type: 'error', message: err.message }, '*');
      }
    })();
  </script>
</body>
</html>
        `;

        // Set up iframe
        const iframe = iframeRef.current;
        if (!iframe) return;

        // Listen for messages from iframe
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'resize') {
            iframe.style.height = `${event.data.height + 20}px`;
          } else if (event.data.type === 'error') {
            setError(event.data.message);
            setIsLoading(false);
          }
        };

        window.addEventListener('message', handleMessage);

        // Create a blob URL for the iframe
        const blob = new Blob([iframeHTML], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);

        iframe.onload = () => {
          setIsLoading(false);
          URL.revokeObjectURL(blobUrl);
        };

        iframe.onerror = () => {
          setError('Failed to load lesson content');
          setIsLoading(false);
          URL.revokeObjectURL(blobUrl);
        };

        iframe.src = blobUrl;

        // Cleanup
        return () => {
          window.removeEventListener('message', handleMessage);
          URL.revokeObjectURL(blobUrl);
        };
      } catch (err) {
        console.error('Error rendering lesson:', err);
        setError(err instanceof Error ? err.message : 'Failed to render lesson');
        setIsLoading(false);
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

  return (
    <div className="lesson-content w-full">
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse">Loading lesson...</div>
            </div>
          </CardContent>
        </Card>
      )}
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        className={`w-full border-0 transition-opacity ${isLoading ? 'opacity-0 h-0' : 'opacity-100'}`}
        style={{ minHeight: '200px' }}
        title="Lesson Content"
      />
    </div>
  );
}
