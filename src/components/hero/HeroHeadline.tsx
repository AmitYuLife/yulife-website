import { hero } from "@/data/home-content";

export default function HeroHeadline() {
  const breakAt = hero.h1.indexOf(" that ");
  const headline =
    breakAt === -1 ? (
      hero.h1
    ) : (
      <>
        {hero.h1.slice(0, breakAt + 5)}
        <br />
        <em className="hero-accent-gradient italic">
          {hero.h1.slice(breakAt + 6)}
        </em>
      </>
    );

  return (
    <div className="hero-headline flex w-full flex-col items-center gap-flow text-center">
      <h1 className="type-display w-full" style={{ color: "var(--hero-ink)" }}>
        {headline}
      </h1>
      <p className="type-lead w-full" style={{ color: "var(--hero-ink)" }}>
        {hero.subheading}
      </p>
    </div>
  );
}
