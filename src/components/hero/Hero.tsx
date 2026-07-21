"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import HeroHeadline from "./HeroHeadline";
import HeroButtons from "./HeroButtons";
import TrustRatings from "./TrustRatings";
import HeroAsset from "./HeroAsset";
import LogoMarquee from "./LogoMarquee";

gsap.registerPlugin(useGSAP);

export type HeroVariant = "product" | "character" | "atmosphere";

interface HeroProps {
  variant?: HeroVariant;
}

export default function Hero({ variant = "atmosphere" }: HeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // The coin field is deliberately NOT faded here: coins start hidden
      // behind the phone and make their own entrance (the fountain in
      // HeroCoinField), which launches once the .hero-asset fade lands.
      const targets = [
        ".hero-headline h1",
        ".hero-headline p",
        ".hero-cta-row",
        ".hero-ratings",
        ".hero-asset",
      ];

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(targets, { opacity: 0, y: 24 });

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.to(".hero-headline h1", { opacity: 1, y: 0, duration: 0.5 })
          .to(".hero-headline p", { opacity: 1, y: 0, duration: 0.45 }, "-=0.2")
          .to(".hero-cta-row", { opacity: 1, y: 0, duration: 0.4 }, "-=0.15")
          .to(".hero-ratings", { opacity: 1, y: 0, duration: 0.35 }, "-=0.1")
          .to(".hero-asset", { opacity: 1, y: 0, duration: 0.5 }, "-=0.05");
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(targets, { opacity: 1, y: 0 });
      });
    },
    { scope: sectionRef },
  );

  return (
    <div
      ref={sectionRef}
      className="hero-dark relative overflow-visible"
      style={{
        backgroundColor: "var(--hero-canvas)",
        // Pull the dark canvas up beneath the sticky header so the purple sits
        // flush behind the nav; padding restores the inner spacing below it.
        marginTop: "calc(-1 * var(--header-h))",
        paddingTop: "var(--header-h)",
      }}
    >
      <section
        className="relative isolate flex flex-col items-center overflow-visible border-b"
        style={{ borderColor: "var(--hero-divider)" }}
      >
        {variant === "product" && <ProductBackground />}
        {variant === "character" && <CharacterBackground />}

        <div className="page-container relative z-10 flex flex-col items-center gap-flow pt-24 md:pt-32 lg:pt-36">
          <HeroHeadline />
          <HeroButtons />
          <TrustRatings />
        </div>

        <div className="relative z-[1] mt-section-gap w-full">
          <HeroAsset />
        </div>
      </section>

      <section
        className="border-b"
        style={{ borderColor: "var(--hero-divider)" }}
      >
        <LogoMarquee />
      </section>
    </div>
  );
}

/**
 * Placeholder backgrounds for the other two variant directions.
 * These are structural stubs — swap with real implementations when
 * product UI mockups or character illustrations are available.
 */
function ProductBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      style={{
        background:
          "linear-gradient(135deg, var(--hero-mist) 0%, var(--hero-canvas) 100%)",
      }}
    />
  );
}

function CharacterBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      style={{
        background:
          "linear-gradient(160deg, var(--hero-canvas) 0%, color-mix(in oklch, var(--hero-sage) 8%, white) 50%, var(--hero-canvas) 100%)",
      }}
    />
  );
}
