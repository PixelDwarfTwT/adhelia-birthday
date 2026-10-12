# Adhelia Birthday Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing Adhelia birthday sample into a polished, responsive six-chapter scrapbook experience while preserving its photo, music, and warm blue gift motif.

**Architecture:** Add a Next.js App Router application in the existing folder without deleting the current HTML sample. Keep personal copy and asset mappings in typed data, isolate browser storage/audio helpers, and split the experience into focused chapter components coordinated by one client shell.

**Tech Stack:** Next.js App Router 14+, React, TypeScript, Tailwind CSS, Framer Motion, Lucide React, native HTML audio, SVG constellation, Canvas 2D celebration, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-13-adhelia-birthday-design.md`

## Global Constraints

- Use the blue/powder-blue/sky-blue/azure/velvet-navy/lavender/cream/star-gold design system in the approved spec.
- Keep the experience mobile-first with at least 48px touch targets and support down to 320px.
- Use Cormorant Garamond, Plus Jakarta Sans, and Caveat; target content widths of about 480px on mobile, 600px on tablet, and 960–1020px on desktop.
- Do not invent personal facts, anecdotes, favorite items, or the personal letter; keep missing content clearly editable in `src/data/content.ts`.
- Do not start or request audio until the user opens the envelope; use `metal.mp3` by default and retain `happy.mp3` as an alternate.
- Store passcode unlock in `localStorage` and interaction progress in `sessionStorage`; describe client-side passcode as a privacy convenience only.
- Add `noindex, nofollow`, `robots.txt` `Disallow: /`, and no analytics or tracking.
- Respect `prefers-reduced-motion`, semantic controls, keyboard access, visible focus, labels, and descriptive alt text.
- Limit mobile Canvas effects to 60 particles; keep effects to transform/opacity where possible.
- If an asset or audio feature fails, show a friendly fallback and keep the rest of the journey usable.

## Review Focus

- Web Crypto or browser storage is unavailable/throws: access stays understandable and does not silently bypass the gate. Test in Task 2 and Task 3.
- Audio playback is rejected or the file fails to load: show a retryable message, maintain mute/play state, and do not block the scrapbook. Test in Task 4.
- Image/video assets are missing or fail: show the designed fallback and restore background volume after a video closes. Test in Task 6.
- Reduced motion is enabled or the viewport is narrow: suppress particle motion and prevent overflow at 320px. Test in Task 8.
- Constellation stars are tapped out of order or the page is revisited: explain progress, accept the intended next star, and restore saved completion. Test in Task 7.

## File Map

- `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`: app scripts and framework/tooling configuration.
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`: fonts, noindex metadata, page entry, and visual tokens.
- `src/data/types.ts`, `src/data/content.ts`: strongly typed copy, placeholders, achievements, favorites, memory media, and passcode hash. A memory item has `id`, `caption`, `alt`, `note`, `placeholder`, and optional `imageSrc`, `videoSrc`, and `videoPoster`.
- `src/lib/access-code.ts`, `src/lib/progress.ts`, `src/lib/particle-settings.ts`: SHA-256 validation, guarded browser storage, and reduced-motion/viewport particle limits.
- `src/components/experience-shell.tsx`, `passcode-gate.tsx`, `opening-scene.tsx`, `chapter-navigation.tsx`, `audio-player.tsx`: journey state and shared controls.
- `src/components/sections/*.tsx`: focused components for playful cards, favorites, memories, letter, and constellation.
- `src/components/memory-modal.tsx`, `celebration-canvas.tsx`, `ui/keepsake-card.tsx`: media preview, final effects, and reusable paper card.
- `public/assets/manifest.json`, `public/assets/photo.jpg`, `public/assets/metal.mp3`, `public/assets/happy.mp3`, `public/robots.txt`: served media manifest (photo/audio entries, empty video list until supplied) and crawler rules. Copy the current assets; leave their originals and `index.html` in place as the reference sample.
- `vitest.config.ts`, `src/test/setup.ts`, and colocated `*.test.ts(x)` files: component and utility tests.

---

### Task 1: Add the app foundation without replacing the sample

