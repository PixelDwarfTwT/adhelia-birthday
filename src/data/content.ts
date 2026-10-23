import type { BirthdayContent, BirthdayCopy } from "./types";
import { assetPath } from "@/lib/asset-path";

export const birthdayContent: BirthdayContent = {
  recipientName: "Adhelia",
  openingCopy: "Happy Birthday",
  passcodePrompt: "Berapa umur Adhelia sekarang?",
  // SHA-256 for "19"
  passcodeHash: "9400f1b21cb527d7fa3d3eabba93557a18ebe7a2ca4e471cfe5e4c5b4ca7f767",
  introduction:
    "Semoga hari ini penuh senyum, tawa, dan hal-hal baik yang kamu harapkan. Selamat menikmati hari spesialmu!",
  cakeTitle: "Buat satu permohonan kecil.",
  cakeInstruction: "Pejamkan mata sebentar, lalu tiup lilinnya.",
  letterTitle: "Sepucuk surat untukmu.",
  audio: {
    primary: assetPath("/assets/metal.mp3"),
  },
  letter: {
    greeting: "Adhelia,",
    paragraphs: [],
  },
};

export function toBirthdayCopy(content: BirthdayContent): BirthdayCopy {
  return {
    recipientName: content.recipientName,
    openingCopy: content.openingCopy,
    introduction: content.introduction,
    cakeTitle: content.cakeTitle,
    cakeInstruction: content.cakeInstruction,
    letterTitle: content.letterTitle,
    letter: {
      greeting: content.letter.greeting,
      paragraphs: [...content.letter.paragraphs],
    },
  };
}

export const defaultBirthdayCopy = toBirthdayCopy(birthdayContent);
