"use client";

import React, { useState, FormEvent } from "react";
import { Playfair_Display } from "next/font/google";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export default function BlogHero() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSubmitStatus("success");
      setEmail("");
      setTimeout(() => setSubmitStatus("idle"), 3000);
    } catch (error) {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="relative flex flex-col justify-center sm:py-16 overflow-hidden"
      aria-label="Blog hero section"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Main Heading */}
        <h1
          className={`${playfairDisplay.variable} font-playfair text-center mb-4 animate-fade-in-up-delay-1`}
        >
          <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-gray-900 leading-tight">
            Learn from the <span className="text-[#A0522D] italic font-semibold">Best & Authentic Blogs</span>
          </span>
        </h1>

        {/* Sub-heading */}
        <h2
          className={`${playfairDisplay.variable} font-playfair text-center mb-10 sm:mb-14 md:mb-16 animate-fade-in-up-delay-2`}
        >
          <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal text-gray-900 leading-tight">
            Verified by <span className="text-[#A0522D] italic font-semibold">Astrologer</span>
          </span>
        </h2>

        {/* Body Paragraph */}
        <p className="mx-auto max-w-2xl text-center text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-8 sm:mb-10 md:mb-12 animate-fade-in-up-delay-3">
          Explore our extensive collection of furniture and home decor that harmoniously blend aesthetics with
          functionality. From timeless classics to the latest trends, each piece is thoughtfully selected to
          elevate your home and express your individuality.
        </p>

        {/* Email Sign-up Form */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-md animate-fade-in-up-delay-4"
          aria-label="Email sign-up form"
        >
          <div className="flex flex-col gap-3 sm:gap-4">
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 sm:py-3.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A0522D]/20 focus:border-[#A0522D] transition-all duration-200 text-base sm:text-lg"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 sm:py-3.5 rounded-lg bg-[#A0522D] text-white font-medium text-base sm:text-lg hover:bg-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing up...
                </span>
              ) : submitStatus === "success" ? (
                "✓ Signed up successfully!"
              ) : submitStatus === "error" ? (
                "✗ Error. Try again"
              ) : (
                "Sign up free →"
              )}
            </button>
          </div>

          {submitStatus === "success" && (
            <p className="mt-3 text-center text-sm text-green-600 animate-fade-in">
              Thank you! Check your email for confirmation.
            </p>
          )}
          {submitStatus === "error" && (
            <p className="mt-3 text-center text-sm text-red-600 animate-fade-in">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
