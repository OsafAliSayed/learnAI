import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LessonGeneratorService } from '@/lib/services/lesson-generator';
import { z } from 'zod';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const generateLessonSchema = z.object({
  outline: z.string().min(10, 'Outline must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const { outline } = generateLessonSchema.parse(body);

    const supabase = await createClient();
    // Extract a title from the outline
    const title = outline.split('\n')[0].trim().substring(0, 200);

    // Create initial lesson record with 'generating' status
    const { data: lesson, error: insertError } = await supabase
      .from('lessons')
      .insert({
        title,
        outline,
        status: 'generating',
        content: null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating lesson record:', insertError);
      return NextResponse.json(
        { error: 'Failed to create lesson record' },
        { status: 500 }
      );
    }

    // Generate the lesson asynchronously (fire-and-forget) using a server-side
    // background task. Prefix with `void` to explicitly detach the promise
    // from request lifecycle so we don't accidentally await it.
    void generateLessonInBackground(lesson.id, outline);
    console.log(`[generate] enqueued lesson ${lesson.id} - starting background task`);


    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    console.error('Error in generate endpoint:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate lesson' },
      { status: 500 }
    );
  }
}

async function generateLessonInBackground(lessonId: string, outline: string) {
  // Create an admin client for background operations
  // This bypasses RLS and doesn't require cookies/session
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );

  try {
    const service = new LessonGeneratorService();
    const { code, title: generatedTitle } = await service.generateLesson(outline);

    // Update the lesson with generated content
    const { error: updateError } = await supabase
      .from('lessons')
      .update({
        title: generatedTitle,
        content: code,
        status: 'generated',
        error_message: null,
      })
      .eq('id', lessonId);

    if (updateError) {
      throw updateError;
    }
  } catch (error) {
    console.error('Error generating lesson:', error);

    // Update lesson with error status
    await supabase
      .from('lessons')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error occurred',
      })
      .eq('id', lessonId);
  }
}
