import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <FileQuestion className="h-24 w-24 mx-auto text-muted-foreground opacity-50" />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Lesson Not Found</h1>
          <p className="text-muted-foreground">
            The lesson you&apos;re looking for doesn&apos;t exist or may have been deleted.
          </p>
        </div>
        <Link href="/">
          <Button size="lg">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
