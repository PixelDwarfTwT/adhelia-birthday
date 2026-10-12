"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { useState } from "react";
import { birthdayContent } from "@/data/content";
import { CelebrationCanvas } from "@/components/celebration-canvas";

interface ConstellationSectionProps {
  completed: boolean;
  onComplete(): void;
}

const letters = ["A", "D", "H", "E", "L", "I", "A"];
const points = [
  { x: 8, y: 66 },
  { x: 22, y: 30 },
  { x: 36, y: 66 },
  { x: 50, y: 30 },
  { x: 64, y: 66 },
  { x: 78, y: 30 },
  { x: 92, y: 66 },
];

export function ConstellationSection({ completed, onComplete }: ConstellationSectionProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [connectedCount, setConnectedCount] = useState(completed ? letters.length : 0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState("Star 1 of 7 is waiting. Start with A.");
  const isComplete = completed || finished;
  const visibleCount = isComplete ? letters.length : connectedCount;

  function connectStar(index: number) {
    if (isComplete) return;
    if (index !== connectedCount) {
      setFeedback(`Star ${connectedCount + 1} of 7 is waiting. Connect ${letters[connectedCount]} next.`);
      return;
    }

    const nextCount = connectedCount + 1;
    setConnectedCount(nextCount);
    if (nextCount === letters.length) {
      setFinished(true);
      setFeedback("All seven stars are connected.");
      onComplete();
      return;
    }
    setFeedback(`Star ${nextCount} of 7 connected. Connect ${letters[nextCount]} next.`);
  }

  return (
    <motion.section
      className="chapter-section constellation-section"
      id="chapter-6"
      aria-labelledby="chapter-6-title"
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : .55, ease: "easeOut" }}
    >
      <CelebrationCanvas active={isComplete} reducedMotion={reducedMotion} />
      <div className="constellation-section__content">
        <p className="chapter-section__number">Chapter 06 · The final constellation</p>
        <h2 id="chapter-6-title">A little constellation for you</h2>
        {!isComplete && <p className="constellation-section__guide">Connect the seven stars in their gentle zigzag to reveal a name.</p>}
        <div className="constellation-board" role="group" aria-label="Seven stars to connect">
          <svg aria-hidden="true" className="constellation-board__lines" viewBox="0 0 1000 300" preserveAspectRatio="none">
            {visibleCount > 1 && (
              <polyline
                points={points.slice(0, visibleCount).map(({ x, y }) => `${x * 10},${y * 3}`).join(" ")}
                fill="none"
                stroke="rgba(253, 224, 71, .72)"
                strokeWidth="2"
                strokeDasharray="5 8"
              />
            )}
          </svg>
          {points.map((point, index) => {
            const connected = index < visibleCount;
            return (
              <button
                aria-label={`Star ${index + 1}: ${letters[index]}`}
                aria-pressed={connected}
                className={`constellation-star ${connected ? "constellation-star--connected" : ""}`}
                key={`${letters[index]}-${index}`}
                onClick={() => connectStar(index)}
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                type="button"
              >
                <Star aria-hidden="true" fill={connected ? "currentColor" : "none"} />
                {connected && <span>{letters[index]}</span>}
              </button>
            );
          })}
        </div>
        <p className="constellation-section__progress">{visibleCount} of 7 stars connected</p>
        {!isComplete && <p className="constellation-section__feedback" role="status" aria-live="polite">{feedback}</p>}
        {isComplete && (
          <div className="constellation-reveal" aria-live="polite">
            <div className="constellation-lanterns" aria-hidden="true"><span>🏮</span><span>✦</span><span>🏮</span></div>
            <p className="constellation-reveal__word">ADHELIA</p>
            <p className="constellation-reveal__greeting">{birthdayContent.finalGreeting}</p>
            <p className="constellation-reveal__message">{birthdayContent.finalMessage}</p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
