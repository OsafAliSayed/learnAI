'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Lesson } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Loader2, FileText, CheckCircle2, XCircle } from 'lucide-react';

export function LessonGenerator() {
  const [outline, setOutline] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch existing lessons on mount
  useEffect(() => {
    fetchLessons();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('lessons-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lessons'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLessons((prev) => [payload.new as Lesson, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setLessons((prev) =>
              prev.map((lesson) =>
                lesson.id === payload.new.id ? (payload.new as Lesson) : lesson
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching lessons:', error);
      setError('Failed to fetch lessons');
    } else {
      setLessons(data || []);
    }
  };

  const handleGenerate = async () => {
    if (!outline.trim()) {
      setError('Please enter a lesson outline');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/lessons/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outline: outline.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate lesson');
      }

      setOutline('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (status: Lesson['status']) => {
    switch (status) {
      case 'generating':
        return (
          <Badge variant="outline" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Generating
          </Badge>
        );
      case 'generated':
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Generated
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Generate a New Lesson</CardTitle>
          <CardDescription>
            Enter a lesson outline and we'll generate an interactive TypeScript-based lesson for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="outline" className="text-sm font-medium">
              Lesson Outline
            </label>
            <textarea
              id="outline"
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
              placeholder="Examples:&#10;• A 10 question pop quiz on Florida&#10;• A one-pager on how to divide with long division&#10;• An explanation of how the Cartesian Grid works"
              className="w-full min-h-[120px] p-3 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !outline.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Lesson'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Lessons</CardTitle>
          <CardDescription>
            {lessons.length === 0
              ? 'No lessons yet. Generate your first lesson above!'
              : `${lessons.length} lesson${lessons.length !== 1 ? 's' : ''} generated`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Start by generating your first lesson</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium truncate">{lesson.title}</h3>
                      {getStatusBadge(lesson.status)}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {lesson.outline}
                    </p>
                    {lesson.error_message && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        Error: {lesson.error_message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(lesson.created_at).toLocaleString()}
                    </p>
                  </div>
                  {lesson.status === 'generated' && (
                    <Link href={`/lessons/${lesson.id}`}>
                      <Button variant="outline" size="sm">
                        View Lesson
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
