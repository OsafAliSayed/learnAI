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
        let componentName = 'LessonComponent';
        
        const funcExportMatch = transformedCode.match(/export\s+default\s+function\s+(\w+)/);
        if (funcExportMatch) {
          componentName = funcExportMatch[1];
          transformedCode = transformedCode.replace(/export\s+default\s+function\s+\w+/, `function ${componentName}`);
        }
        
        // Check for: export default ComponentName;
        const namedExportMatch = transformedCode.match(/export\s+default\s+(\w+);?\s*$/m);
        if (namedExportMatch) {
          componentName = namedExportMatch[1];
          transformedCode = transformedCode.replace(/^export\s+default\s+\w+;?\s*$/m, '');
        }
        
        // Check for: export default (props) => ... or export default () => ...
        const arrowExportMatch = transformedCode.match(/export\s+default\s+(\([^)]*\)\s*=>|\w+\s*=>)/);
        if (arrowExportMatch) {
          transformedCode = transformedCode.replace(/export\s+default\s+/, `const ${componentName} = `);
        }
        
        // Remove any remaining export default statements
        transformedCode = transformedCode.replace(/^export\s+default\s+/gm, '');
        
        // Ensure component is assigned to window
        if (!transformedCode.includes('window.__LESSON_COMPONENT__')) {
          transformedCode = transformedCode.trim() + `\n\nwindow.__LESSON_COMPONENT__ = ${componentName};`;
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
        
        // Fetch exercise components bundle from API
        const componentsResponse = await fetch('/api/exercise-components');
        if (!componentsResponse.ok) {
          throw new Error(`Failed to fetch exercise components: ${componentsResponse.status} ${componentsResponse.statusText}`);
        }
        const componentsBundle = await componentsResponse.text();
        
        // Create the iframe HTML document
        const iframeHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Load Tailwind CSS from CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    // Configure Tailwind with dark mode support
    tailwind.config = {
      darkMode: 'media',
      theme: {
        extend: {}
      }
    }
  </script>
  <style>
    /* Minimal base styles */
    .error {
      background-color: #fee2e2;
      border: 1px solid #ef4444;
      color: #991b1b;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }
    
    /* Ensure proper padding and spacing */
    body {
      padding: 1.5rem;
    }
  </style>
</head>
<body class="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">
  <div id="root"></div>
  
  <!-- Load React and ReactDOM from CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  
  <!-- Inject Exercise Components -->
  <script>
    (function() {
      'use strict';
      try {
        // Make React available globally
        const { useState, useEffect, useCallback, useMemo } = React;
        
        // Load exercise components - they will attach to window directly
        ${componentsBundle}
        
      } catch (err) {
        console.error('Error loading exercise components:', err);
        throw new Error('Failed to load exercise components: ' + err.message);
      }
    })();
  </script>
  
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
