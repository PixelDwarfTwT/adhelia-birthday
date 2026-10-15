export interface AchievementItem {
  id: string;
  title: string;
  stat: string;
  story: string;
  stickerId: string;
  placeholder: boolean;
}

export interface FavoriteThing {
  id: string;
  category: string;
  label: string;
  detail: string;
  placeholder: boolean;
}

export interface MemoryItem {
  id: string;
  caption: string;
  alt: string;
  note: string;
  placeholder: boolean;
  imageSrc?: string;
  videoSrc?: string;
  videoPoster?: string;
}

export interface ExperienceProgress {
  stickerIds: string[];
  constellationComplete: boolean;
}

export interface BirthdayContent {
  recipientName: string;
  openingCopy: string;
  passcodePrompt: string;
  passcodeHash: string;
  introduction: string;
  giftMessage: string;
  audio: {
    primary: string;
    alternate: string;
  };
  achievements: AchievementItem[];
  favoriteThings: FavoriteThing[];
  memories: MemoryItem[];
  letter: {
    greeting: string;
    paragraphs: string[];
    signOff: string;
  };
  finalMessage: string;
  finalGreeting: string;
}
