import { LessonGenerator } from "@/components/lesson-generator";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <h1 className="text-xl">Digital Lessons</h1>
          </div>
          <ThemeSwitcher />
        </div>
      </nav>
      
      <div className="flex-1 w-full max-w-7xl mx-auto p-8">
        <LessonGenerator />
      </div>
      
      <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-8">
        <p>AI-powered lesson generation with TypeScript</p>
      </footer>
    </main>
  );
}
