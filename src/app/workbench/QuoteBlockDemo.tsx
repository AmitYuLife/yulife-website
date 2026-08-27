"use client";

import { useState } from "react";
import QuoteBlock from "@/components/blocks/QuoteBlock";
import { ToggleStrip, ToggleButton } from "./ToggleStrip";

// Inline SVG data URIs — no network, no 404s in the workbench console. The
// avatar is a tinted silhouette; the partner logo a neutral placeholder mark
// (the real design pairs a member photo with a carrier logo, e.g. Bupa).
const AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%236953f3'/%3E%3Ccircle cx='32' cy='25' r='11' fill='%23ffffff'/%3E%3Cpath d='M13 55c0-10.5 8.5-17 19-17s19 6.5 19 17z' fill='%23ffffff'/%3E%3C/svg%3E";

const PARTNER_LOGO = {
  src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 116 28'%3E%3Crect x='0' y='2' width='24' height='24' rx='6' fill='%23ffffff'/%3E%3Ccircle cx='12' cy='14' r='5.5' fill='%23340080'/%3E%3Ctext x='34' y='20' font-family='sans-serif' font-size='16' font-weight='700' fill='%23ffffff'%3EPartner%3C/text%3E%3C/svg%3E",
  alt: "Partner logo",
};

/**
 * Workbench-only harness for QuoteBlock: independent toggles for the two
 * optional props (avatar, partner logo) so both slots are visible and can be
 * exercised in place. Both default on. The dark stage lives here (the spec is
 * registered `padded: false`) so the light toggle strip stays readable.
 */
export default function QuoteBlockDemo() {
  const [avatar, setAvatar] = useState(true);
  const [partnerLogo, setPartnerLogo] = useState(true);

  return (
    <div>
      <ToggleStrip label="Optional props">
        <ToggleButton active={avatar} onClick={() => setAvatar((v) => !v)}>
          Avatar
        </ToggleButton>
        <ToggleButton active={partnerLogo} onClick={() => setPartnerLogo((v) => !v)}>
          Partner logo
        </ToggleButton>
      </ToggleStrip>

      <div className="bg-surface-inverse p-32">
        <QuoteBlock
          quote="Employers are looking for solutions that not only support people when they become unwell, but help them stay healthy in the first place."
          author="Dan Sullivan"
          role="Director of Product and Proposition"
          avatar={avatar ? AVATAR : undefined}
          partnerLogo={partnerLogo ? PARTNER_LOGO : undefined}
        />
      </div>
    </div>
  );
}
