import { hero } from "@/data/home-content";
import { assetPath } from "@/lib/assetPath";

const MARKS: Record<string, { src: string; alt: string; width: number; height: number }> = {
  Trustpilot: {
    src: assetPath("/hero/trust-trustpilot.svg"),
    alt: "Trustpilot",
    width: 32,
    height: 32,
  },
  Capterra: {
    src: assetPath("/hero/trust-capterra.png"),
    alt: "Capterra",
    width: 33,
    height: 32,
  },
  "App Store": {
    src: assetPath("/hero/trust-apple.png"),
    alt: "App Store",
    width: 32,
    height: 32,
  },
};

export default function TrustRatings() {
  return (
    <div className="hero-ratings flex flex-wrap items-center justify-center gap-x-group gap-y-stack">
      {hero.ratings.map((r) => {
        const mark = MARKS[r.platform];
        return (
          <div key={r.platform} className="flex items-center gap-inline">
            {mark && (
              <span
                className="relative shrink-0 overflow-hidden"
                style={{ width: mark.width, height: mark.height }}
              >
                <img
                  src={mark.src}
                  alt=""
                  width={mark.width}
                  height={mark.height}
                  className="size-full object-contain"
                  aria-hidden
                />
              </span>
            )}
            <span
              className="type-heading-h5"
              style={{ color: "var(--hero-ink)" }}
            >
              {r.score}
            </span>
            <span className="sr-only">
              {r.platform} rated {r.score} out of 5
            </span>
          </div>
        );
      })}
    </div>
  );
}
