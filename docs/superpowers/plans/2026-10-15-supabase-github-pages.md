# Supabase and GitHub Pages Implementation Plan

> **For agentic workers:** Native execution was selected earlier in this conversation. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the birthday book and admin panel to the existing Supabase project and publish the working site at its GitHub Pages URL.

**Architecture:** Keep the public book statically exported by Next.js and use the existing Supabase publishable key with RLS for browser reads and admin writes. Make admin authentication client-side so it works on static hosting, and scope Next.js routes and public media to the GitHub project path.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase JS/SSR, PostgreSQL RLS, GitHub Actions Pages.

**Spec:** `docs/superpowers/specs/2026-10-15-adhelia-admin-supabase-design.md`

## Global Constraints

- Never put a Supabase secret or service-role key in browser code.
- Keep draft content inaccessible to anonymous users through RLS.
- Preserve the existing admin membership and public content in Supabase.
- Keep local development on `http://localhost:3000` while exporting assets under `/adhelia-birthday/` for GitHub Pages.
- Do not publish the untracked `.codex/` workspace folder.

## Review Focus

- Existing admin membership must still be the only way to edit/publish; verify the RLS check uses the signed-in user's membership.
- Anonymous visitors can read only published content; verify grants and policies.
- GitHub Pages serves `/admin/`, media, and Next assets under the repository path; verify generated output paths.
- A build with no local environment file still gets the intended public Supabase config; verify the generated client bundle contains the public URL and not any secret key.
- A failed Supabase request leaves the bundled birthday copy visible; verify through existing experience behavior and build.

---

### Task 1: Add the birthday content table to the existing Supabase project

**Files:** Create a timestamped SQL migration through `supabase migration new`; modify that generated migration only.

**Interfaces:** Use `public.is_admin()` to check the existing `admin_users` membership. Grant `anon` published-row reads and `authenticated` read/write privileges gated by RLS.

- [ ] Create the migration using the Supabase CLI after checking the installed CLI guidance.
- [ ] Apply the migration to project `klfrfundcgfdaghakrcv`.
- [ ] Verify table columns, RLS policies, and public/draft visibility without returning personal content.

### Task 2: Make admin routes work on static hosting

**Files:** Modify `src/app/admin/page.tsx`, `src/app/admin/login/page.tsx`, `src/components/admin/admin-editor.tsx`, `src/lib/supabase/database.types.ts`; remove unused server-only proxy code if static export requires it.

**Interfaces:** Browser Supabase client authenticates with email/password, checks `is_admin()`, reads `birthday_content`, and relies on RLS for draft and publish mutations.

- [ ] Convert admin route loading and authorization to a client-side loading state.
- [ ] Preserve readable states for missing config, signed-out, non-admin, and database errors.
- [ ] Verify the admin routes are emitted as static HTML.

### Task 3: Configure the GitHub Pages project path and workflow

**Files:** Modify `next.config.ts`, `src/lib/supabase/config.ts`, `.env.example`, and public asset paths; create `.github/workflows/deploy-pages.yml`.

**Interfaces:** Export static files with `basePath: /adhelia-birthday` on production builds; keep development rooted at `/`; use only the Supabase public URL and publishable key.

- [ ] Add a shared base-path helper for audio, photo, and cake assets.
- [ ] Add a workflow that builds the `adhelia-birthday` folder and deploys its `out` artifact to Pages.
- [ ] Verify build output paths and workflow prerequisites.

### Task 4: Verify, commit, publish, and confirm the live URL

**Files:** Review the scoped changes and generated artifacts.

**Interfaces:** Publish the main branch to `https://PixelDwarfTwT.github.io/adhelia-birthday/` after the Actions deployment succeeds.

- [ ] Run lint, typecheck, existing tests, and production static build.
- [ ] Commit only the intended site, workflow, documentation, and migration files.
- [ ] Push the authorized commit and verify the Pages deployment response.
