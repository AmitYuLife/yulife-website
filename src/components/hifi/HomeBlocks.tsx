import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import SectionBlock from "@/components/hifi/section/SectionBlock";
import {
  ecosystem,
  finalCta,
  pillars,
  products,
  socialProof,
  solutions,
  sources,
  yunity,
} from "@/data/home-content";

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

/** Blocks 2–7 + sources. Exported so HomeHiFi can compose with its own hero / block 5 / block 2. */
export function HomeBlocks({
  replaceBlock5,
  replaceBlock2,
}: {
  replaceBlock5?: React.ReactNode;
  replaceBlock2?: React.ReactNode;
} = {}) {
  const block5 = replaceBlock5 ?? (
    <SectionBlock block="5" label="Solutions (audience router)" band flag="Key IA — placement low on page">
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
    </SectionBlock>
  );

  return (
    <>
      {block5}

      {/* Block 2 — Complete health ecosystem */}
      {replaceBlock2 ?? (
        <SectionBlock block="2" label="Complete health ecosystem">
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
        </SectionBlock>
      )}

      {/* Block 3 — A new standard */}
      <SectionBlock block="3" label="A new standard (product overview)" band>
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
      </SectionBlock>

      {/* Block 4 — The four pillars */}
      <SectionBlock
        block="4"
        label="The four pillars"
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
      </SectionBlock>

      {/* Block 4b — Yunity */}
      <SectionBlock block="4b" label="Yunity intelligence band" band>
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
      </SectionBlock>

      {/* Block 6 — Social proof */}
      <SectionBlock block="6" label="Trusted, proven, scalable" flag="Carousel vs static grid TBC">
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              {socialProof.heading}
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-gray-600 md:text-base">{socialProof.body}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-100 p-6">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-wider text-gray-400">
              Case study carousel
            </p>
            <div className="flex gap-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="flex flex-1 flex-col gap-2.5 rounded-lg border border-gray-200 bg-white p-5"
                >
                  <div className="skeleton-line h-3 w-[140px] rounded" />
                  <div className="skeleton-line h-2.5 w-full rounded" />
                  <div className="skeleton-line h-2.5 w-full rounded" />
                  <div className="skeleton-line h-2.5 w-[200px] rounded" />
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-gray-400">
              ← swipe / carousel controls →
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-gray-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Industry awards
              </p>
              <div className="flex w-full flex-wrap gap-3">
                {socialProof.awards.map((award) => (
                  <div
                    key={award}
                    className="flex min-w-0 flex-1 items-center rounded-md border border-gray-200 bg-white px-3.5 py-2"
                  >
                    <span className="text-sm text-gray-500">{award}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Trustpilot widget
              </p>
              <div className="flex h-20 items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
                Trustpilot embed placeholder
              </div>
            </div>
          </div>
        </div>
      </SectionBlock>

      {/* Block 7 — Final CTA */}
      <SectionBlock
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
      </SectionBlock>

      {/* Sources — footer citations */}
      <section
        id="sources"
        className="border-b border-gray-200 bg-white px-4 py-8"
        aria-labelledby="sources-heading"
      >
        <div className="page-container">
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
