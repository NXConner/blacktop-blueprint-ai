# Blacktop Blackout

## Development

- Node.js 18+ and npm 10+
- Install deps:

```sh
npm ci
```

- Run dev server:

```sh
npm run dev
```

- Lint and type-check:

```sh
npm run lint
npx tsc --noEmit
```

- Build production bundle:

```sh
npm run build
npm run preview
```

## Environment

Copy `.env.example` to `.env.local` and fill in values:

```sh
cp .env.example .env.local
```

Required for auth/data:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Optional feature keys (enable specific integrations):
- `VITE_WEATHER_API_KEY`, `VITE_ROUTING_API_KEY`, `VITE_EIA_API_KEY`
- `VITE_GSA_API_KEY`, `VITE_SAM_GOV_API_KEY`
- `VITE_POINT_CLOUD_API_KEY`, `VITE_AI_ANALYSIS_API_KEY`
- `VITE_HUGGINGFACE_TOKEN` (or `HUGGINGFACE_TOKEN`)

## Scripts

- `npm run dev`: Vite dev server on port 8080
- `npm run build`: Production build
- `npm run preview`: Preview built app
- `npm run lint`: ESLint over the project

## Project Structure

- `src/pages/*`: Route components
- `src/components/*`: UI and feature components
- `src/services/*`: Business logic and data services
- `src/integrations/*`: External APIs (Supabase, Hugging Face, etc.)
- `src/lib/*`: Env helpers, utils, themes

## Database (Supabase)

SQL migrations are in `supabase/migrations`. Provision a Supabase project and apply migrations in order. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for local dev.

## Notes

- Some features are stubs or demos gated by environment variables. The app runs without keys, but certain actions will be disabled.