**Files:** Create the package/config files, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `public/robots.txt`, `public/assets/manifest.json`, and Vitest setup files; copy the three existing media files into `public/assets/`. Keep root `index.html` and its assets intact.

**Interfaces:** The page entry renders a temporary app shell; layout owns local font loading and `noindex, nofollow` metadata. Add scripts `dev`, `build`, `start`, `lint`, `typecheck`, and `test`.

- [ ] **Step 1: Create the Next.js/TypeScript/Tailwind app configuration in place**, using compatible current packages and the installed Node 24 runtime. Add Vitest, jsdom, and React Testing Library as dev dependencies; do not add Howler or other audio packages.
- [ ] **Step 2: Add global tokens and responsive base styles** for the approved colors, typography, paper texture, focus-visible ring, and reduced-motion fallback.
- [ ] **Step 3: Add the asset copies, JSON manifest, and crawler rules**; verify the manifest paths correspond to the copied file names.
- [ ] **Step 4: Run `npm run typecheck` and `npm run build`.** Expected: the new App Router page builds with no TypeScript errors, while root sample files remain present.
- [ ] **Step 5: Commit** as `chore: add birthday experience app foundation`.

### Task 2: Centralize content and implement privacy state helpers

**Files:** Create `src/data/types.ts`, `src/data/content.ts`, `src/lib/access-code.ts`, `src/lib/progress.ts`, and `src/lib/__tests__/access-code.test.ts` plus `progress.test.ts`.

**Interfaces:** Export `birthdayContent: BirthdayContent`; `verifyPasscode(candidate: string, expectedHash: string, subtle: SubtleCrypto | undefined): Promise<boolean>`; `hasLocalAccess(storage: Storage): boolean`; `rememberLocalAccess(storage: Storage): void`; `readProgress(storage: Storage): ExperienceProgress`; and `writeProgress(storage: Storage, progress: ExperienceProgress): void`. `ExperienceProgress` contains `stickerIds: string[]` and `constellationComplete: boolean`. `BirthdayContent` contains recipient/opening/intro copy, passcode hash, primary and alternate audio paths, typed achievement/favorite/memory arrays, a letter `{ greeting, paragraphs, signOff }`, and `finalMessage`.

- [ ] **Step 1: Write tests** named `acceptsBluePasscodeHash`, `rejectsWrongPasscode`, `returnsFalseWhenWebCryptoIsUnavailable`, `readsAndWritesLocalAccess`, `readsAndWritesSessionProgress`, and `returnsDefaultProgressForInvalidStorageData`. Assert only the SHA-256 digest of `blue` unlocks; invalid JSON or storage errors do not throw or grant access.
- [ ] **Step 2: Run `npm test -- src/lib/__tests__/access-code.test.ts src/lib/__tests__/progress.test.ts`.** Expected: FAIL because the helpers do not exist.
- [ ] **Step 3: Implement the typed content and helpers.** Use empty/labelled placeholders for missing anecdotes, non-color favorites, memories, and letter paragraphs; never store the passcode in clear text.
- [ ] **Step 4: Rerun the same tests.** Expected: PASS, including storage-unavailable cases.
- [ ] **Step 5: Commit** as `feat: add editable birthday content and privacy helpers`.

### Task 3: Build the access gate, opening scene, and chapter shell

**Files:** Create `src/components/experience-shell.tsx`, `passcode-gate.tsx`, `opening-scene.tsx`, `chapter-navigation.tsx`, and their colocated tests; connect them from `src/app/page.tsx`.

**Interfaces:** `PasscodeGate({ onUnlock }: { onUnlock(): void })`; `OpeningScene({ onOpen }: { onOpen(): void })`; `ExperienceShell` owns `gateOpen`, `experienceStarted`, current chapter state, and `progress: ExperienceProgress`. It restores `progress` with `readProgress(sessionStorage)` and persists updates with `writeProgress(sessionStorage, nextProgress)`, passing sticker/progress callbacks to sections. Chapter section IDs are `chapter-1` through `chapter-6`.

