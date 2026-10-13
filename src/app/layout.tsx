import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const display = localFont({
  src: "./fonts/cormorant-garamond-latin.woff2",
  variable: "--font-display",
  weight: "400 700",
  display: "swap",
});

const sans = localFont({
  src: "./fonts/plus-jakarta-sans-latin.woff2",
  variable: "--font-sans",
  weight: "400 700",
  display: "swap",
});

const handwritten = localFont({
  src: "./fonts/caveat-latin.woff2",
  variable: "--font-handwritten",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Adhelia — The Magical Scrapbook in the Stars",
  description: "A little birthday world, made with care for Adhelia.",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} ${handwritten.variable}`}>
        {children}
      </body>
    </html>
  );
}
