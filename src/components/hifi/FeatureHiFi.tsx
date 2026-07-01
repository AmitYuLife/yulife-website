import Link from "next/link";
import SectionBlock from "@/components/hifi/section/SectionBlock";
import {
  ClosingCtaBand,
  Eyebrow,
  ImagePlaceholder,
  KeyResourcesBlock,
  PrimaryButton,
  StatTiles,
  TestimonialGrid,
  TrustpilotStrip,
} from "@/components/hifi/section/shared";
import type { FeaturePageData } from "@/data/pages/types";

export default function FeatureHiFi({ data }: { data: FeaturePageData }) {
  return (
    <>
      {/* Hero */}
      <SectionBlock block="1" label="Hero" flag={data.flags?.[0]}>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>{data.hero.eyebrow}</Eyebrow>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {data.hero.h1}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-gray-600">{data.hero.body}</p>
          <div className="mt-8">
            <PrimaryButton cta={data.hero.cta} />
          </div>
        </div>
      </SectionBlock>

      {/* Stats bar */}
      <SectionBlock block="2" label="Stats bar" band>
        {data.statsBar.heading && (
          <h2 className="mb-6 text-center text-lg font-semibold text-gray-900">
            {data.statsBar.heading}
          </h2>
        )}
        <StatTiles stats={data.statsBar.stats} columns={3} />
        {data.statsBar.footnote && (
          <p className="mt-4 text-center text-xs text-amber-700">⚠ {data.statsBar.footnote}</p>
        )}
      </SectionBlock>

      {/* Explainer */}
      {data.explainer && (
        <SectionBlock block="3" label="Explainer">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            {data.explainer.heading}
          </h2>
          {data.explainer.body && (
            <p className="mt-4 max-w-3xl text-sm text-gray-600">{data.explainer.body}</p>
          )}
        </SectionBlock>
      )}

      {/* How it works — zigzag blocks */}
      {data.zigzagBlocks.map((block, i) => (
        <SectionBlock
          key={block.heading}
          block={String(i + 4)}
          label={`How it works — ${block.eyebrow ?? `Block ${i + 1}`}`}
          band={i % 2 === 1}
        >
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
              {block.eyebrow && <Eyebrow>{block.eyebrow}</Eyebrow>}
              <h2 className="mt-2 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                {block.heading}
              </h2>
              {block.body && (
                <p className="mt-4 text-sm text-gray-600 md:text-base">{block.body}</p>
              )}
              {block.bullets && (
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  {block.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {block.link && (
                <Link
                  href={block.link.href}
                  className="mt-4 inline-flex text-sm font-semibold text-gray-900 underline-offset-2 hover:underline"
                >
                  {block.link.label} →
                </Link>
              )}
            </div>
            <div className={i % 2 === 1 ? "lg:order-1" : ""}>
              <ImagePlaceholder />
            </div>
          </div>
        </SectionBlock>
      ))}

      {/* Extra blocks (rewards page) */}
      {data.extraBlocks?.map((block, i) => (
        <SectionBlock key={block.label} block={`4${String.fromCharCode(97 + i)}`} label={block.label}>
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <p className="text-sm font-semibold text-gray-700">{block.label}</p>
            <p className="mt-2 text-xs text-gray-500">{block.description}</p>
            <div className="mx-auto mt-6 h-48 max-w-lg rounded-lg border border-dashed border-gray-300 bg-white" />
          </div>
        </SectionBlock>
      ))}

      {/* Tab switcher (HR Insights) */}
      {data.tabSwitcher && (
        <SectionBlock block="7b" label="Tab switcher (HR Portal views)">
          <div className="flex flex-wrap gap-2">
            {data.tabSwitcher.tabs.map((tab, i) => (
              <button
                key={tab}
                type="button"
                className={`rounded-md px-4 py-2 text-sm font-semibold ${
                  i === 0
                    ? "bg-gray-900 text-white"
                    : "border border-gray-300 bg-white text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8">
            <div className="skeleton-line mx-auto h-48 w-full max-w-2xl rounded-lg" />
            <p className="mt-3 text-center text-xs text-gray-400">Dashboard preview placeholder</p>
          </div>
        </SectionBlock>
      )}

      {/* CTA banner */}
      {data.ctaBanner && (
        <SectionBlock block="8" label="CTA banner" band innerClassName="py-12">
          <ClosingCtaBand heading={data.ctaBanner.heading} cta={data.ctaBanner.cta ?? data.hero.cta} />
        </SectionBlock>
      )}

      {/* Testimonials */}
      <SectionBlock block="9" label="Testimonial grid" flag="Static grid preferred over carousel">
        <TestimonialGrid testimonials={data.testimonials} />
      </SectionBlock>

      {/* Trustpilot */}
      <SectionBlock block="10" label="Trustpilot strip" band>
        <TrustpilotStrip />
      </SectionBlock>

      {/* Key Resources */}
      <SectionBlock block="11" label="Key Resources">
        <KeyResourcesBlock />
      </SectionBlock>

      {/* Closing CTA */}
      <SectionBlock block="12" label="Closing CTA" band innerClassName="py-16">
        <ClosingCtaBand
          heading={data.closingCta?.heading ?? "Speak to our team"}
          body={data.closingCta?.body}
          cta={data.closingCta?.cta ?? data.hero.cta}
        />
        {data.disclaimer && (
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-gray-400">
            {data.disclaimer}
          </p>
        )}
      </SectionBlock>
    </>
  );
}
