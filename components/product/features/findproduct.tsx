"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useId } from "react";

/* ─── Types ─────────────────────────────────────────────── */
type Gender = "male" | "female" | "other";

interface FormState {
  name: string;
  dob: string;
  time: string;
  city: string;
  gender: Gender;
}

/* ─── Animated label + input ────────────────────────────── */
function Field({
  id,
  label,
  children,
  col2 = false,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  col2?: boolean;
}) {
  return (
    <div className={`fp-field${col2 ? " fp-col2" : ""}`}>
      <label htmlFor={id} className="fp-label">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────── */
export default function FindProduct() {
  const router = useRouter();
  const uid = useId();
  const id = (key: string) => `${uid}-${key}`;

  const [form, setForm] = useState<FormState>({
    name: "",
    dob: "",
    time: "",
    city: "",
    gender: "male",
  });

  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const touch = (key: keyof FormState) => setTouched((t) => ({ ...t, [key]: true }));

  const errors = useMemo(
    () => ({
      name: !form.name.trim() ? "Required" : null,
      dob: !form.dob ? "Required" : null,
      time: !form.time ? "Required" : null,
      city: !form.city.trim() ? "Required" : null,
    }),
    [form],
  );

  const canSubmit = Object.values(errors).every((e) => e === null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, dob: true, time: true, city: true });
    if (!canSubmit) return;

    setSubmitted(true);

    const params = new URLSearchParams({
      name: form.name.trim(),
      dob: form.dob,
      time: form.time,
      city: form.city.trim(),
      gender: form.gender,
      source: "product-page",
    });

    router.push(`/find-fragrance?${params.toString()}#cosmic-profile-form`);
  };

  const showErr = (key: keyof typeof errors) => touched[key] && errors[key];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .fp-root, .fp-root * {
          font-family: 'Poppins', sans-serif;
          box-sizing: border-box;
        }

        /* ── Section ── */
        .fp-section {
          width: 100%;
    
          padding: 40px 20px;
        }

        /* ── Card ── */
        .fp-card {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.1);
    overflow: hidden;
        }

        @media (max-width: 900px) {
          .fp-card { grid-template-columns: 1fr; }
        }

        /* ── Left: image ── */
        .fp-img-col {
          position: relative;
          min-height: 300px;
        }

        @media (max-width: 900px) {
          .fp-img-col { min-height: 260px; }
        }

        .fp-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 45%);
          pointer-events: none;
        }

        /* Floating tag on image */
        .fp-img-tag {
          position: absolute;
          bottom: 24px;
          left: 24px;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .fp-img-tag-eyebrow {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.72);
        }

        .fp-img-tag-title {
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }

        /* ── Right: form panel ── */
        .fp-form-col {
          display: flex;
          align-items: stretch;
          padding: 36px 36px;
          background: #f8f8f8;
        }

        @media (max-width: 600px) {
          .fp-form-col { padding: 28px 20px; }
        }

        .fp-form-inner {
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        /* ── Header ── */
        .fp-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 8px;
        }

        .fp-heading {
          font-size: 28px;
          font-weight: 700;
          color: #0a0a0a;
          line-height: 1.1;
          letter-spacing: -0.025em;
          margin-bottom: 6px;
        }

        .fp-sub {
          font-size: 13px;
          color: #777;
          line-height: 1.55;
          margin-bottom: 28px;
        }

        /* ── Form grid ── */
        .fp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px 16px;
        }

        .fp-col2 { grid-column: 1 / -1; }

        @media (max-width: 520px) {
          .fp-grid { grid-template-columns: 1fr; }
          .fp-col2 { grid-column: auto; }
        }

        /* ── Field ── */
        .fp-field { display: flex; flex-direction: column; gap: 6px; }

        .fp-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #555;
          text-transform: uppercase;
        }

        /* ── Input ── */
        .fp-input {
          height: 44px;
          width: 100%;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.13);
          border-radius: 0;
          padding: 0 14px;
          font-size: 13.5px;
          font-weight: 400;
          color: #111;
          outline: none;
          font-family: 'Poppins', sans-serif;
          transition:
            border-color 0.18s ease,
            box-shadow   0.18s ease,
            background   0.18s ease;
          -webkit-appearance: none;
          appearance: none;
        }

        .fp-input::placeholder { color: #bbb; }

        .fp-input:hover {
          border-color: rgba(0,0,0,0.25);
        }

        .fp-input:focus {
          border-color: #111;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.06);
          background: #fff;
        }

        .fp-input.error {
          border-color: #d32f2f;
          box-shadow: 0 0 0 3px rgba(211,47,47,0.07);
        }

        .fp-error-msg {
          font-size: 10.5px;
          color: #d32f2f;
          font-weight: 500;
          margin-top: -2px;
        }

        /* ── Gender ── */
        .fp-gender-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 16px;
        }

        .fp-gender-label {
          position: relative;
          cursor: pointer;
        }

        .fp-gender-label input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .fp-gender-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          width: 100%;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.12);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #555;
          transition:
            background  0.18s ease,
            border-color 0.18s ease,
            color       0.18s ease,
            box-shadow  0.18s ease;
          user-select: none;
        }

        .fp-gender-label:hover .fp-gender-btn {
          border-color: rgba(0,0,0,0.28);
          color: #111;
        }

        .fp-gender-label input:checked + .fp-gender-btn {
          background: #111;
          border-color: #111;
          color: #fff;
        }

        .fp-gender-label input:focus-visible + .fp-gender-btn {
          outline: 2px solid #111;
          outline-offset: 2px;
        }

        /* ── Submit ── */
        .fp-submit-row {
          margin-top: 24px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .fp-submit {
          flex: 1;
          height: 48px;
          background: #111;
          color: #fff;
          border: 1px solid #111;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          transition:
            background  0.22s ease,
            border-color 0.22s ease,
            transform   0.28s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow  0.28s ease,
            opacity     0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .fp-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.08);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .fp-submit:not(:disabled):hover {
          background: #1a1a1a;
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.28);
        }

        .fp-submit:not(:disabled):hover::before { opacity: 1; }

        .fp-submit:not(:disabled):active {
          transform: translateY(0);
          box-shadow: none;
        }

        .fp-submit:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .fp-submit svg {
          transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .fp-submit:not(:disabled):hover svg {
          transform: translateX(3px);
        }

        /* Loading shimmer on submit */
        .fp-submit.loading {
          pointer-events: none;
        }

        /* ── Progress dots ── */
        .fp-progress {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 16px;
        }

        .fp-progress-step {
          height: 3px;
          background: #e0e0e0;
          flex: 1;
          transition: background 0.3s ease;
        }

        .fp-progress-step.done { background: #111; }

        /* ── Filled count ── */
        .fp-count {
          font-size: 10.5px;
          color: #aaa;
          font-weight: 500;
          margin-top: 8px;
          letter-spacing: 0.02em;
        }
      `}</style>

      <section className="fp-root fp-section" aria-label="Astro Fragrance Finder">
        <div className="fp-card">
          {/* ── Left: image ── */}
          <div className="fp-img-col">
            <Image
              src="/care.webp"
              alt="Astro fragrance consultation"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              className="object-cover object-center"
              priority={false}
            />
            <div className="fp-img-overlay" aria-hidden="true" />
            <div className="fp-img-tag">
              <span className="fp-img-tag-eyebrow">Powered by AI</span>
              <span className="fp-img-tag-title">
                Your stars,
                <br />
                your scent.
              </span>
            </div>
          </div>

          {/* ── Right: form ── */}
          <div className="fp-form-col">
            <div className="fp-form-inner">
              {/* Header */}
              <p className="fp-eyebrow">Astro Fragrance Finder</p>
              <h2 className="fp-heading">Ask Mehak</h2>
              <p className="fp-sub">
                Share your birth details and Mehak will craft your cosmic fragrance profile in seconds.
              </p>

              {/* Progress bar — tracks filled fields */}
              {(() => {
                const steps = [!!form.name.trim(), !!form.dob, !!form.time, !!form.city.trim()];
                const filled = steps.filter(Boolean).length;
                return (
                  <>
                    <div className="fp-progress" aria-hidden="true">
                      {steps.map((done, i) => (
                        <div key={i} className={`fp-progress-step${done ? " done" : ""}`} />
                      ))}
                    </div>
                    <p className="fp-count">{filled} of 4 fields filled</p>
                  </>
                );
              })()}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate style={{ marginTop: 20 }}>
                <div className="fp-grid">
                  {/* Name */}
                  <Field id={id("name")} label="Full Name" col2>
                    <input
                      id={id("name")}
                      className={`fp-input${showErr("name") ? " error" : ""}`}
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      onBlur={() => touch("name")}
                      placeholder="Your full name"
                      autoComplete="name"
                      required
                    />
                    {showErr("name") && (
                      <span className="fp-error-msg" role="alert">
                        {errors.name}
                      </span>
                    )}
                  </Field>

                  {/* DOB */}
                  <Field id={id("dob")} label="Date of Birth">
                    <input
                      id={id("dob")}
                      type="date"
                      className={`fp-input${showErr("dob") ? " error" : ""}`}
                      value={form.dob}
                      onChange={(e) => set("dob", e.target.value)}
                      onBlur={() => touch("dob")}
                      required
                    />
                    {showErr("dob") && (
                      <span className="fp-error-msg" role="alert">
                        {errors.dob}
                      </span>
                    )}
                  </Field>

                  {/* Time */}
                  <Field id={id("time")} label="Time of Birth">
                    <input
                      id={id("time")}
                      type="time"
                      className={`fp-input${showErr("time") ? " error" : ""}`}
                      value={form.time}
                      onChange={(e) => set("time", e.target.value)}
                      onBlur={() => touch("time")}
                      required
                    />
                    {showErr("time") && (
                      <span className="fp-error-msg" role="alert">
                        {errors.time}
                      </span>
                    )}
                  </Field>

                  {/* City */}
                  <Field id={id("city")} label="Birth City" col2>
                    <input
                      id={id("city")}
                      className={`fp-input${showErr("city") ? " error" : ""}`}
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      onBlur={() => touch("city")}
                      placeholder="e.g. Mumbai"
                      autoComplete="address-level2"
                      required
                    />
                    {showErr("city") && (
                      <span className="fp-error-msg" role="alert">
                        {errors.city}
                      </span>
                    )}
                  </Field>
                </div>

                {/* Gender */}
                <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                  <legend className="fp-label" style={{ display: "block", marginBottom: 8, marginTop: 16 }}>
                    Gender
                  </legend>
                  <div className="fp-gender-grid" role="radiogroup">
                    {(["male", "female", "other"] as Gender[]).map((opt) => (
                      <label key={opt} className="fp-gender-label">
                        <input
                          type="radio"
                          name="gender"
                          value={opt}
                          checked={form.gender === opt}
                          onChange={() => set("gender", opt)}
                        />
                        <span className="fp-gender-btn">{opt}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Submit */}
                <div className="fp-submit-row">
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`fp-submit${submitted ? " loading" : ""}`}
                    aria-label="Find my cosmic fragrance"
                  >
                    Find My Cosmic Fragrance
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
