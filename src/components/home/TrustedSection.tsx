"use client";

import { socialProof } from "@/data/home-content";
import TrustedTabbedPanel from "@/components/home/TrustedTabbedPanel";
import { useReveal } from "./useReveal";
import { assetPath } from "@/lib/assetPath";
import { domSrc } from "@/lib/domSrc";

const AWARDS = [
  assetPath("/home/award-1.svg"),
  assetPath("/home/award-2.svg"),
  assetPath("/home/award-3.svg"),
];

export default function TrustedSection() {
  const scope = useReveal<HTMLElement>();

  return (
    <section {...domSrc("TrustedSection")}
      ref={scope}
      className="relative overflow-hidden border-t border-line-emphasis"
      style={{
        backgroundColor: "var(--purple-800)",
      }}
      aria-labelledby="trusted-heading"
    >
      <div className="page-container section-y">
        <div className="flex flex-col items-center gap-flow text-center">
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
            className="type-body-lg mx-auto max-w-[820px]"
            style={{ color: "color-mix(in srgb, var(--neutral-white) 85%, transparent)" }}
          >
            {socialProof.body}
          </p>
        </div>

        <div data-reveal className="mt-48">
          <TrustedTabbedPanel />
        </div>

        <ul
          data-reveal
          className="mt-40 flex flex-wrap items-center justify-center gap-x-48 gap-y-24 tablet:mt-48 desktop:flex-nowrap desktop:gap-[72px]"
        >
          {AWARDS.map((src, index) => (
            <li
              key={src}
              className={`flex items-center justify-center py-16 desktop:flex-1 desktop:py-32 ${
                index === 0 ? "desktop:justify-start" : "desktop:justify-center"
              }`}
            >
              <img
                src={src}
                alt="Industry award"
                className="h-64 w-auto shrink-0 tablet:h-80 desktop:h-96"
                style={{ maxWidth: "none" }}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
