'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Lesson } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, ArrowRight, Clock, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

// Helper function to clean title by removing markdown formatting
function cleanTitle(title: string): string {
  // Remove patterns like "**LESSON TITLE:** " or "LESSON TITLE: "
  return title
    .replace(/^\*\*[A-Z\s]+:\*\*\s*/i, '') // Remove **LESSON TITLE:** 
    .replace(/^[A-Z\s]+:\s*/i, '')         // Remove LESSON TITLE:
    .trim();
}

export function LessonGenerator() {
  const [outline, setOutline] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchLessons = useCallback(async () => {
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
  }, [supabase]);

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
  }, [fetchLessons, supabase]);

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

  const getStatusIcon = (status: Lesson['status']) => {
    switch (status) {
      case 'generating':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'generated':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-12">
      {/* Prompt Input Section */}
      <div className="relative">
        <div className="relative group">
          <textarea
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) {
                handleGenerate();
              }
            }}
            placeholder="Describe the lesson you want to create...&#10;&#10;Examples:&#10;• A 10 question pop quiz on Florida&#10;• A one-pager on how to divide with long division&#10;• An explanation of how the Cartesian Grid works"
            className="w-full min-h-[180px] p-6 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder:text-muted-foreground/60 text-base"
            disabled={isGenerating}
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-3">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !outline.trim()}
              size="lg"
              className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg shadow-blue-500/25"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Lesson
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Lessons List */}
      {lessons.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Lessons</h2>
            <span className="text-sm text-muted-foreground">
              {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
            </span>
          </div>
          
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="group rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 hover:bg-muted/20 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold text-base truncate">{cleanTitle(lesson.title)}</h3>
                      <div className="flex items-center gap-2 text-sm">
                        {getStatusIcon(lesson.status)}
                        <span className="capitalize text-muted-foreground">{lesson.status}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {lesson.outline}
                    </p>
                    
                    {lesson.error_message && (
                      <p className="text-xs text-red-500 line-clamp-1">
                        Error: {lesson.error_message}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                      <Clock className="h-3 w-3" />
                      {new Date(lesson.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {lesson.status === 'generated' ? (
                      <Link href={`/lessons/${lesson.id}`}>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="rounded-xl"
                        >
                          View
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        disabled
                        className="opacity-50 rounded-xl"
                      >
                        Pending
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
