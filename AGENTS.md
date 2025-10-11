# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains the Next.js App Router routes, nested layouts, and page-level loaders; keep route-specific UI close to its segment.
- `components/` hosts reusable UI pieces, with primitives in `components/ui`; extend them with composition instead of editing shared atoms.
- Domain logic lives in `contexts/`, `hooks/`, `lib/`, and `utils/`; prefer colocating feature helpers in the smallest applicable folder.
- Database artefacts sit in `db/` (`schema.ts`, generated migrations, and `seed.sql`); update the schema before touching SQL by hand.
- Static assets reside in `public/`; Tailwind config, PostCSS, and global styles are at the repository root.

## Build, Test, and Development Commands
```bash
npm run dev        # Starts the Next.js dev server with hot reloading
npm run build      # Produces a clean production build in .next/
npm run start      # Serves the production build locally
npm run lint       # Runs ESLint with the Next.js configuration
npx drizzle-kit generate:pg  # Regenerates SQL migrations from db/schema.ts
```

## Coding Style & Naming Conventions
- TypeScript is mandatory; enable strict types and avoid `any`. Follow the project alias `@/*` instead of relative `../../../` imports.
- Keep two-space indentation and rely on the repo ESLint config (plus the Next.js defaults) for formatting; run `npm run lint -- --fix` when updating shared code.
- Use PascalCase for React components and context providers, camelCase for hooks/utilities (`useXyz`, `fetchFoo`), and SCREAMING_SNAKE_CASE for environment variables.
- Favor functional components with explicit props types; centralize theme tokens in Tailwind before adding ad-hoc class names.

## Testing Guidelines
- No automated test suite ships today; when adding coverage, colocate files as `Component.test.tsx` (or `*.spec.ts`) beside the source or under a new `tests/` directory.
- Prefer React Testing Library for UI and lightweight integration checks; stub Supabase-bound fetches via dependency injection.
- Ensure new logic is at least lint-clean and, when feasible, exercised by Storybook-like smoke tests within feature branches before opening a PR.

## Commit & Pull Request Guidelines
- Follow the existing `type(scope): summary` pattern (e.g., `feat(auth): add guest mode`), keep messages in the imperative mood, and group related changes per commit.
- Reference issues with `Refs #id` when applicable, and describe functional impact plus testing steps in the PR body; screenshots or GIFs are expected for UI updates under `app/` or `components/`.
- Before requesting review, run `npm run lint` and, if migrations changed, include the generated SQL diff along with any updates to `db/seed.sql`.

## Environment & Data Tips
- Provide a `.env.local` with `SUPABASE_DB_URL` before running database commands; never commit secrets.
- Use `seed.sql` as the canonical starting dataset and document any manual seed adjustments in the PR description.
- If you introduce new services or cron jobs, record configuration expectations in `contexts/` README fragments or inline docblocks to keep onboarding fast.
