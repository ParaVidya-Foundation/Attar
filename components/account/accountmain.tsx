"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Calendar, Lock, Mail, Phone } from "lucide-react";
import { updateProfile } from "@/app/account/actions";

const INPUT_CLASS =
  "mt-1.5 w-full rounded-xl border border-ash/60 bg-white px-4 py-3 text-sm text-ink placeholder:text-charcoal/50 transition-colors focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20 disabled:bg-ash/20 disabled:text-charcoal/80";

const LABEL_CLASS = "block text-sm font-medium text-ink";

type ProfileData = {
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthday: string;
  email: string;
};

type AccountFormState = {
  title: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  birthday: string;
  email: string;
};

function splitPhone(phone: string): { code: string; number: string } {
  if (phone.startsWith("+44")) return { code: "+44", number: phone.slice(3) };
  if (phone.startsWith("+1")) return { code: "+1", number: phone.slice(2) };
  if (phone.startsWith("+91")) return { code: "+91", number: phone.slice(3) };
  return { code: "+91", number: phone };
}

export function AccountMain({ profile }: { profile: ProfileData }) {
  const parsed = splitPhone(profile.phone);

  const [form, setForm] = useState<AccountFormState>({
    title: profile.title || "Mx.",
    firstName: profile.firstName,
    lastName: profile.lastName,
    countryCode: parsed.code,
    phone: parsed.number,
    birthday: profile.birthday,
    email: profile.email,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const update = useCallback(<K extends keyof AccountFormState>(key: K, value: AccountFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setMessage(null);

      try {
        const fd = new FormData();
        fd.set("title", form.title);
        fd.set("first_name", form.firstName);
        fd.set("last_name", form.lastName);
        fd.set("phone", form.phone ? form.countryCode + form.phone : "");
        fd.set("birthday", form.birthday);

        const result = await updateProfile(fd);
        if (result.error) {
          setMessage({ type: "error", text: result.error });
        } else {
          setMessage({ type: "success", text: "Profile updated successfully." });
        }
      } catch {
        setMessage({ type: "error", text: "Something went wrong. Please try again." });
      } finally {
        setIsSubmitting(false);
      }
    },
    [form],
  );

  return (
    <div className="min-h-[70vh] flex-1 bg-white">
      <div className="px-4 py-10 sm:px-6 lg:px-10">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl">My account</h1>

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
            <label htmlFor="account-title" className={LABEL_CLASS}>
              Title{" "}
              <span className="text-charcoal/60" aria-hidden>
                *
              </span>
            </label>
            <select
              id="account-title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className={INPUT_CLASS}
              aria-required
            >
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Ms.">Ms.</option>
              <option value="Mx.">Mx.</option>
              <option value="Dr.">Dr.</option>
            </select>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="account-first-name" className={LABEL_CLASS}>
                First name{" "}
                <span className="text-charcoal/60" aria-hidden>
                  *
                </span>
              </label>
              <input
                id="account-first-name"
                type="text"
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                className={INPUT_CLASS}
                placeholder="First name"
                autoComplete="given-name"
                aria-required
              />
            </div>
            <div>
              <label htmlFor="account-last-name" className={LABEL_CLASS}>
                Last name{" "}
                <span className="text-charcoal/60" aria-hidden>
                  *
                </span>
              </label>
              <input
                id="account-last-name"
                type="text"
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                className={INPUT_CLASS}
                placeholder="Last name"
                autoComplete="family-name"
                aria-required
              />
            </div>
          </div>

          <div>
            <label htmlFor="account-phone" className={LABEL_CLASS}>
              Phone number
            </label>
            <div className="mt-1.5 flex gap-2">
              <select
                id="account-phone-country"
                value={form.countryCode}
                onChange={(e) => update("countryCode", e.target.value)}
                className={`${INPUT_CLASS} w-28 shrink-0`}
                aria-label="Country code"
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+1">🇺🇸 +1</option>
              </select>
              <div className="relative min-w-0 flex-1">
                <Phone
                  className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/50 pointer-events-none"
                  aria-hidden
                />
                <input
                  id="account-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className={`${INPUT_CLASS} pl-10`}
                  placeholder="Phone number"
                  autoComplete="tel-national"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="account-birthday" className={LABEL_CLASS}>
              Birthday
            </label>
            <div className="relative mt-1.5">
              <Calendar
                className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/50 pointer-events-none"
                aria-hidden
              />
              <input
                id="account-birthday"
                type="date"
                value={form.birthday}
                onChange={(e) => update("birthday", e.target.value)}
                className={`${INPUT_CLASS} pr-10`}
                aria-describedby="account-birthday-hint"
              />
              <span id="account-birthday-hint" className="sr-only">
                Format: day, month, year
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="account-email" className={LABEL_CLASS}>
              Email{" "}
              <span className="text-charcoal/60" aria-hidden>
                *
              </span>
            </label>
            <div className="relative mt-1.5">
              <Mail
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/50 pointer-events-none"
                aria-hidden
              />
              <input
                id="account-email"
                type="email"
                value={form.email}
                className={`${INPUT_CLASS} pl-10 bg-ash/20`}
                placeholder="you@example.com"
                autoComplete="email"
                readOnly
                aria-readonly="true"
                aria-required
              />
            </div>
          </div>

          <div>
            <label htmlFor="account-password" className={LABEL_CLASS}>
              Password{" "}
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
                id="account-password"
                type="password"
                value="••••••••"
                className={`${INPUT_CLASS} pl-10 bg-ash/20`}
                placeholder="••••••••"
                autoComplete="current-password"
                readOnly
                aria-readonly="true"
                aria-required
              />
            </div>
            <Link
              href="/account/change-password"
              className="mt-2 inline-block text-sm font-medium text-ink underline decoration-gold/60 underline-offset-4 hover:decoration-ink"
            >
              Change password
            </Link>
          </div>

          <p className="text-sm leading-6 text-charcoal/85">
            You have agreed for Anand Ras to use your data in line with the{" "}
            <Link
              href="/policies"
              className="text-ink underline decoration-gold/60 underline-offset-4 hover:decoration-ink"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/policies"
              className="text-ink underline decoration-gold/60 underline-offset-4 hover:decoration-ink"
            >
              Terms &amp; Conditions
            </Link>
            .
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-ink px-6 py-4 text-sm font-semibold uppercase tracking-wider text-cream transition hover:bg-ink/95 disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
          >
            {isSubmitting ? "Saving…" : "Save updates"}
          </button>
        </form>
      </div>
    </div>
  );
}
