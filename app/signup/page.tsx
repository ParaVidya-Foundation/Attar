"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/browser";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createBrowserClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (authError) {
        if (
          authError.message.toLowerCase().includes("already registered") ||
          authError.message.toLowerCase().includes("already exists")
        ) {
          setError("An account with this email already exists. Please log in.");
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // OAuth (same Supabase logic pattern)
  async function handleOAuth(provider: "google" | "facebook") {
    setError(null);
    setLoading(true);

    try {
      const supabase = createBrowserClient();
      const redirectTo = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });

      if (error) setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Success State (Apple-style minimal confirmation)
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-[420px] border border-neutral-200 p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Account created</h1>
          <p className="mt-3 text-sm text-neutral-500">Your account is ready. Continue to sign in.</p>
          <Link
            href="/login"
            className="mt-6 inline-block bg-neutral-900 text-white px-6 py-3 text-sm font-medium transition-all duration-150 hover:bg-black active:scale-[0.99]"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 m-4">
      <div className="w-full max-w-[420px]">
        {/* Card */}
        <div className="border border-neutral-200 bg-white p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Create account</h1>
            <p className="mt-2 text-sm text-neutral-500">Start your journey in seconds</p>
          </div>

          {/* OAuth Section */}
          <button
            onClick={() => handleOAuth("google")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-neutral-300 py-3 text-sm font-medium text-neutral-800 transition-all duration-150 hover:border-neutral-900 hover:bg-neutral-50 active:scale-[0.99] mb-3"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-5 w-5"
            />
            Continue with Google
          </button>

          <button
            onClick={() => handleOAuth("facebook")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-neutral-300 py-3 text-sm font-medium text-neutral-800 transition-all duration-150 hover:border-neutral-900 hover:bg-neutral-50 active:scale-[0.99]"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
              alt="Meta"
              className="h-5 w-5"
            />
            Continue with Meta
          </button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative text-center text-xs text-neutral-500 bg-white px-2 w-fit mx-auto">
              OR SIGN UP WITH EMAIL
            </div>
          </div>

          {/* Email Signup */}
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Full name</label>
              <input
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
                placeholder="John Doe"
                className="w-full border border-neutral-300 px-4 py-3 text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-150 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
            </div>

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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                placeholder="••••••••"
                className="w-full border border-neutral-300 px-4 py-3 text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-150 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
              <p className="mt-1 text-xs text-neutral-500">Minimum 6 characters</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-900 text-white py-3 text-sm font-medium transition-all duration-150 hover:bg-black active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-neutral-500">
            Already have an account?{" "}
            <Link href="/login" className="text-neutral-900 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
