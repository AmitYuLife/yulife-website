import SectionBlock from "@/components/section/SectionBlock";
import {
  CarrierQuote,
  ClosingCtaBand,
  Eyebrow,
  FaqAccordion,
  ImagePlaceholder,
  LogoPlaceholder,
  PrimaryButton,
  SecondaryButton,
  SocialProofBar,
  StatTiles,
} from "@/components/section/shared";
import type { ProductPageData } from "@/data/pages/types";

export default function ProductPage({ data }: { data: ProductPageData }) {
  const heroCtas = data.hero.ctas ?? [data.primaryCta];

  return (
    <>
      {/* Block 1 — Hero */}
      <SectionBlock block="1" label="Hero">
        <div className="mx-auto max-w-3xl text-center">
          {data.hero.eyebrow && <Eyebrow>{data.hero.eyebrow}</Eyebrow>}
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {data.hero.h1}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-gray-600">{data.hero.body}</p>
          {data.hero.partnerLockup && (
            <div className="mt-6 flex justify-center">
              <LogoPlaceholder name={data.hero.partnerLockup} />
            </div>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {heroCtas.map((cta, i) =>
              i === 0 ? (
                <PrimaryButton key={cta.label} cta={cta} />
              ) : (
                <SecondaryButton key={cta.label} cta={cta} />
              )
            )}
          </div>
          {data.ratings && <SocialProofBar ratings={data.ratings} />}
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          Underwritten by {data.carrier}
        </p>
      </SectionBlock>

      {/* Block 2 — Social proof chips OR carrier quote */}
      {data.statChips && (
        <SectionBlock block="2" label="Social-proof bar (stat chips)" band>
          <StatTiles stats={data.statChips} columns={4} />
        </SectionBlock>
      )}

      {data.carrierQuote && (
        <SectionBlock block="2" label="Carrier quote (lockup)" band={!data.statChips}>
          <CarrierQuote quote={data.carrierQuote} />
        </SectionBlock>
      )}

      {/* Cash plan: explainer */}
      {data.explainer && (
        <SectionBlock block="3" label="What is it?" band={!!data.statChips}>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            {data.explainer.heading}
          </h2>
          <p className="mt-4 max-w-3xl text-sm text-gray-600 md:text-base">
            {data.explainer.body}
          </p>
        </SectionBlock>
      )}

      {/* Numbered value sections */}
      {data.valueSections?.map((section, i) => (
        <SectionBlock
          key={section.number}
          block={String(section.number + 2)}
          label={`${section.number} · ${section.eyebrow}`}
          band={i % 2 === 1}
          flag={i === 0 && data.flags?.[0] ? data.flags[0] : undefined}
        >
          <div className="grid items-start gap-8 lg:grid-cols-2">
            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
              <span className="text-4xl font-bold text-gray-200">{section.number}</span>
              <Eyebrow>{section.eyebrow}</Eyebrow>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                {section.heading}
              </h2>
              {section.body && (
                <p className="mt-4 text-sm text-gray-600 md:text-base">{section.body}</p>
              )}
              <ul className="mt-6 space-y-2 text-sm text-gray-600">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              {section.footnote && (
                <p className="mt-4 text-xs text-gray-400">{section.footnote}</p>
              )}
            </div>
            <div className={i % 2 === 1 ? "lg:order-1" : ""}>
              <ImagePlaceholder />
            </div>
          </div>
        </SectionBlock>
      ))}

      {/* Cash plan: coverage */}
      {data.coverage && (
        <SectionBlock block="4" label="What's covered" band>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            {data.coverage.heading}
          </h2>
          {data.coverage.subheading && (
            <p className="mt-2 text-sm text-gray-500">{data.coverage.subheading}</p>
          )}
          <div className="mt-8 space-y-6">
            {data.coverage.groups.map((group) => (
              <div key={group.label} className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-800">
                  {group.label}
                </h3>
                <ul className="mt-3 space-y-1 text-sm text-gray-600">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {group.footnote && (
                  <p className="mt-3 text-xs text-gray-400">{group.footnote}</p>
                )}
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {/* Cash plan: process steps */}
      {data.processSteps && (
        <SectionBlock block="5" label="How it works (4-step process flow)">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            {data.processSteps.heading}
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {data.processSteps.steps.map((step, i) => (
              <div key={step.title} className="rounded-xl border border-gray-200 p-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Step {i + 1}
                </span>
                <h3 className="mt-1 text-base font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {/* Cash plan: employee section */}
      {data.employeeSection && (
        <SectionBlock block="6" label="For your employees" band>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            {data.employeeSection.heading}
          </h2>
          {data.employeeSection.body && (
            <p className="mt-4 max-w-3xl text-sm text-gray-600">{data.employeeSection.body}</p>
          )}
          {data.employeeSection.quote && (
            <blockquote className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
              <p className="italic text-gray-700">
                &ldquo;{data.employeeSection.quote.text}&rdquo;
              </p>
              <footer className="mt-4 text-sm text-gray-600">
                — {data.employeeSection.quote.author}
              </footer>
            </blockquote>
          )}
        </SectionBlock>
      )}

      {/* FAQ */}
      <SectionBlock
        block={data.coverage ? "7" : "9"}
        label="FAQ accordion"
        flag={data.flags?.includes("FAQ near-duplicates — de-duplicate before build") ? "Near-duplicate questions" : undefined}
      >
        <FaqAccordion questions={data.faqs} />
      </SectionBlock>

      {/* Legal footer (Cash Plan) */}
      {data.legalFooter && (
        <SectionBlock block="8" label="Legal footer" band>
          <p className="text-xs leading-relaxed text-gray-500">{data.legalFooter}</p>
        </SectionBlock>
      )}

      {/* Closing CTA for standard product pages */}
      {!data.legalFooter && (
        <SectionBlock block="10" label="Closing CTA" band innerClassName="py-16">
          <ClosingCtaBand
            heading="Ready to learn more?"
            cta={data.primaryCta}
          />
        </SectionBlock>
      )}
    </>
  );
}
