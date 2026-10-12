"use client";

export interface Chapter {
  id: string;
  label: string;
}

interface ChapterNavigationProps {
  chapters: Chapter[];
  currentChapter: string;
  onNavigate(chapterId: string): void;
}

export function ChapterNavigation({ chapters, currentChapter, onNavigate }: ChapterNavigationProps) {
  return (
    <nav className="chapter-navigation" aria-label="Navigasi bab">
      {chapters.map((chapter, index) => (
        <button
          aria-current={chapter.id === currentChapter ? "location" : undefined}
          aria-label={`Bab ${index + 1}: ${chapter.label}`}
          className="chapter-navigation__item"
          key={chapter.id}
          onClick={() => onNavigate(chapter.id)}
          type="button"
        >
          <span aria-hidden="true" className="chapter-navigation__number">{String(index + 1).padStart(2, "0")}</span>
          <span>{chapter.label}</span>
        </button>
      ))}
    </nav>
  );
}
