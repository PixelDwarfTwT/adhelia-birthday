# Repository guidance

- The Next.js application and its npm commands live in `frontend/`.
- Supabase migrations and setup notes live in `backend/`; Supabase is the managed backend, so do not add a separate API server without a separate design.
- Before changing Next.js code or configuration, read the relevant guide under `frontend/node_modules/next/dist/docs/`. This project uses Next.js 16, whose conventions may differ from earlier versions.
- Never commit `.env.local`, Supabase service-role keys, or other secrets. The `NEXT_PUBLIC_` Supabase publishable key is browser-visible by design.
