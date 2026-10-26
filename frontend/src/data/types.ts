export interface BirthdayCopy {
  recipientName: string;
  openingCopy: string;
  introduction: string;
  cakeTitle: string;
  cakeInstruction: string;
  letterTitle: string;
  letter: {
    greeting: string;
    paragraphs: string[];
  };
}

export interface BirthdayContent extends BirthdayCopy {
  passcodePrompt: string;
  passcodeHash: string;
  audio: {
    primary: string;
  };
}