- [ ] **Step 1: Write tests** `keepsMainContentHiddenUntilPasscodeMatches`, `showsFriendlyCryptoFailure`, `opensEnvelopeFromKeyboardOrTap`, and `chapterNavigationScrollsToSelectedSection`. Assert no chapter content is available before gate success and opening text is “A special delivery for Adhelia...”.
- [ ] **Step 2: Run the targeted component tests.** Expected: FAIL for missing gate/shell behavior.
- [ ] **Step 3: Implement the gate and shell.** Ask “Apa warna favorit Adhelia?”; call the storage helper after valid SHA-256 comparison; keep Web Crypto failure closed with a friendly explanation. Add a minimal responsive chapter navigation and reveal the scrapbook only after opening.
- [ ] **Step 4: Rerun targeted tests.** Expected: PASS for blocked/unlocked states, keyboard activation, and navigation.
- [ ] **Step 5: Commit** as `feat: add private birthday opening journey`.

### Task 4: Add deferred background audio and persistent controls

**Files:** Create `src/components/audio-player.tsx` and `src/components/audio-player.test.tsx`; wire it into `experience-shell.tsx` and `opening-scene.tsx`.

**Interfaces:** Export a ref handle `AudioPlayerHandle` with `startFromGesture(): Promise<boolean>` and `setDucked(ducked: boolean): void`. The player accepts `track: string` and exposes mute, play/pause, progress, and friendly error state.

- [ ] **Step 1: Write tests** `doesNotLoadOrPlayBeforeOpening`, `startsTrackFromOpeningGesture`, `togglesMuteAndPlayPause`, `updatesProgress`, `showsRetryAfterPlaybackFailure`, and `ducksToFifteenPercentForVideo`. Assert the source remains unset before the opening action and video ducking restores the prior volume.
- [ ] **Step 2: Run `npm test -- src/components/audio-player.test.tsx`.** Expected: FAIL for missing player behavior.
- [ ] **Step 3: Implement with a native `<audio>` element** and no autoplay attribute. Set `src` and call `play()` only from the opening gesture; catch rejected promises and handle media errors without blocking navigation.
- [ ] **Step 4: Rerun the targeted tests.** Expected: PASS for controls, deferred load, and duck/restore.
- [ ] **Step 5: Commit** as `feat: add gesture-started birthday music player`.

### Task 5: Implement playfulness and favorite-things chapters

**Files:** Create `src/components/ui/keepsake-card.tsx`, `src/components/sections/playful-section.tsx`, `favorites-section.tsx`, and tests; connect the sections to `ExperienceShell`.

**Interfaces:** `KeepsakeCard({ title, front, back, ... })`; sections consume the corresponding typed arrays from `birthdayContent` and report collected sticker IDs to the shell.

- [ ] **Step 1: Write tests** `flipsAchievementByButtonAndKeyboard`, `collectsStickerOnce`, `opensFavoriteDetail`, and `rendersClearlyMarkedMissingContent`. Assert cards remain usable without hover and placeholders are labelled rather than presented as facts.
- [ ] **Step 2: Run the targeted tests.** Expected: FAIL for missing chapter components.
- [ ] **Step 3: Implement tactile flip cards, sticker rewards, and interactive favorite tiles** using the blue/lavender scrapbook styles and accessible buttons.
- [ ] **Step 4: Rerun the tests.** Expected: PASS for flip/tap/keyboard, sticker state, favorite detail, and placeholder handling.
- [ ] **Step 5: Commit** as `feat: add playful and favorites chapters`.

### Task 6: Implement memories, media fallback, and the letter

**Files:** Create `src/components/sections/memories-section.tsx`, `src/components/sections/letter-section.tsx`, `src/components/memory-modal.tsx`, and tests; extend the memory types and manifest only as needed.

**Interfaces:** Memories read `MemoryItem[]`; the modal accepts `memory: MemoryItem`, `onClose(): void`, and `onVideoActiveChange(active: boolean): void`. Optional video uses `playsInline`, a muted preview that starts only while visible, explicit modal playback, and the player’s ducking interface. The photo modal supports browser pinch-zoom and keyboard/tap close.

