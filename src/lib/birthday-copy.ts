import type { BirthdayCopy } from "@/data/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseBirthdayCopy(value: unknown): BirthdayCopy | null {
  if (!isRecord(value) || !isRecord(value.letter)) return null;
  const { letter } = value;
  const textFields = [
    value.recipientName,
    value.openingCopy,
    value.introduction,
    value.cakeTitle,
    value.cakeInstruction,
    value.letterTitle,
    letter.greeting,
    letter.signOff,
  ];

  if (!textFields.every((field) => typeof field === "string")) return null;
  if (!Array.isArray(letter.paragraphs) || !letter.paragraphs.every((paragraph) => typeof paragraph === "string")) {
    return null;
  }

  return {
    recipientName: value.recipientName as string,
    openingCopy: value.openingCopy as string,
    introduction: value.introduction as string,
    cakeTitle: value.cakeTitle as string,
    cakeInstruction: value.cakeInstruction as string,
    letterTitle: value.letterTitle as string,
    letter: {
      greeting: letter.greeting as string,
      paragraphs: [...letter.paragraphs] as string[],
      signOff: letter.signOff as string,
    },
  };
}

export function normalizeBirthdayCopy(copy: BirthdayCopy, paragraphsText: string): BirthdayCopy {
  return {
    ...copy,
    recipientName: copy.recipientName.trim(),
    openingCopy: copy.openingCopy.trim(),
    introduction: copy.introduction.trim(),
    cakeTitle: copy.cakeTitle.trim(),
    cakeInstruction: copy.cakeInstruction.trim(),
    letterTitle: copy.letterTitle.trim(),
    letter: {
      greeting: copy.letter.greeting.trim(),
      paragraphs: paragraphsText
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
      signOff: copy.letter.signOff.trim(),
    },
  };
}
