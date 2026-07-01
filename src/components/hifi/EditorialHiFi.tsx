import SectionBlock from "@/components/hifi/section/SectionBlock";
import {
  CarrierQuote,
  ClosingCtaBand,
  Eyebrow,
  FaqAccordion,
  PrimaryButton,
  SecondaryButton,
  StatTiles,
} from "@/components/hifi/section/shared";
import type { EditorialPageData } from "@/data/pages/types";

export default function EditorialHiFi({ data }: { data: EditorialPageData }) {
  return (
    <>
      <SectionBlock block="1" label="Hero" flag={data.flags?.[0]}>
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {data.hero.heading}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-gray-600">{data.hero.body}</p>
          {data.hero.ctas && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {data.hero.ctas.map((cta, i) =>
                i === 0 ? (
                  <PrimaryButton key={cta.label} cta={cta} />
                ) : (
                  <SecondaryButton key={cta.label} cta={cta} />
                )
              )}
            </div>
          )}
        </div>
      </SectionBlock>

      {data.sections.map((section, i) => (
        <SectionBlock
          key={section.heading}
          block={String(i + 2)}
          label={section.heading}
          band={i % 2 === 1}
        >
          <h2 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
            {section.heading}
          </h2>
          {section.body && (
            <p className="mt-4 max-w-3xl text-sm text-gray-600 md:text-base">{section.body}</p>
          )}
          {section.stats && (
            <div className="mt-8">
              <StatTiles stats={section.stats} columns={3} />
            </div>
          )}
          {section.bullets && (
            <ul className="mt-6 space-y-2 text-sm text-gray-600">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}
          {section.cards && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {section.cards.map((card) => (
                <div key={card.title} className="rounded-xl border border-gray-200 bg-white p-5">
                  <h3 className="font-semibold text-gray-900">{card.title}</h3>
                  {card.description && (
                    <p className="mt-2 text-sm text-gray-600">{card.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionBlock>
      ))}

      {data.values && (
        <SectionBlock block="7" label="Our values — Love Being Yu" band>
          <Eyebrow>Our values</Eyebrow>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">Love Being Yu.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {data.values.map((v) => (
              <div key={v.name} className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-bold text-gray-900">{v.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{v.description}</p>
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {data.stats && (
        <SectionBlock block="8" label="YuLife in numbers">
          <StatTiles stats={data.stats} columns={3} />
          {data.awards && (
            <div className="mt-10">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Awards
              </p>
              <div className="flex flex-wrap gap-3">
                {data.awards.map((award) => (
                  <span
                    key={award}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600"
                  >
                    {award}
                  </span>
                ))}
              </div>
            </div>
          )}
        </SectionBlock>
      )}

      {data.testimonial && (
        <SectionBlock block="5" label="Testimonial" band>
          <CarrierQuote quote={data.testimonial} />
        </SectionBlock>
      )}

      {data.closingCta && (
        <SectionBlock block="6" label="Open-application CTA" flag={data.closingCta.note}>
          <p className="text-center text-sm text-gray-600">{data.closingCta.body}</p>
          <div className="mt-6 flex justify-center">
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-8 py-6 text-center">
              <p className="text-sm font-semibold text-gray-700">Jobs list / ATS embed</p>
              <p className="mt-2 text-xs text-gray-500">Primary component TBC</p>
            </div>
          </div>
        </SectionBlock>
      )}

      {data.faqs && (
        <SectionBlock block="10" label="FAQ accordion" band>
          <FaqAccordion questions={data.faqs} />
        </SectionBlock>
      )}

      {data.pageTitle === "About Us" && (
        <SectionBlock block="11" label="Closing CTA" innerClassName="py-16">
          <ClosingCtaBand
            heading="Talk to us"
            cta={{ label: "Talk to us", href: "/contact" }}
          />
        </SectionBlock>
      )}
    </>
  );
}
