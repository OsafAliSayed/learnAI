import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { LessonRenderer } from '@/components/lesson-renderer';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme-switcher';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';

// Helper function to clean title by removing markdown formatting
function cleanTitle(title: string): string {
  // Remove patterns like "**LESSON TITLE:** " or "LESSON TITLE: "
  return title
    .replace(/^\*\*[A-Z\s]+:\*\*\s*/i, '') // Remove **LESSON TITLE:** 
    .replace(/^[A-Z\s]+:\s*/i, '')         // Remove LESSON TITLE:
    .trim();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from('lessons')
    .select('title, outline')
    .eq('id', id)
    .single();

  if (!lesson) {
    return {
      title: 'Lesson Not Found',
      description: 'The requested lesson could not be found.',
    };
  }

  return {
    title: `${cleanTitle(lesson.title)} | LearnAI`,
    description: lesson.outline,
  };
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !lesson) {
    notFound();
  }

  if (lesson.status !== 'generated' || !lesson.content) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
        {/* Header */}
        <header className="w-full border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </header>

        {/* Loading/Error State */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-md">
            {lesson.status === 'generating' ? (
              <>
                <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold">{cleanTitle(lesson.title)}</h1>
                  <p className="text-muted-foreground">
                    Your lesson is being generated...
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    This usually takes a few moments. The page will update automatically.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold">{cleanTitle(lesson.title)}</h1>
                  <p className="text-muted-foreground">
                    This lesson failed to generate.
                  </p>
                  {lesson.error_message && (
                    <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-300 text-sm text-left">
                      {lesson.error_message}
                    </div>
                  )}
                </div>
                <Link href="/">
                  <Button size="lg" className="mt-4 rounded-xl">
                    Return Home
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Lesson Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {cleanTitle(lesson.title)}
          </h1>
          <p className="text-lg text-muted-foreground">{lesson.outline}</p>
        </div>
        
        <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
          <LessonRenderer code={lesson.content} />
        </div>
      </div>
    </div>
  );
}
