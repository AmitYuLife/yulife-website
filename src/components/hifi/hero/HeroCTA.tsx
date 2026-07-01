"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { hero } from "@/data/home-content";

gsap.registerPlugin(useGSAP);

export default function HeroCTA() {
  const btnRef = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    const el = btnRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const onEnter = () => {
        gsap.to(el, {
          scale: 1.03,
          boxShadow: "0 0 32px 4px rgba(232, 87, 58, 0.25)",
          duration: 0.25,
          ease: "power2.out",
        });
      };

      const onLeave = () => {
        gsap.to(el, {
          scale: 1,
          boxShadow: "0 0 0px 0px rgba(232, 87, 58, 0)",
          duration: 0.3,
          ease: "power2.inOut",
        });
      };

      const onDown = () => {
        gsap.to(el, { scale: 0.97, duration: 0.1, ease: "power3.out" });
      };

      const onUp = () => {
        gsap.to(el, { scale: 1.03, duration: 0.15, ease: "power2.out" });
      };

      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      el.addEventListener("mousedown", onDown);
      el.addEventListener("mouseup", onUp);

      return () => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        el.removeEventListener("mousedown", onDown);
        el.removeEventListener("mouseup", onUp);
      };
    });
  });

  return (
    <div className="hero-cta mt-10 text-center">
      <Link
        ref={btnRef}
        href={hero.cta.href}
        className="type-button inline-flex items-center justify-center rounded-xl px-8 py-4 text-white transition-colors will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        style={{ backgroundColor: "var(--hero-coral)" }}
      >
        {hero.cta.label}
      </Link>
    </div>
  );
}
