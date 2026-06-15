import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import WfBlock from "@/components/wireframe/WfBlock";
import {
  ecosystem,
  finalCta,
  hero,
  pillars,
  products,
  socialProof,
  solutions,
  sources,
  yunity,
} from "@/data/home-wireframe";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{children}</p>
  );
}

function LogoPlaceholder({
  name,
  approved,
  size = "default",
}: {
  name: string;
  approved: boolean;
  size?: "default" | "sm";
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded border border-dashed bg-white ${
        approved ? "border-gray-300 text-gray-600" : "border-amber-300 bg-amber-50 text-amber-700"
      } ${size === "sm" ? "h-8 min-w-[72px] px-2 text-[10px]" : "h-10 min-w-[88px] px-3 text-xs"}`}
      title={approved ? name : `${name} — not approved`}
    >
      {approved ? name : "NA"}
    </div>
  );
}

export default function HomeWireframe() {
  const approvedMarquee = hero.marquee.filter((b) => b.approved);

  return (
    <>
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 text-center">
        <span className="inline-flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Home wireframe — approved copy from 2026 content doc ·{" "}
          <span className="font-medium text-gray-700">home-wireframe-spec.md</span>
        </span>
      </div>

      {/* Block 1 — Hero */}
      <WfBlock block="1" label="Hero" flag="Logo clearances TBC">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            {hero.h1}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-gray-600 md:text-lg">
            {hero.subheading}
          </p>
          <div className="mt-8">
            <Link
              href={hero.cta.href}
              className="inline-flex rounded-md bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700"
            >
              {hero.cta.label}
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {hero.ratings.map((r) => (
              <div
                key={r.platform}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <span className="text-xs font-medium text-gray-500">{r.platform}</span>
                <span className="text-sm font-bold text-gray-900">{r.score}</span>
                <span className="text-amber-500" aria-hidden>
                  ★★★★★
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 py-4">
          <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Logo marquee — infinite scroll
          </p>
          <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            {[...approvedMarquee, ...approvedMarquee].map((brand, i) => (
              <LogoPlaceholder key={`${brand.name}-${i}`} name={brand.name} approved />
            ))}
          </div>
          <p className="mt-2 text-center text-[10px] text-amber-700">
            {hero.marquee.filter((b) => !b.approved).length} logos marked NA — excluded from
            marquee
          </p>
        </div>
      </WfBlock>

      {/* Block 2 — Complete health ecosystem */}
      <WfBlock block="2" label="Complete health ecosystem" band>
        <Eyebrow>{ecosystem.eyebrow}</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          {ecosystem.heading}
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {ecosystem.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-6 text-center"
            >
              <p className="text-3xl font-bold text-gray-900">
                {stat.value}
                {"footnote" in stat && stat.footnote && (
                  <sup className="ml-0.5 text-sm font-medium text-gray-400">
                    <a href="#sources" className="hover:text-gray-700">
                      {stat.footnote === 1 ? "¹" : "²"}
                    </a>
                  </sup>
                )}
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-800">{stat.label}</p>
              <p className="mt-2 text-sm text-gray-600">{stat.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-dashed border-gray-300 bg-white p-6">
          <p className="mb-4 text-center text-xs text-gray-500">
            World-leading insurers including
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {ecosystem.insurers.map((name) => (
              <LogoPlaceholder key={name} name={name} approved size="sm" />
            ))}
          </div>
        </div>
      </WfBlock>

      {/* Block 3 — A new standard */}
      <WfBlock block="3" label="A new standard (product overview)">
        <Eyebrow>{products.eyebrow}</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          {products.heading}
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group flex flex-col rounded-xl border border-gray-200 p-5 transition hover:border-gray-400 hover:shadow-sm"
            >
              <h3 className="text-base font-semibold text-gray-900 group-hover:underline">
                {card.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-gray-600">{card.description}</p>
              <Badge variant="outline" className="mt-4 w-fit">
                {card.carrier}
              </Badge>
            </Link>
          ))}
        </div>
      </WfBlock>

      {/* Block 4 — The four pillars */}
      <WfBlock
        block="4"
        label="The four pillars"
        band
        flag="Dense on mobile — accordion below lg"
      >
        <div className="hidden gap-6 lg:grid lg:grid-cols-2">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gray-200 text-xs font-bold text-gray-500">
                  ◆
                </div>
                <div>
                  <Eyebrow>{pillar.eyebrow}</Eyebrow>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900">{pillar.heading}</h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                {pillar.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Accordion className="lg:hidden" defaultValue={["engage"]}>
          {pillars.map((pillar) => (
            <AccordionItem key={pillar.id} value={pillar.id}>
              <AccordionTrigger className="text-base">
                <span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    {pillar.eyebrow}
                  </span>
                  <span className="mt-0.5 block font-semibold text-gray-900">
                    {pillar.heading}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  {pillar.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </WfBlock>

      {/* Block 4b — Yunity */}
      <WfBlock block="4b" label="Yunity intelligence band">
        <h2 className="max-w-3xl text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          {yunity.heading}
        </h2>
        <p className="mt-4 max-w-3xl text-sm text-gray-600 md:text-base">{yunity.intro}</p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {yunity.steps.map((step, i) => (
            <div key={step.title} className="relative rounded-xl border border-gray-200 p-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Step {i + 1}
              </span>
              <h3 className="mt-1 text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              {i < yunity.steps.length - 1 && (
                <span
                  className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-gray-300 md:block"
                  aria-hidden
                >
                  →
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-gray-200" aria-hidden />
          <span className="text-sm font-semibold text-gray-700">{yunity.lockup}</span>
        </div>
      </WfBlock>

      {/* Block 5 — Solutions (audience router) */}
      <WfBlock
        block="5"
        label="Solutions (audience router)"
        band
        flag="Key IA — placement low on page"
      >
        <Eyebrow>{solutions.eyebrow}</Eyebrow>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          {solutions.heading}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-gray-600 md:text-base">{solutions.intro}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {solutions.cards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-5"
            >
              <h3 className="text-base font-semibold text-gray-900">{card.title}</h3>
              <p className="mt-2 flex-1 text-sm text-gray-600">{card.description}</p>
              <Link
                href={card.cta.href}
                className="mt-4 inline-flex w-fit rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                {card.cta.label} →
              </Link>
            </div>
          ))}
        </div>
      </WfBlock>

      {/* Block 6 — Social proof */}
      <WfBlock block="6" label="Trusted, proven, scalable" flag="Carousel vs static grid TBC">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          {socialProof.heading}
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-gray-600 md:text-base">{socialProof.body}</p>

        <div className="mt-10 space-y-6">
          <div className="wf-block rounded-xl border border-gray-200 p-6">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Case study carousel
            </p>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="min-w-[240px] shrink-0 rounded-lg border border-gray-200 bg-white/70 p-4"
                >
                  <div className="wf-line mb-3 h-4 w-24" />
                  <div className="wf-line mb-2 h-3 w-full" />
                  <div className="wf-line h-3 w-4/5" />
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-gray-400">← swipe / carousel controls →</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-6">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Industry awards
              </p>
              <div className="flex flex-wrap gap-3">
                {["Award A", "Award B", "Award C", "Award D"].map((a) => (
                  <div
                    key={a}
                    className="flex h-12 w-20 items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 text-[10px] text-gray-500"
                  >
                    {a}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 p-6">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Trustpilot widget
              </p>
              <div className="wf-block flex h-24 items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-400">
                Trustpilot embed placeholder
              </div>
            </div>
          </div>
        </div>
      </WfBlock>

      {/* Block 7 — Final CTA */}
      <WfBlock
        block="7"
        label="Final CTA"
        band
        flag='CTA label differs from hero — "Request a demo" vs "Speak to our team"'
        innerClassName="py-16"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            {finalCta.heading}
          </h2>
          <p className="mt-4 text-sm text-gray-600 md:text-base">{finalCta.subheading}</p>
          <Link
            href={finalCta.cta.href}
            className="mt-8 inline-flex rounded-md bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700"
          >
            {finalCta.cta.label}
          </Link>
        </div>
      </WfBlock>

      {/* Sources — footer citations */}
      <section
        id="sources"
        className="border-b border-gray-200 bg-white px-4 py-8"
        aria-labelledby="sources-heading"
      >
        <div className="mx-auto max-w-6xl">
          <h2
            id="sources-heading"
            className="text-xs font-semibold uppercase tracking-wider text-gray-400"
          >
            Sources
          </h2>
          <ol className="mt-3 space-y-2 text-sm text-gray-600">
            {sources.map((source) => (
              <li key={source.marker}>
                <sup className="mr-1 font-medium text-gray-400">
                  {source.marker === 1 ? "¹" : "²"}
                </sup>
                {source.text}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