- [ ] **Step 1: Write tests** `opensMemoryModalAndClosesWithEscape`, `opensPhotoPreviewOnDoubleTap`, `movesMemoryWithTouchControls`, `showsFriendlyImageFallback`, `startsOptionalMutedVideoOnlyWhileVisible`, `playsOptionalVideoInlineAndDucksMusic`, and `rendersLetterPlaceholderWithoutInventingCopy`. Assert the existing photo has accurate descriptive alt text and the letter paragraphs remain empty until supplied.
- [ ] **Step 2: Run the targeted tests.** Expected: FAIL for missing memory/letter behavior.
- [ ] **Step 3: Implement the polaroid stack, modal, optional video path, and warm paper letter.** Use the actual photo; do not fabricate a video, caption anecdote, or letter text. Restore audio volume on video end, modal close, and error.
- [ ] **Step 4: Rerun the tests.** Expected: PASS for modal, touch controls, failures, video ducking, and the empty-letter state.
- [ ] **Step 5: Commit** as `feat: add memory archive and personal letter chapter`.

### Task 7: Add the constellation and final celebration

**Files:** Create `src/components/sections/constellation-section.tsx`, `src/components/celebration-canvas.tsx`, `src/lib/particle-settings.ts`, and tests; connect saved progress and final content.

**Interfaces:** The constellation receives `completed: boolean` from `progress.constellationComplete` and `onComplete(): void` that updates shell progress; it renders seven ordered accessible star buttons for `A`, `D`, `H`, `E`, `L`, `I`, `A`. Export `getParticleLimit(viewportWidth: number, reducedMotion: boolean): number`; Canvas receives `active: boolean` and `reducedMotion: boolean` and uses this helper.

- [ ] **Step 1: Write tests** `connectsStarsInOrderToSpellAdhelia`, `ignoresOutOfOrderStarAndKeepsProgressClear`, `restoresCompletedConstellationFromSession`, `showsFinalMessageAfterCompletion`, `capsMobileParticlesAtSixty`, and `returnsZeroParticlesForReducedMotion`. Assert the final exact copy from the approved spec.
- [ ] **Step 2: Run the targeted tests.** Expected: FAIL for missing constellation behavior.
- [ ] **Step 3: Implement the SVG star path and Canvas celebration.** Reveal one letter per accepted star, persist completion in session progress, cap particles on mobile, and stop animation frames on unmount/reduced motion.
- [ ] **Step 4: Rerun the tests.** Expected: PASS for order, state restore, final reveal, particle cap, and reduced motion.
- [ ] **Step 5: Commit** as `feat: add Adhelia constellation birthday reveal`.

### Task 8: Finish responsive/accessibility polish and run journey QA

**Files:** Refine `src/app/globals.css`, all chapter components, and their tests. Add no tracking or external asset requests.

- [ ] **Step 1: Add regression tests** `allSixChaptersHaveKeyboardReachableNavigation`, `audioAndImageFailuresDoNotBlankThePage`, `reducedMotionRemovesDecorativeMovement`, and `progressSurvivesSectionNavigation`. Run `npm test`; expected: PASS for the full component suite.
- [ ] **Step 2: Run `npm run typecheck`, `npm run lint`, and `npm run build`.** Expected: zero TypeScript/lint errors and a successful production build.
- [ ] **Step 3: Start `npm run dev` and inspect the complete flow in a browser** at 320, 360, 390, 430, 768, 1024, 1440, and 3840px widths. Verify there is no horizontal overflow; exercise gate, opening/audio, cards, memory swipe/modal/pinch zoom, navigation, and final constellation.
- [ ] **Step 4: Check accessibility and failure states** with keyboard-only navigation, visible focus, labels, image/audio failure, and reduced motion. Confirm robots/noindex and no analytics requests.
- [ ] **Step 5: Commit** as `fix: polish responsive birthday experience and qa`.

## Execution Order

Complete Tasks 1–8 in order because later sections consume the typed content and state interfaces created earlier. Real-device iOS Safari/Android Chrome validation remains a final external check if those devices are unavailable in this environment.
