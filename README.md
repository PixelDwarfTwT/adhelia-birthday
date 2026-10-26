# Adhelia Birthday

## Project layout

- `frontend/` contains the Next.js birthday site, admin UI, static assets, and frontend tests.
- `backend/` contains the Supabase migrations and admin setup guide. Supabase is the managed backend; there is no separate API server.
- `docs/` contains project design notes and implementation plans.

## Run the frontend locally

```powershell
cd frontend
npm ci
npm run dev
```

Run the existing checks from `frontend/`:

```powershell
npm test
npm run typecheck
npm run lint
```

Copy `frontend/.env.example` to `frontend/.env.local` for local Supabase access. Never put a service-role key in a `NEXT_PUBLIC_` variable.

## GitHub Pages

Pushes to `main` trigger `.github/workflows/deploy-pages.yml`. It builds the static site from `frontend/` and updates the `gh-pages` publishing branch.

Site: <https://pixeldwarftwt.github.io/adhelia-birthday/>
