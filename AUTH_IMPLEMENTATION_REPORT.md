# Supabase Authentication — Implementation Report

## 1. Files Created

| File | Purpose |
|------|---------|
| `lib/supabase/browser.ts` | `createBrowserClient()` — browser auth client (cookies) |
| `lib/supabase/server.ts` | `createServerClient()` — server client using `next/headers` cookies |
| `lib/auth.ts` | `getUser()`, `requireAuth()` — auth helpers |
| `app/login/page.tsx` | Login — email/password + Google OAuth, redirect to `/` |
| `app/signup/page.tsx` | Signup — full name, email, password; success → link to login |
| `app/auth/callback/route.ts` | OAuth callback — `exchangeCodeForSession`, redirect to `/` |
| `components/auth/UserMenu.tsx` | Header dropdown — email, Account, Logout |
| `AUTH_SETUP.md` | Google OAuth & redirect_uri setup |

## 2. Auth Flow

- **Email login:** `signInWithPassword` → redirect `/`
- **Signup:** `signUp` → success message → link to login
- **Google:** `signInWithOAuth` with `redirectTo: ${origin}/auth/callback` → callback exchanges code → redirect `/`

## 3. Session & Cookies

- Browser: `@supabase/ssr` `createBrowserClient` (cookie storage)
- Server: `createServerClient` with `cookies()` from `next/headers`
- Middleware: `getUser()` to refresh session on each request
- No localStorage; sessions in cookies only

## 4. Google OAuth — Fix `redirect_uri_mismatch`

1. **Google Cloud Console** → OAuth client (Web application) → Authorized redirect URIs:
   ```
   https://<PROJECT_REF>.supabase.co/auth/v1/callback
   ```
2. **Supabase** → Auth → URL Configuration → Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback`

See `AUTH_SETUP.md`.

## 5. Admin

- Middleware protects `/admin` — no session → redirect `/login`
- `profiles.role === 'admin'` required for `/admin`

## 6. Debug Logs

- `[login] Success, user id:` on email login
- `[auth/callback] OAuth success, user id:` on OAuth
- `[signup] Account created successfully`
