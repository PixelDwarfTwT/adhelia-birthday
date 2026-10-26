# Frontend and Backend Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Split the existing Next.js/Supabase repository into `frontend/` and `backend/` while keeping the GitHub Pages site buildable and automatically published.

**Architecture:** Move the static Next.js application and all app-specific tooling into `frontend/`. Move Supabase migrations and setup documentation into `backend/`; keep shared repository guidance and project history at the root. A root GitHub Actions workflow will build the frontend and update the existing `gh-pages` branch.

**Tech Stack:** Next.js 16 static export, npm, Vitest, TypeScript, Supabase migrations, GitHub Actions, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-26-frontend-backend-layout-design.md`

## Global Constraints

- Do not create a new API server or change Supabase schema, authentication, or policies.
- Preserve the existing UI, routes, Supabase behavior, and `/adhelia-birthday/` asset base path.
- Keep `.env.local` untracked and move it to `frontend/` without printing its contents.
- Publish static files to the existing `gh-pages` branch; grant the workflow only `contents: write`.
- Do not commit generated `node_modules`, `.next`, or `out` directories.

## Review Focus

- **Frontend project root:** npm scripts and `@/*` imports still resolve from `frontend/`. Verify with the existing test, typecheck, and lint scripts.
- **Local environment file:** `frontend/.env.local` stays ignored and is not staged. Verify with `git check-ignore` and staged-file review.
- **Supabase move:** both migrations and the setup guide refer to `backend/` paths. Verify expected files exist and search for stale active paths.
- **Pages asset prefix:** the production export keeps `/adhelia-birthday/` in page and asset URLs. Verify the generated `frontend/out/index.html` and build output.
- **Publishing workflow:** a push to `main` builds from `frontend/` and updates only `gh-pages`, without triggering a publish loop. Verify the successful Actions run and deployed branch contents.

---

### Task 1: Move the existing app and Supabase files

**Files:**
- Move to `frontend/`: `src/`, `public/`, `package.json`, `package-lock.json`, `.env.example`, `eslint.config.mjs`, `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `vitest.config.mts`.
- Move to `backend/`: `supabase/` and `docs/supabase-admin-setup.md` (to `backend/docs/supabase-admin-setup.md`).
- Move the ignored local `/.env.local` to `/frontend/.env.local` without displaying it.
- Modify: root `.gitignore`, root `AGENTS.md`, `backend/docs/supabase-admin-setup.md`.
- Create: root `README.md` with the folder map and frontend commands.

**Interfaces:**
- `frontend/` is the npm and Next.js project root; its existing scripts and `@/* -> ./src/*` alias remain unchanged.
- `backend/supabase/migrations/` contains the existing SQL migration files; no migration content changes.
- Shared instructions and historical `docs/superpowers/` files remain at the repository root.

- [x] **Step 1: Move tracked frontend files and directories with `git mv`** into `frontend/`, preserving their relative paths. Next.js generates the ignored `frontend/next-env.d.ts` during verification; do not commit it.
- [x] **Step 2: Move Supabase files and setup documentation** into `backend/`; update the setup guide's commands and migration paths.
- [x] **Step 3: Copy the ignored local environment file** into the isolated `frontend/.env.local` for verification without displaying its values; relocate the original after integrating the branch.
- [x] **Step 4: Update root ignore and guidance files** for the nested app and backend paths; create a root README explaining where to run `npm` commands.
- [x] **Step 5: Run existing frontend checks** from `frontend/`: `npm.cmd test`, `npm.cmd run typecheck`, and `npm.cmd run lint`.
- [x] **Step 6: Review staged and unstaged paths** to confirm `.env.local`, generated files, and the old dependency/cache directories are not staged; commit the relocation and documentation changes.

### Task 2: Automate static publishing from `main`

**Files:**
- Create: `.github/workflows/deploy-pages.yml`.
- Uses: `frontend/package-lock.json`, `frontend/.env.example`, `frontend/out/`, and the existing `gh-pages` branch.

**Interfaces:**
- Trigger on pushes to `main` and manual dispatch.
- Build with `GITHUB_PAGES=true` from `frontend/` after copying the public example config to the production environment file.
- Sync the export into a separate checkout of `gh-pages`, retain `.nojekyll`, and push only when generated files changed.

- [ ] **Step 1: Add the Pages workflow** with Node 22, `npm ci` in `frontend/`, `GITHUB_PAGES=true npm run build`, and `contents: write` permission.
- [ ] **Step 2: Add the publish step** that checks out `gh-pages` separately, replaces its site files with `frontend/out/`, restores `.nojekyll`, and skips empty commits.
- [ ] **Step 3: Build locally from `frontend/` with the Pages environment** and confirm the static export has the expected routes, asset paths, and removed birthday labels.
- [ ] **Step 4: Check the workflow diff and repository state**; commit the workflow separately from the relocation.

### Task 3: Publish and confirm

**Files:**
- No additional source files; uses the commits from Tasks 1 and 2.

**Interfaces:**
- The `main` branch contains the new layout and workflow; `gh-pages` contains only the generated static site.

- [ ] **Step 1: Push the commits to `main`** to trigger the Pages workflow.
- [ ] **Step 2: Confirm the Pages workflow succeeds** and `gh-pages` points to the generated export with the requested labels absent.
- [ ] **Step 3: Confirm the repository is clean** and report the new layout, test/build results, and published URL.
