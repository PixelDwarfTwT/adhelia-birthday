import type { BirthdayContent, BirthdayCopy } from "./types";
import { assetPath } from "@/lib/asset-path";

export const birthdayContent: BirthdayContent = {
  recipientName: "Adhelia",
  openingCopy: "Selamat Ulang Tahun",
  passcodePrompt: "Apa warna favorit Adhelia?",
  // SHA-256 for the initial passcode. Replace this digest if the answer changes.
  passcodeHash: "16477688c0e00699c6cfa4497a3612d7e83c532062b64b250fed8908128ed548",
  introduction:
    "Semoga hari ini penuh senyum, tawa, dan hal-hal baik yang kamu harapkan. Selamat menikmati hari spesialmu!",
  cakeTitle: "Buat satu permohonan kecil.",
  cakeInstruction: "Pejamkan mata sebentar, lalu tiup lilinnya.",
  letterTitle: "Sepucuk surat untukmu.",
  giftMessage:
    "Semoga hari ini terasa hangat, ringan, dan penuh hal yang membuatmu tersenyum. Selamat menikmati setiap momennya, Adhelia.",
  audio: {
    primary: assetPath("/assets/metal.mp3"),
    alternate: assetPath("/assets/happy.mp3"),
  },
  achievements: [
    {
      id: "achievement-placeholder",
      title: "Papan prestasi",
      stat: "[Tulis pencapaian Adhelia]",
      story: "[Tambahkan cerita nyata atau pencapaian Adhelia di sini.]",
      stickerId: "sparkle",
      placeholder: true,
    },
    {
      id: "funny-stat-placeholder",
      title: "Statistik sangat resmi",
      stat: "[Tulis statistik lucu]",
      story: "[Tambahkan lelucon internal atau detail lucu di sini.]",
      stickerId: "tiny-trophy",
      placeholder: true,
    },
  ],
  favoriteThings: [
    {
      id: "color",
      category: "Warna",
      label: "Biru",
      detail: "Sedikit warna langit yang ikut menghiasi scrapbook ulang tahun ini.",
      placeholder: false,
    },
    { id: "music", category: "Musik", label: "[Tambahkan favorit]", detail: "[Tambahkan lagu atau artis favorit.]", placeholder: true },
    { id: "games", category: "Game", label: "[Tambahkan favorit]", detail: "[Tambahkan game favorit.]", placeholder: true },
    { id: "food", category: "Makanan", label: "[Tambahkan favorit]", detail: "[Tambahkan makanan favorit.]", placeholder: true },
    { id: "characters", category: "Karakter", label: "[Tambahkan favorit]", detail: "[Tambahkan karakter favorit.]", placeholder: true },
    { id: "hobbies", category: "Hobi", label: "[Tambahkan minat]", detail: "[Tambahkan minat atau hobi.]", placeholder: true },
  ],
  memories: [
    {
      id: "birthday-photo",
      caption: "Momen ulang tahun",
      alt: "Adhelia memegang kue kecil dengan lilin menyala.",
      note: "[Tambahkan cerita di balik foto ini.]",
      placeholder: true,
      imageSrc: assetPath("/assets/photo.jpg"),
    },
    {
      id: "memory-placeholder",
      caption: "Tambahkan kenangan",
      alt: "Kartu placeholder untuk foto kenangan ulang tahun.",
      note: "[Tambahkan kenangan nyata atau kutipan favorit di sini.]",
      placeholder: true,
    },
  ],
  letter: {
    greeting: "Untuk Adhelia,",
    paragraphs: [],
    signOff: "[Tulis namamu]",
  },
  finalMessage: "Semoga tahun barumu dipenuhi hal-hal baik, tawa, dan banyak alasan untuk bahagia.",
  finalGreeting: "Selamat ulang tahun, Adhelia!",
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
      signOff: content.letter.signOff,
    },
  };
}

export const defaultBirthdayCopy = toBirthdayCopy(birthdayContent);
