import SectionBlock from "@/components/section/SectionBlock";
import {
  CarrierQuote,
  ClosingCtaBand,
  Eyebrow,
  LogoPlaceholder,
  StatTiles,
} from "@/components/section/shared";
import type { AudiencePageData } from "@/data/pages/types";

export default function AudiencePage({ data }: { data: AudiencePageData }) {
  return (
    <>
      <SectionBlock block="1" label="Hero" flag={data.flags?.[0]}>
        <div className="mx-auto max-w-3xl text-center">
          {data.market && (
            <p className="mb-3 text-xs font-medium text-gray-400">Market: {data.market}</p>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {data.hero.h1 ?? data.hero.heading}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-gray-600">{data.hero.body}</p>
        </div>
      </SectionBlock>

      {data.sections.map((section, i) => (
        <SectionBlock
          key={section.heading}
          block={String(i + 2)}
          label={section.heading}
          band={i % 2 === 1}
        >
          {section.eyebrow && <Eyebrow>{section.eyebrow}</Eyebrow>}
          <h2 className="mt-1 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
            {section.heading}
          </h2>
          {section.body && (
            <p className="mt-4 max-w-3xl text-sm text-gray-600 md:text-base">{section.body}</p>
          )}
          {section.stats && <div className="mt-8"><StatTiles stats={section.stats} columns={5} /></div>}
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
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.cards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl border border-gray-200 bg-white p-5 text-center"
                >
                  <LogoPlaceholder name={card.title} size="sm" />
                  {card.description && (
                    <p className="mt-3 text-xs text-gray-500">{card.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionBlock>
      ))}

      {data.testimonial && (
        <SectionBlock block={String(data.sections.length + 2)} label="Testimonial" band>
          <CarrierQuote quote={data.testimonial} />
        </SectionBlock>
      )}

      {data.partnerLogos && (
        <SectionBlock block={String(data.sections.length + 3)} label="Insurance partners">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {data.partnerLogos.map((name) => (
              <LogoPlaceholder key={name} name={name} />
            ))}
          </div>
        </SectionBlock>
      )}

      <SectionBlock
        block={String(data.sections.length + (data.testimonial ? 4 : 3))}
        label="Final CTA"
        band
        innerClassName="py-16"
      >
        <ClosingCtaBand
          heading="Next step"
          body={
            data.pageTitle === "Carriers"
              ? "Tell us about your core products and markets. We'll outline how a partnership could work for you."
              : undefined
          }
          cta={data.primaryCta}
        />
      </SectionBlock>
    </>
  );
}
