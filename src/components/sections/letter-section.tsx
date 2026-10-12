import { birthdayContent } from "@/data/content";

export function LetterSection() {
  const { letter } = birthdayContent;

  return (
    <section className="chapter-section letter-section" id="chapter-5" aria-labelledby="chapter-5-title">
      <p className="chapter-section__number">Chapter 05 · A personal note</p>
      <h2 id="chapter-5-title">A small note, from the heart</h2>
      <article className="letter-paper" aria-label="Personal birthday letter">
        <span aria-hidden="true" className="letter-paper__tape" />
        <p className="letter-paper__greeting">{letter.greeting}</p>
        {letter.paragraphs.length > 0 ? (
          letter.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)
        ) : (
          <p className="letter-paper__placeholder">[Add your personal message in src/data/content.ts.]</p>
        )}
        <p className="letter-paper__signoff">{letter.signOff}</p>
        <span aria-hidden="true" className="letter-paper__doodle">✦</span>
      </article>
    </section>
  );
}
