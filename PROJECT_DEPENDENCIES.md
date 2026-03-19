# Project Dependencies Audit

This document audits the dependencies declared in `package.json` for the Next.js production project. It maps each package to its likely purpose, the system area it supports, and flags potential cleanup opportunities without changing the manifest.

## System Architecture Summary

- Frontend stack: Next.js App Router, React 19, Tailwind CSS 4, Framer Motion, GSAP, Lucide icons, Recharts, TipTap editor.
- Backend stack: Next.js route handlers and server actions running on Node.js, with Supabase client libraries for auth/data access and utility scripts powered by `tsx`.
- Database: Supabase Postgres is the primary application database. Direct `postgres` access is used for migration and maintenance scripts.
- Media storage: Cloudinary is now the external media/CDN layer; Next.js image optimization also relies on `sharp` in production environments.
- Search engine: `algoliasearch` is installed, but no active Algolia integration was found in the codebase.
- Monitoring: Sentry is configured for client/server/edge monitoring, and Vercel Analytics is enabled in the root layout.
- Caching: Upstash Redis is wired through `lib/redis.ts` and rate-limiting helpers.
- Payments: Razorpay powers order creation, checkout, and webhook processing.
- Authentication: Supabase Auth is the active authentication system for browser, server, and admin flows.

## Dependency Inventory

### Framework

| Package | Version | Purpose | Supports |
| --- | --- | --- | --- |
| `next` | `16.1.6` | Core application framework, routing, rendering, route handlers, image pipeline | Frontend and backend runtime |
| `react` | `19.2.3` | UI rendering and component model | Frontend |
| `react-dom` | `19.2.3` | React DOM renderer and server/client hydration | Frontend |

### Next.js Ecosystem

| Package | Version | Purpose | Supports |
| --- | --- | --- | --- |
| `@vercel/analytics` | `^1.6.1` | Client analytics integration via `<Analytics />` | Frontend telemetry |
| `next-sitemap` | `^4.2.3` | Sitemap and robots generation tooling | SEO/build pipeline |
| `sharp` | `^0.34.5` | Native image optimization dependency used by Next.js in production | Image optimization on server/Vercel |
| `eslint-config-next` | `16.1.6` | Next.js ESLint ruleset for app best practices | Linting/dev workflow |

### Authentication

| Package | Version | Purpose | Supports |
| --- | --- | --- | --- |
| `@supabase/ssr` | `^0.8.0` | Browser/server helpers for Supabase auth in App Router | Auth sessions in server and client contexts |
| `@supabase/supabase-js` | `^2.97.0` | Supabase client for auth, queries, admin operations, scripts | Authentication and data access |

### Database

| Package | Version | Purpose | Supports |
| --- | --- | --- | --- |
| `@supabase/supabase-js` | `^2.97.0` | Primary database access layer for application reads/writes | App database operations |
| `postgres` | `^3.4.8` | Direct PostgreSQL client used by migration/maintenance scripts | DB admin and migration scripts |

### ORM / Query Layer

| Package | Version | Purpose | Supports |
| --- | --- | --- | --- |
| `@supabase/supabase-js` | `^2.97.0` | Query client over Supabase REST/RPC APIs | Query layer for app services |
| `postgres` | `^3.4.8` | Low-level SQL execution for operational scripts | Script-level query access |

No dedicated ORM such as Prisma or Drizzle is present. The project uses Supabase clients plus direct SQL scripting instead.

### Payments

| Package | Version | Purpose | Supports |
| --- | --- | --- | --- |
| `razorpay` | `^2.9.6` | Payment gateway SDK for order creation and webhook verification | Checkout and payment backend |

### Media Storage

| Package | Version | Purpose | Supports |
| --- | --- | --- | --- |
| `cloudinary` | `^2.9.0` | Cloud media storage, transformation, and delivery SDK | Product/media asset pipeline |
| `sharp` | `^0.34.5` | Server-side image processing used by Next.js | Optimized image delivery |

### Caching

| Package | Version | Purpose | Supports |
| --- | --- | --- | --- |
| `@upstash/redis` | `^1.36.2` | Managed Redis client used for cache/rate-limit primitives | Caching and abuse protection |

### Search

| Package | Version | Purpose | Supports |
| --- | --- | --- | --- |
| `algoliasearch` | `^5.49.2` | Algolia search client | Intended site search integration |

### Monitoring

| Package | Version | Purpose | Supports |
| --- | --- | --- | --- |
| `@sentry/nextjs` | `^10.39.0` | Error tracking, performance monitoring, source map handling | Client, server, and edge observability |
| `@vercel/analytics` | `^1.6.1` | Lightweight page and usage analytics | Product analytics |
| `next-safe` | `^3.5.0` | Security headers/CSP helper library for Next.js | Intended security hardening |

### Validation

