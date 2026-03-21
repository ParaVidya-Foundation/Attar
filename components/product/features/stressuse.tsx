"use client";

import { useEffect, useState } from "react";

export default function StressUse() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="w-full bg-[#f6f3ef] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* LEFT CARD */}
        <div
          className={`border border-[#c9a646] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)] px-6 sm:px-8 py-8 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-center text-sm tracking-[0.25em] text-[#1e2023] mb-8">HOW TO USE</h2>

          <div className="space-y-6 text-sm sm:text-base text-[#2d2f33] leading-relaxed">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-black/20 flex items-center justify-center text-xs">
                🧴
              </div>
              <p>Shake the bottle well before use</p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-black/20 flex items-center justify-center text-xs">
                🌙
              </div>
              <p>Spray lightly across your pillow before getting into bed</p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-black/20 flex items-center justify-center text-xs">
                😴
              </div>
              <p>Enjoy deep, restful sleep and wake up refreshed every morning</p>
            </div>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div
          className={`border border-[#c9a646] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)] px-6 sm:px-8 py-8 transition-all duration-700 delay-150 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-center text-sm tracking-[0.25em] text-[#1e2023] mb-8">DO YOU KNOW</h2>

          <ul className="space-y-4 text-sm sm:text-base text-[#2d2f33] leading-relaxed list-disc pl-5">
            <li>
              Sleep cycles include REM and NREM stages, each lasting around 90 minutes, repeating multiple
              times every night.
            </li>

            <li>
              REM sleep is when vivid dreaming occurs, and the body temporarily relaxes muscles to prevent
              movement.
            </li>

            <li>
              Your sleeping position impacts health. Sleeping on your back reduces acid reflux, while the left
              side improves digestion and circulation.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
