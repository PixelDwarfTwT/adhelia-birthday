import type { BirthdayContent } from "./types";

export const birthdayContent: BirthdayContent = {
  recipientName: "Adhelia",
  openingCopy: "A special delivery for Adhelia...",
  passcodePrompt: "Apa warna favorit Adhelia?",
  // SHA-256 for the initial passcode. Replace this digest if the answer changes.
  passcodeHash: "16477688c0e00699c6cfa4497a3612d7e83c532062b64b250fed8908128ed548",
  introduction:
    "I hope today brings you happiness, smiles, and everything you wished for. Enjoy your special day.",
  audio: {
    primary: "/assets/metal.mp3",
    alternate: "/assets/happy.mp3",
  },
  achievements: [
    {
      id: "achievement-placeholder",
      title: "A little space to brag",
      stat: "Your real win goes here",
      story: "[Add a real Adhelia achievement or funny stat here.]",
      stickerId: "sparkle",
      placeholder: true,
    },
    {
      id: "funny-stat-placeholder",
      title: "Highly official statistic",
      stat: "[Add a funny stat]",
      story: "[Add an inside joke or playful detail here.]",
      stickerId: "tiny-trophy",
      placeholder: true,
    },
  ],
  favoriteThings: [
    {
      id: "color",
      category: "Color",
      label: "Blue",
      detail: "A little piece of the sky woven through this birthday scrapbook.",
      placeholder: false,
    },
    { id: "music", category: "Music", label: "Add a favorite", detail: "[Add a favorite song or artist.]", placeholder: true },
    { id: "games", category: "Games", label: "Add a favorite", detail: "[Add a favorite game.]", placeholder: true },
    { id: "food", category: "Food", label: "Add a favorite", detail: "[Add a favorite food.]", placeholder: true },
    { id: "characters", category: "Characters", label: "Add a favorite", detail: "[Add a favorite character.]", placeholder: true },
    { id: "hobbies", category: "Hobbies", label: "Add an interest", detail: "[Add an interest or hobby.]", placeholder: true },
  ],
  memories: [
    {
      id: "birthday-photo",
      caption: "A birthday moment",
      alt: "Adhelia holding a small cake topped with lit candles.",
      note: "[Add the story behind this photo.]",
      placeholder: true,
      imageSrc: "/assets/photo.jpg",
    },
    {
      id: "memory-placeholder",
      caption: "A memory to add",
      alt: "An illustrated placeholder card for a birthday memory.",
      note: "[Add a real memory or a favorite quote here.]",
      placeholder: true,
    },
  ],
  letter: {
    greeting: "Dear Adhelia,",
    paragraphs: [],
    signOff: "[Add your name]",
  },
  finalMessage: "May your year ahead be as bright and beautiful as you are.",
  finalGreeting: "Happy Birthday, Adhelia!",
};
