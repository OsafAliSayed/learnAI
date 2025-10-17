import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { LessonRenderer } from '@/components/lesson-renderer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
      <div className="min-h-screen flex flex-col">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-7xl flex items-center p-3 px-5">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Lessons
              </Button>
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="text-muted-foreground">
              {lesson.status === 'generating'
                ? 'This lesson is still being generated...'
                : 'This lesson failed to generate.'}
            </p>
            {lesson.error_message && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Error: {lesson.error_message}
              </p>
            )}
            <Link href="/">
              <Button>Return Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-7xl flex items-center p-3 px-5">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lessons
            </Button>
          </Link>
        </div>
      </nav>
      <div className="flex-1 w-full max-w-7xl mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
          <p className="text-muted-foreground">{lesson.outline}</p>
        </div>
        <LessonRenderer code={lesson.content} />
      </div>
    </div>
  );
}