| Package | Version | Purpose | Supports |
| --- | --- | --- | --- |
| `zod` | `^4.3.6` | Request, API, and form validation schemas | Backend validation and typed input contracts |
| `@hookform/resolvers` | `^5.2.2` | Adapter layer between form libraries and schema validators | Intended form validation |
| `envalid` | `^8.1.1` | Environment variable validation library | Intended configuration validation |

### UI Libraries

| Package | Version | Purpose | Supports |
| --- | --- | --- | --- |
| `@tiptap/react` | `^3.20.0` | Rich-text editor framework used in admin blog editing | Admin CMS/editor UI |
| `@tiptap/starter-kit` | `^3.20.0` | TipTap editor extension bundle | Admin editor features |
| `@tiptap/extension-link` | `^3.20.0` | Link support for the TipTap editor | Admin editor features |
| `framer-motion` | `^12.33.0` | Declarative animation library | Marketing and content UI animation |
| `gsap` | `^3.14.2` | Advanced timeline/scroll animation tooling | Hero/scroll interactions |
| `lucide-react` | `^0.563.0` | Icon library | Shared UI and admin UI |
| `react-hook-form` | `^7.71.2` | Form state management library | Intended complex forms |
| `recharts` | `^3.7.0` | Charting components | Admin analytics dashboard |
| `styled-components` | `^6.3.10` | CSS-in-JS library | Intended component styling |

### Styling

| Package | Version | Purpose | Supports |
| --- | --- | --- | --- |
| `tailwindcss` | `^4` | Utility-first styling framework | Global UI styling |
| `@tailwindcss/postcss` | `^4` | Tailwind PostCSS integration | Build-time CSS compilation |
| `clsx` | `^2.1.1` | Conditional class name composition | UI utility layer |
| `tailwind-merge` | `^3.4.0` | Deduplicates Tailwind class strings | UI utility layer |
| `styled-components` | `^6.3.10` | CSS-in-JS runtime styling | Potential alternate styling path |

### Testing

| Package | Version | Purpose | Supports |
| --- | --- | --- | --- |
| `vitest` | `^3.2.4` | Test runner and assertions | Unit and integration tests |
| `vite` | `^7.1.3` | Underlying dev server/bundler used by Vitest | Test tooling |
| `jsdom` | `^26.1.0` | Browser-like DOM environment for tests | Component/browser-style tests |
| `@testing-library/react` | `^16.3.0` | React component testing helpers | UI tests |
| `@testing-library/user-event` | `^14.6.1` | Simulates user interactions in tests | UI tests |
| `@testing-library/jest-dom` | `^6.8.0` | Extended DOM assertions | UI tests |

### Build Tools

| Package | Version | Purpose | Supports |
| --- | --- | --- | --- |
| `tsx` | `^4.20.5` | Runs TypeScript scripts directly | Seeds, migrations, sitemap generation |
| `typescript` | `^5` | Static type checking and TS transpilation support | Entire codebase |
| `postcss` | transitive | CSS transform pipeline used through Tailwind integration | CSS build pipeline |

`postcss` is not declared directly but is part of the effective build stack because Tailwind’s PostCSS plugin depends on it.

### Dev Tools

| Package | Version | Purpose | Supports |
| --- | --- | --- | --- |
| `dotenv` | `^17.3.1` | Loads env vars for scripts and local tooling | Script/runtime setup |
| `eslint` | `^9` | Static analysis and linting | Developer workflow |
| `eslint-config-prettier` | `^10.1.8` | Disables formatting-conflicting ESLint rules | Lint/format workflow |
| `@types/node` | `^20` | Node.js TypeScript types | Type safety |
| `@types/react` | `^19` | React TypeScript types | Type safety |
| `@types/react-dom` | `^19` | React DOM TypeScript types | Type safety |
| `prettier` | `^3.6.2` | Code formatting | Developer workflow |

## Usage Notes By Package

### Confirmed active runtime dependencies

