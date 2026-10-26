# Frontend and Backend Folder Design

## Intent

Organize the existing birthday site into `frontend/` and `backend/` while keeping the public GitHub Pages site working. The current backend is Supabase; the repository has no standalone API service.

## Goals

- Move the Next.js app, its dependencies, static assets, tests, and frontend build configuration into `frontend/`.
- Move Supabase migrations and Supabase setup documentation into `backend/`.
- Keep shared repository files, project planning documents, and GitHub Actions configuration at the repository root.
- Keep GitHub Pages publishing from the `gh-pages` branch and automate publishing when relevant changes land on `main`.
- Preserve the existing UI, routes, Supabase behavior, and static asset base path.

## Non-goals

- Create a new API server or change Supabase schema, authentication, or policies.
- Redesign the site or change its public routes.

## Approaches

1. **Move the current app and Supabase backend into two folders (selected).** Put the Next.js project in `frontend/`, Supabase migrations and setup docs in `backend/`, leave shared tooling/docs at the root, and update the Pages build to use `frontend/`.
2. **Add a standalone API service.** Rejected because no API server exists and the request is for organization, not new backend functionality.

## File layout

- `frontend/`: `src/`, `public/`, `package.json`, lockfile, Next.js, TypeScript, ESLint, PostCSS, and Vitest configuration, plus `.env.example`.
- `backend/`: `supabase/` and `docs/supabase-admin-setup.md`.
- Repository root: `.gitignore`, `AGENTS.md`, project-level design/planning docs, and `.github/workflows/deploy-pages.yml`.
- Keep any local `.env.local` untracked and relocate it into `frontend/` so local frontend development retains its environment.

## Publishing

Build the static export from `frontend/` with `GITHUB_PAGES=true`, then publish `frontend/out` to `gh-pages` using a GitHub Actions workflow triggered by changes on `main`. The workflow will have only the repository contents permission needed to update that publish branch.

## Verification

Install from the moved frontend lockfile, run the existing tests and typecheck, build the static export, confirm the exported asset URLs use `/adhelia-birthday/`, and verify the Pages workflow publishes the generated site.
