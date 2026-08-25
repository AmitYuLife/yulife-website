import { assetPath } from "@/lib/assetPath";
import { domSrc } from "@/lib/domSrc";

export type IntroSectionContent = {
  heading: string;
  /** One <p> per entry. */
  paragraphs: readonly string[];
};

/**
 * The homepage hero phone is a single flattened PNG (frame + app screen). We
 * reuse it here as a static mock — no coin field. The design crops the phone at
 * 636 of its 901px (Figma node 2495:7539: the frame sits 600px down a 1236px
 * section), i.e. ~71%, landing on the section's bottom border much like the
 * homepage hero. Change this ratio to raise/lower the cut.
 */
const PHONE_CROP = "434 / 636";

/**
 * Businesses section 3 (Figma node 2495:7539) — a centred "Where insurance
 * meets wellbeing" heading and intro copy, above the app phone mock cropped at
 * the same point as the homepage hero (but static, no orbiting coins).
 */
export default function IntroSection({ heading, paragraphs }: IntroSectionContent) {
  return (
    <section
      {...domSrc("IntroSection")}
      className="relative overflow-hidden border-b border-line-emphasis bg-surface-inverse"
    >
      {/*
        No bottom padding: the phone hangs off the content box and the section's
        overflow-hidden crops it flush on the bottom border, so the cut lands at
        the section edge (mirrors the homepage hero framing).
      */}
      <div className="page-container flex flex-col items-center gap-section-gap [padding-top:var(--layout-section-y-lg)]">
        <div className="flex max-w-[904px] flex-col items-center gap-group text-center">
          <h2 className="type-heading-h2 text-on-inverse">{heading}</h2>
          <div className="flex flex-col gap-flow type-body-lg text-on-inverse">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-balance">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div
          className="w-[240px] max-w-full overflow-hidden tablet:w-[340px] desktop:w-[434px]"
          style={{ aspectRatio: PHONE_CROP }}
          aria-hidden="true"
        >
          <img
            src={assetPath("/hero/iphone.png")}
            alt=""
            width={868}
            height={1802}
            decoding="async"
            draggable={false}
            className="pointer-events-none block h-auto w-full select-none"
          />
        </div>
      </div>
    </section>
  );
}
