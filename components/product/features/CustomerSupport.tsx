"use client";

import Image from "next/image";

/* ─── Config — edit these freely ───────────────────────── */
const WHATSAPP_NUMBER = "919311336643";
const WHATSAPP_MESSAGE = "Hello, I want a personalized attar recommendation from Anand Rasa.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

/* ─── Component ─────────────────────────────────────────── */
export default function CustomerSupport() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
 
        .ab-wrap * {
          font-family: 'Poppins', sans-serif;
          box-sizing: border-box;
        }
 
        /* CTA button */
        .ab-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          background: #111111;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 13px 26px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          text-decoration: none;
          transition:
            background 0.22s ease,
            transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.22s ease;
          white-space: nowrap;
        }
 
        .ab-btn:hover {
          background: #1a1a1a;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
        }
 
        .ab-btn:active {
          transform: translateY(0);
          box-shadow: none;
        }
 
        /* WhatsApp icon */
        .ab-wa-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }
 
        /* Badge */
        .ab-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 999px;
          padding: 4px 12px 4px 8px;
          font-size: 11.5px;
          font-weight: 500;
          color: #444444;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          margin-bottom: 14px;
        }
 
        .ab-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #25d366;
          flex-shrink: 0;
          animation: ab-pulse 2s ease-in-out infinite;
        }
 
        @keyframes ab-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.85); }
        }
 
        /* Image wrapper */
        .ab-img-wrap {
          position: relative;
          flex-shrink: 0;
          width: clamp(160px, 36%, 340px);
          align-self: stretch;
          min-height: clamp(120px, 18vw, 200px);
          border-radius: 0 20px 0 0;
          overflow: hidden;
        }
 
        .ab-img-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
      `}</style>

      <section className="ab-wrap flex w-full items-center justify-center">
        <div
          className="
            relative flex w-full max-w-[1200px] items-stretch justify-start overflow-hidden
            rounded-[20px] bg-[#faeee8]
          "
          style={{ minHeight: "clamp(120px, 18vw, 200px)" }}
        >
          {/* LEFT */}
          <div className="flex flex-col justify-center px-8 py-8 sm:px-10 lg:px-12">
            {/* TRUST BADGE */}
            <span className="ab-badge">
              <span className="ab-badge-dot" />
              Advisors available now
            </span>

            {/* HEADLINE (UPGRADED) */}
            <p
              className="
                mb-6 max-w-[28ch]
                text-[16px] sm:text-[18px] lg:text-[20px]
                leading-[1.4] tracking-[-0.01em]
                text-[#141414]
              "
              style={{ fontWeight: 600 }}
            >
              Personalized fragrance recommendations,
              <br className="hidden sm:block" /> powered by AI &amp; Anand Rasa experts
            </p>

            {/* CTA */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ab-btn self-start"
              aria-label="Chat with Anand Rasa fragrance expert on WhatsApp"
            >
              <svg className="ab-wa-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
              </svg>
              Chat with an Expert
            </a>
          </div>

          {/* RIGHT IMAGE */}
          <div className="ab-img-wrap">
            <Image
              src="/care.webp"
              alt="Anand Rasa fragrance expert support"
              fill
              sizes="(max-width: 640px) 160px, (max-width: 1024px) 36vw, 340px"
              style={{ objectFit: "cover", objectPosition: "top center" }}
              priority
            />
          </div>
        </div>
      </section>
    </>
  );
}
