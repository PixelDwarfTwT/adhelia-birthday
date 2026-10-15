"use client";

import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

interface ChapterPageProps {
  index: number;
  total: number;
  previousId?: string;
  nextId?: string;
  firstId: string;
  onNavigate(chapterId: string): void;
  children: ReactNode;
}

export function ChapterPage({
  index,
  total,
  previousId,
  nextId,
  firstId,
  onNavigate,
  children,
}: ChapterPageProps) {
  const isLastPage = !nextId;

  return (
    <div className="chapter-page">
      {children}
      <nav className="chapter-pagination" aria-label={`Navigasi bab ${index + 1} dari ${total}`}>
        <button
          aria-label={previousId ? `Kembali ke bab ${index}` : "Ini bab pertama"}
          className="chapter-pagination__button chapter-pagination__button--back"
          disabled={!previousId}
          onClick={() => previousId && onNavigate(previousId)}
          type="button"
        >
          <ArrowLeft aria-hidden="true" />
          <span>Kembali</span>
        </button>
        <p className="chapter-pagination__count" aria-live="polite">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span aria-hidden="true"> / </span>
          <span>{String(total).padStart(2, "0")}</span>
        </p>
        <button
          aria-label={isLastPage ? "Ulangi dari bab pertama" : `Lanjut ke bab ${index + 2}`}
          className="chapter-pagination__button chapter-pagination__button--next"
          onClick={() => onNavigate(nextId ?? firstId)}
          type="button"
        >
          <span>{isLastPage ? "Ulangi" : "Lanjut"}</span>
          {isLastPage ? <RotateCcw aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
        </button>
      </nav>
    </div>
  );
}
