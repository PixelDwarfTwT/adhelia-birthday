"use client";

import { useState, type FormEvent } from "react";
import { birthdayContent } from "@/data/content";
import { verifyPasscode } from "@/lib/access-code";

interface PasscodeGateProps {
  onUnlock(): void;
}

export function PasscodeGate({ onUnlock }: PasscodeGateProps) {
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsChecking(true);

    try {
      const subtle = typeof globalThis.crypto === "undefined" ? undefined : globalThis.crypto.subtle;
      const normalizedAnswer = answer.trim().toLocaleLowerCase("id-ID");
      const passcodeCandidate = normalizedAnswer === "biru" ? "blue" : answer;
      const matches = await verifyPasscode(passcodeCandidate, birthdayContent.passcodeHash, subtle);
      if (!matches) {
        setMessage(subtle ? "Belum tepat. Coba ingat lagi warna favorit Adhelia." : "Gerbang kecil ini tidak dapat memeriksa passcode di browser ini. Coba buka dengan browser yang mendukung Web Crypto.");
        return;
      }

      onUnlock();
    } catch {
      setMessage("Gerbang kecil ini tidak dapat memeriksa passcode sekarang. Silakan coba lagi.");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <main className="gate-screen" aria-labelledby="gate-title">
      <div className="gate-stars" aria-hidden="true">
        <span>✦</span><span>✧</span><span>✦</span><span>✧</span>
      </div>
      <section className="gate-card">
      <p className="eyebrow">Kejutan ulang tahun kecil</p>
        <span className="gate-card__seal" aria-hidden="true">✦</span>
        <h1 id="gate-title">Satu pertanyaan kecil sebelum perayaan</h1>
        <p className="gate-card__prompt">{birthdayContent.passcodePrompt}</p>
        <form className="gate-form" onSubmit={handleSubmit}>
          <label htmlFor="passcode-answer">Jawaban</label>
          <input
            autoComplete="off"
            autoCapitalize="none"
            id="passcode-answer"
            name="answer"
            value={answer}
            onChange={(event) => setAnswer(event.currentTarget.value)}
            aria-describedby={message ? "gate-message" : undefined}
            required
          />
          <button className="button button--primary" disabled={isChecking} type="submit">
            {isChecking ? "Membuka..." : "Buka amplop"}
          </button>
        </form>
        {message && <p className="gate-message" id="gate-message" role="alert">{message}</p>}
        <p className="gate-card__footnote">Satu kunci kecil untuk kejutan kecil.</p>
      </section>
    </main>
  );
}
