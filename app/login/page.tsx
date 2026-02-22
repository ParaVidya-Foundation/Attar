"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/browser";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createBrowserClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? "Invalid email or password."
            : authError.message,
        );
        setLoading(false);
        return;
      }

      if (data.user) {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    setLoading(true);

    try {
      const supabase = createBrowserClient();
      const origin = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
      const redirectTo = `${origin.replace(/\/+$/, "")}/auth/callback`;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (oauthError) setError(oauthError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMetaLogin() {
    setError(null);
    setLoading(true);

    try {
      const supabase = createBrowserClient();
      const origin = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
      const redirectTo = `${origin.replace(/\/+$/, "")}/auth/callback`;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: { redirectTo },
      });

      if (oauthError) setError(oauthError.message);
    } finally {
      setLoading(false);
    }
  }

  const urlError = searchParams.get("error");
  const displayError =
    error ||
    (urlError === "auth" ? "Authentication failed. Please try again." : null) ||
    (urlError ? decodeURIComponent(urlError) : null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-[420px]">
        {/* Card */}
        <div className="border border-neutral-200 bg-white p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Sign in</h1>
            <p className="mt-2 text-sm text-neutral-500">Access your account securely</p>
          </div>

          {/* Email Login */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="you@example.com"
                className="w-full border border-neutral-300 px-4 py-3 text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-150 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="••••••••"
                className="w-full border border-neutral-300 px-4 py-3 text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-150 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            {displayError && (
              <div className="bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {displayError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-900 text-white py-3 text-sm font-medium transition-all duration-150 hover:bg-black active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative text-center text-xs text-neutral-500 bg-white px-2 w-fit mx-auto">
              OR CONTINUE WITH
            </div>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-neutral-300 py-3 text-sm font-medium text-neutral-800 transition-all duration-150 hover:border-neutral-900 hover:bg-neutral-50 active:scale-[0.99] mb-3"
          >
            <img
              src="/google-icon-logo-svgrepo-com.svg"
              alt="Google"
              className="h-5 w-5"
            />
            Continue with Google
          </button>

          {/* Meta / Facebook */}
          <button
            onClick={handleMetaLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-neutral-300 py-3 text-sm font-medium text-neutral-800 transition-all duration-150 hover:border-neutral-900 hover:bg-neutral-50 active:scale-[0.99]"
          >
            <img
              src="/facebook-2-logo-svgrepo-com.svg"
              alt="Meta"
              className="h-5 w-5"
            />
            Continue with Meta
          </button>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-neutral-500">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-neutral-900 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-6 w-6 animate-pulse bg-neutral-300" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
