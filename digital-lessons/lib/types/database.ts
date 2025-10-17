export type LessonStatus = 'generating' | 'generated' | 'failed';

export interface Lesson {
  id: string;
  title: string;
  outline: string;
  content: string | null;
  status: LessonStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLessonInput {
  title: string;
  outline: string;
}
