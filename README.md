# Kamal Vallabh — Luxury Attar Frontend (Next.js App Router)

Production-ready, frontend-only Next.js template for a luxury attar brand.

## Tech stack

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS (custom theme tokens in `tailwind.config.ts`)
- Framer Motion (micro-animations, respects reduced motion)
- ESLint + Prettier + lint-staged + Husky
- Vitest + React Testing Library (minimal component test)
- Local JSON mocked data (`/data/*.json`) — ready to swap to real backend

## Setup (npm)

```bash
npm install
npm run dev
```

## Setup (pnpm)

```bash
corepack enable
pnpm install
pnpm dev
```

Open `http://localhost:3000` and you’ll be redirected to `/home`.

## Scripts

- `npm run dev`: dev server
- `npm run build`: production build
- `npm run start`: run production server
- `npm run preview`: alias for start
- `npm run lint`: lint
- `npm run format`: prettier format
- `npm run type-check`: TypeScript checks
- `npm run test`: unit tests (Vitest)
- `npm run sitemap`: generate `public/sitemap.xml` + `public/robots.txt`

## SEO implementation notes

- **Metadata API**: each route exports `metadata` via `lib/seo.ts` helpers.
- **Canonical links**: set via `alternates.canonical`.
- **OG/Twitter tags**: set per page (product pages use product image as OG image).
- **JSON-LD**:
  - Product pages emit schema.org Product JSON-LD
  - Blog pages emit schema.org Article JSON-LD
- **Server-rendered content**: shop/product/blog pages are SSG with ISR (`revalidate = 3600`).
- **Sitemap + robots**: run `npm run sitemap` to write into `/public`.

## Security notes (frontend best practices)

- **CSP + security headers**: set in `next.config.mjs` via `async headers()`.
  - In production, consider using a `middleware.ts` for runtime header adjustments per route.
- **No secrets in the client**: use `NEXT_PUBLIC_*` only for non-sensitive flags. Keep server secrets in backend.
- **No unsafe HTML rendering**: blog content uses a small safe Markdown renderer (`components/blog/Markdown.tsx`) and does not parse raw HTML.
- **Auth integration**: implement OAuth/JWT on your backend and set **HttpOnly Secure SameSite** cookies server-side.

## Deployment

### Vercel

- Set `NEXT_PUBLIC_SITE_URL` in project env vars.
- Deploy normally; `next.config.mjs` includes strict headers and image remote patterns.

### AWS Amplify

- Use `amplify.yml` (provided). It installs with pnpm (preferred) or npm (fallback), runs lint/type-check/test, then builds.

### Docker

```bash
docker build -t kamal-vallabh .
docker run -p 3000:3000 kamal-vallabh
```
