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
    <div className="hero-headline mx-auto max-w-3xl text-center 2xl:max-w-5xl 3xl:max-w-6xl">
      <h1 className="type-display" style={{ color: "var(--hero-ink)" }}>
        {headline}
      </h1>
      <p
        className="type-lead mx-auto mt-8 max-w-xl text-[1.125rem] leading-[1.5] md:text-[1.5rem] md:leading-[2rem] 2xl:max-w-2xl"
        style={{ color: "var(--hero-ink)" }}
      >
        {hero.subheading}
      </p>
    </div>
  );
}