- `@sentry/nextjs`: used in `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, and `next.config.mjs`.
- `@supabase/ssr` and `@supabase/supabase-js`: used across `lib/supabase/*`, admin utilities, API routes, and scripts.
- `@upstash/redis`: used in `lib/redis.ts`.
- `@vercel/analytics`: used in `app/layout.tsx`.
- `cloudinary`: used in `lib/cloudinary.ts` and `scripts/upload-cloudinary.js`.
- `date-fns`: used in blog components.
- `framer-motion`: used widely in public-facing content components.
- `gsap`: used in `components/Home/ScrollVideo.tsx`.
- `lucide-react`: used broadly across storefront and admin UI.
- `nodemailer`: used in `lib/email/sendAstroLead.ts`.
- `razorpay`: used in `lib/payments/razorpay.ts`.
- `recharts`: used in admin analytics components.
- `sweph-wasm`: used across `lib/astrology/*`.
- `tailwind-merge` and `clsx`: combined in `lib/utils.ts`.
- `zod`: used in validation modules and API routes.

### Confirmed active build/dev dependencies

- `dotenv`: used by multiple scripts and the Cloudinary upload script.
- `postgres`: used by `scripts/run-migration.ts`.
- `tailwindcss` and `@tailwindcss/postcss`: used by `tailwind.config.ts`, `styles/globals.css`, and `postcss.config.mjs`.
- `vitest`: used in `vitest.config.ts` and test files under `tests/`.

## Findings

### Unused or likely-unused dependencies

These are based on repository usage scans, not on package metadata alone.

- `algoliasearch`: no code references were found. This looks like planned search functionality that is not yet integrated.
- `envalid`: no usage was found. The project currently validates env manually in `lib/env.ts` and `lib/security/assertEnv.ts`.
- `next-safe`: no usage was found. Security headers are hand-authored in `next.config.mjs`.
- `react-hook-form`: no import usage was found. Forms currently appear to use server actions, `FormData`, and `react-dom` form state instead.
- `@hookform/resolvers`: no usage was found, which aligns with `react-hook-form` appearing unused.
- `styled-components`: no import usage was found. The UI stack is Tailwind-first.
- `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`: no direct usage was found in current tests. They may be intended for future component tests.
- `next-sitemap`: a config file exists, but the current `postbuild` script only prints a message and sitemap generation appears to rely on `app/sitemap.ts` instead. This makes `next-sitemap` a likely legacy dependency unless used in CI outside the repo scripts.
- `eslint-config-next` and `eslint-config-prettier`: these are referenced by the legacy `.eslintrc.cjs`, but the active ESLint 9 flat config in `eslint.config.mjs` is minimal. These packages may still be vestigial unless the team explicitly runs ESLint in legacy-config mode.

### Duplicate or overlapping dependencies

- `@supabase/ssr` and `@supabase/supabase-js` are not duplicates, but they overlap around Supabase client creation. This is expected and appropriate.
- `clsx` and `tailwind-merge` intentionally overlap in class composition and are commonly paired.
- `framer-motion` and `gsap` overlap as animation libraries. Keeping both is valid, but it increases client bundle weight and cognitive overhead.
- Tailwind CSS and `styled-components` overlap conceptually as styling systems. Because `styled-components` shows no active usage, it is the clearest styling duplication candidate.
- `package-lock.json` and `pnpm-lock.yaml` both exist while `packageManager` is set to `pnpm`. This is not a `package.json` dependency duplication, but it is toolchain duplication that can cause install drift.

### Heavy dependencies that can impact bundle size or install/runtime cost

- `@sentry/nextjs`: valuable in production, but it adds build-time and runtime instrumentation overhead.
- `framer-motion`: powerful but non-trivial for client bundles when used broadly.
- `gsap`: large relative to simpler animation needs, especially if only a small part of GSAP is used.
- `recharts`: charting libraries are typically sizeable and should stay isolated to admin-only routes.
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`: rich text editors are heavy and should remain admin-only.
- `sweph-wasm`: WebAssembly plus ephemeris-related logic can be expensive; it is appropriate for astrology features but should not leak into routes that do not need it.
- `sharp`: heavy in install footprint due to native binaries, though justified for image optimization.
- `cloudinary`: modest server-side weight, but fine because it should remain off the client.

## Recommended Optimizations

- Remove or formally justify unused candidates: `algoliasearch`, `envalid`, `next-safe`, `react-hook-form`, `@hookform/resolvers`, `styled-components`, and possibly the Testing Library packages.
- Decide whether `next-sitemap` is still part of the deployment pipeline. If App Router’s `app/sitemap.ts` is the source of truth, remove the extra package and config.
- Consolidate animation strategy. If GSAP is only used in one place, consider whether Framer Motion plus native scroll APIs can cover it.
- Keep heavy admin-only packages out of the storefront. TipTap and Recharts should stay behind admin routes and avoid accidental imports into shared client components.
- Consider moving `cloudinary` to server-only usage patterns everywhere. Do not import it into client components.
- Replace manual env validation with `envalid` only if the team wants stricter schema-driven configuration. Otherwise remove `envalid`.
- If ESLint 9 flat config is the intended standard, migrate the legacy `.eslintrc.cjs` rules into `eslint.config.mjs` and then remove unused config packages if possible.
- Standardize on a single lockfile. Since `packageManager` is `pnpm@10.17.1`, keeping `pnpm-lock.yaml` and dropping `package-lock.json` would reduce drift risk.

## Overall Assessment

- The core production stack is coherent: Next.js, Supabase, Razorpay, Upstash Redis, Sentry, Tailwind, and Cloudinary fit the application architecture well.
- The main cleanup opportunity is not the primary runtime stack; it is the set of likely legacy or planned-but-unused packages around search, alternate form tooling, alternate styling, security helpers, and sitemap generation.
- No changes were made to `package.json` as part of this audit.
