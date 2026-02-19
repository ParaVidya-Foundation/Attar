# Auth Setup — Google OAuth & Supabase

## Fix `redirect_uri_mismatch`

Google OAuth fails when redirect URIs don't match. Configure both places below.

### 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create or select **OAuth 2.0 Client ID** (type: **Web application**)
3. Under **Authorized redirect URIs**, add:
   ```
   https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback
   ```
   Replace `<YOUR_PROJECT_REF>` with your Supabase project ref (from Project Settings → General).

### 2. Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your project → Authentication → URL Configuration
2. Set **Site URL** to your production URL (e.g. `https://yourdomain.com`)
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback` (local dev)
   - `https://yourdomain.com/auth/callback` (production)

### 3. Enable Google Provider

Supabase Dashboard → Authentication → Providers → Google → Enable and add your Client ID & Secret from Google Cloud Console.

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Never use the service role key in browser code.
