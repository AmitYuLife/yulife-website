import SectionBlock from "@/components/section/SectionBlock";
import PageHero from "@/components/hero/PageHero";
import ProductLogoBar from "@/components/product/ProductLogoBar";
import CarrierQuoteSection from "@/components/product/CarrierQuoteSection";
import EverydayValueSection, {
  type CarrierLogo,
} from "@/components/product/EverydayValueSection";
import ClinicalExcellenceSection from "@/components/product/ClinicalExcellenceSection";
import ProvenRoiSection from "@/components/product/ProvenRoiSection";
import BusinessPulseSection from "@/components/product/BusinessPulseSection";
import JoinMissionCard from "@/components/home/JoinMissionCard";
import FaqSection from "@/components/product/FaqSection";
import {
  Eyebrow,
  ImagePlaceholder,
  StatTiles,
} from "@/components/section/shared";
import { assetPath } from "@/lib/assetPath";
import type { ProductPageData } from "@/data/pages/types";

// Hero carrier lockup logos, keyed by carrier name (the "Underwritten by …"
// mark shown in the hero). Carriers without an entry fall back to their name.
const HERO_CARRIER_LOGOS: Record<
  string,
  { src: string; width: number; height: number }
> = {
  Bupa: { src: assetPath("/logos/carriers/bupa.svg"), width: 123, height: 32 },
};

// Same static phone mockup across every product hero (2x export, 436×768 at 1x).
const HERO_DEVICE = {
  kind: "device" as const,
  src: assetPath("/products/hero-phone-mockup-2x.png"),
  width: 436,
  height: 768,
};

export default function ProductPage({ data }: { data: ProductPageData }) {
  const heroCtas = data.hero.ctas ?? [data.primaryCta];

  // Split the h1 so the clause after "… that" sets in italic serif (no hard
  // break: at the design's measure the accent wraps onto its own line).
  const thatAt = data.hero.h1.indexOf(" that ");
  const heroHeadline =
    thatAt === -1
      ? { lead: data.hero.h1 }
      : {
          lead: data.hero.h1.slice(0, thatAt + 6),
          accent: data.hero.h1.slice(thatAt + 6),
        };
  const heroCarrier = data.carrier
    ? { name: data.carrier, logo: HERO_CARRIER_LOGOS[data.carrier] }
    : undefined;
  // Bespoke sections replace their grey-box value-section equivalents (same
  // content, richer treatment), so drop those from the scaffold list:
  // everydayValue → value section 1, clinicalExcellence → value section 2.
  const replacedNumbers = new Set<number>();
  if (data.everydayValue) replacedNumbers.add(1);
  if (data.clinicalExcellence) replacedNumbers.add(2);
  if (data.businessPulse) replacedNumbers.add(3);
  if (data.provenRoi) replacedNumbers.add(4);
  const valueSections = data.valueSections?.filter(
    (section) => !replacedNumbers.has(section.number),
  );

  // Carrier logo shown at the foot of the everyday-value quote block. Keyed by
  // the page's carrier; carriers without a logo asset simply render without one.
  const carrierLogos: Record<string, CarrierLogo> = {
    Bupa: { src: "/logos/carriers/bupa.svg", alt: "Bupa" },
  };
  const carrierLogo = carrierLogos[data.carrier];

  return (
    <>
      {/* Block 1 — Hero */}
      <PageHero
        eyebrow={data.hero.eyebrow}
        headline={heroHeadline}
        body={data.hero.body}
        ctas={heroCtas}
        carrier={heroCarrier}
        ratings={data.ratings}
        visual={HERO_DEVICE}
      />

      {/* Logo bar — dark single-row marquee directly under the hero */}
      <ProductLogoBar />

      {/* Block 2 — Social proof chips OR carrier quote */}
      {data.statChips && (
        <SectionBlock block="2" label="Social-proof bar (stat chips)" band>
          <StatTiles stats={data.statChips} columns={4} />
        </SectionBlock>
      )}

      {/* Standalone carrier quote — only when it hasn't moved into the
          everyday-value section (which renders it as its QuoteBlock instead) */}
      {data.carrierQuote && !data.everydayValue && (
        <CarrierQuoteSection quote={data.carrierQuote} />
      )}

      {/* Block 3 — Everyday value (bespoke, scroll-driven engagement section).
          Carries the carrier quote as its closing QuoteBlock. */}
      {data.everydayValue && (
        <EverydayValueSection
          data={data.everydayValue}
          quote={data.carrierQuote}
          carrierLogo={carrierLogo}
        />
      )}

      {/* Block 4 — Clinical excellence (bespoke illustrated benefit grid) */}
      {data.clinicalExcellence && (
        <ClinicalExcellenceSection data={data.clinicalExcellence} />
      )}

      {/* Proven ROI (bespoke animated stat band). Replaces the "Proven ROI"
          grey-box value section (number 4); per the design it sits directly
          after clinical excellence and above the Smarter Protection section. */}
      {data.provenRoi && <ProvenRoiSection data={data.provenRoi} />}

      {/* Business pulse (bespoke Yunity block, shared with the homepage).
          Replaces the "Smarter protection" grey-box value section (number 3);
          sits directly below Proven ROI. */}
      {data.businessPulse && <BusinessPulseSection data={data.businessPulse} />}

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
      {valueSections?.map((section, i) => (
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

      {/* FAQ — bespoke accordion on the raised purple surface. */}
      <FaqSection faqs={data.faqs} />

      {/* Legal footer (Cash Plan) */}
      {data.legalFooter && (
        <SectionBlock block="8" label="Legal footer" band>
          <p className="text-xs leading-relaxed text-gray-500">{data.legalFooter}</p>
        </SectionBlock>
      )}

      {/* Closing CTA — the "Join the mission to inspire life" section, an exact
          copy of the homepage closer (Figma 2179:2485). */}
      {!data.legalFooter && <JoinMissionCard />}
    </>
  );
}
