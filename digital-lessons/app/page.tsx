import { LessonGenerator } from "@/components/lesson-generator";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Minimalist Header */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-5xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg">LearnAI</span>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/40 bg-muted/30 text-sm text-muted-foreground">
            <Sparkles className="w-3 h-3" />
            AI-Powered Interactive Lessons
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Create lessons in
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"> seconds</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate interactive, engaging educational content powered by AI. From quizzes to visualizations—all in TypeScript.
          </p>
        </div>

        {/* Lesson Generator */}
        <LessonGenerator />
      </div>
      
      {/* Minimal Footer */}
      <footer className="border-t border-border/40 mt-20">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          Built with Next.js, TypeScript & AI
        </div>
      </footer>
    </main>
  );
}
