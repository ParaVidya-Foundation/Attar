"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ScrollVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const video = videoRef.current;
    const container = containerRef.current;

    if (!video || !container) return;

    let tween: gsap.core.Tween | null = null;

    const initScrollVideo = () => {
      const duration = video.duration;

      const proxy = { progress: 0 };

      tween = gsap.to(proxy, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=2500",
          scrub: true,
          pin: true,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          video.currentTime = duration * proxy.progress;
        },
      });
    };

    if (video.readyState >= 1) {
      initScrollVideo();
    } else {
      video.addEventListener("loadedmetadata", initScrollVideo, { once: true });
    }

    return () => {
      if (tween) tween.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-[450vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          src="/check.mp4"
          muted
          playsInline
          preload="metadata"
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          className="w-full h-full object-cover pointer-events-none select-none"
        />
      </div>
    </section>
  );
}
