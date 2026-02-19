"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { changePassword } from "@/app/account/change-password/actions";

const INPUT_CLASS =
  "mt-1.5 w-full rounded-xl border border-ash/60 bg-white px-4 py-3 text-sm text-ink placeholder:text-charcoal/50 transition-colors focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20 disabled:bg-ash/20 disabled:text-charcoal/80";

const LABEL_CLASS = "block text-sm font-medium text-ink";

export default function ChangePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      setIsSubmitting(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.set("password", password);
      fd.set("confirm_password", confirmPassword);
      const result = await changePassword(fd);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Password updated successfully. Redirecting…" });
        setTimeout(() => router.push("/account"), 1500);
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex-1 bg-white">
      <div className="px-4 py-10 sm:px-6 lg:px-10">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Change password
        </h1>

        {message && (
          <div
            className={`mt-4 max-w-xl rounded-xl px-4 py-3 text-sm ${
              message.type === "success"
                ? "border border-green-200 bg-green-50 text-green-800"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form className="mt-8 max-w-xl space-y-6" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="new-password" className={LABEL_CLASS}>
              New password{" "}
              <span className="text-charcoal/60" aria-hidden>
                *
              </span>
            </label>
            <div className="relative mt-1.5">
              <Lock
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/50 pointer-events-none"
                aria-hidden
              />
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${INPUT_CLASS} pl-10`}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                minLength={6}
                required
                disabled={isSubmitting}
                aria-required
              />
            </div>
            <p className="mt-1 text-xs text-charcoal/50">At least 6 characters</p>
          </div>

          <div>
            <label htmlFor="confirm-password" className={LABEL_CLASS}>
              Confirm password{" "}
              <span className="text-charcoal/60" aria-hidden>
                *
              </span>
            </label>
            <div className="relative mt-1.5">
              <Lock
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/50 pointer-events-none"
                aria-hidden
              />
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${INPUT_CLASS} pl-10`}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                minLength={6}
                required
                disabled={isSubmitting}
                aria-required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-ink px-6 py-4 text-sm font-semibold uppercase tracking-wider text-cream transition hover:bg-ink/95 disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
          >
            {isSubmitting ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
