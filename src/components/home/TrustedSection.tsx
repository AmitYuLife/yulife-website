"use client";

import { socialProof } from "@/data/home-content";
import JoinMissionCard from "@/components/home/JoinMissionCard";
import TrustedTabbedPanel from "@/components/home/TrustedTabbedPanel";
import { useReveal } from "./useReveal";
import { assetPath } from "@/lib/assetPath";

const AWARDS = [
  assetPath("/home/award-1.svg"),
  assetPath("/home/award-2.svg"),
  assetPath("/home/award-3.svg"),
];

export default function TrustedSection() {
  const scope = useReveal<HTMLElement>();

  return (
    <section
      ref={scope}
      className="relative overflow-hidden border-t border-line-emphasis"
      style={{
        backgroundColor: "var(--purple-800)",
      }}
      aria-labelledby="trusted-heading"
    >
      <div className="page-container section-y">
        <h2
          id="trusted-heading"
          data-reveal
          className="type-heading-h2"
          style={{ color: "var(--neutral-white)" }}
        >
          {socialProof.heading}
        </h2>
        <p
          data-reveal
          className="type-body-lg mt-16 max-w-[820px]"
          style={{ color: "color-mix(in srgb, var(--neutral-white) 85%, transparent)" }}
        >
          {socialProof.body}
        </p>

        <div data-reveal className="mt-48">
          <TrustedTabbedPanel />
        </div>

        <ul
          data-reveal
          className="mt-40 flex flex-wrap items-center justify-center gap-x-48 gap-y-24 tablet:mt-48 tablet:justify-between"
        >
          {AWARDS.map((src) => (
            <li key={src}>
              <img src={src} alt="Industry award" className="h-80 w-auto" />
            </li>
          ))}
        </ul>

        <div className="mt-48 flex justify-center tablet:mt-64">
          <JoinMissionCard />
        </div>
      </div>
    </section>
  );
}
