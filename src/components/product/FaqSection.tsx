"use client";

import { useReveal } from "@/components/home/useReveal";
import { domSrc } from "@/lib/domSrc";
import Accordion, { AccordionItem } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import type { Cta, FaqEntry } from "@/data/pages/types";

export type { FaqEntry };

const ANSWER_PLACEHOLDER = "Answer copy to follow — pulled from the source content.";

const DEFAULT_INTRO =
  "You can also visit our comprehensive guide to YuLife at our Help Hub where our customer team is ready to answer your questions.";

const DEFAULT_CTA: Cta = { label: "Visit our Help Hub", href: "https://faq.yulife.com/en/" };

function toEntry(entry: FaqEntry) {
  return typeof entry === "string"
    ? { question: entry, answer: ANSWER_PLACEHOLDER }
    : { question: entry.question, answer: entry.answer };
}

/**
 * FAQ section for the product pages (Figma node 2357:1662). An inverse
 * dark-purple band split into two columns: a left content block — a large
 * serif "FAQs" display heading, a supporting paragraph and a "Get in touch"
 * button — and the shared `Accordion` on the right. Stacks to a single column
 * below the desktop breakpoint.
 */
export default function FaqSection({
  faqs,
  heading = "FAQs",
  intro = DEFAULT_INTRO,
  cta = DEFAULT_CTA,
}: {
  faqs: readonly FaqEntry[];
  heading?: string;
  intro?: string;
  cta?: Cta;
}) {
  const scope = useReveal<HTMLElement>();

  return (
    <section
      {...domSrc("FaqSection")}
      ref={scope}
      className="relative isolate border-b border-line-emphasis bg-surface-inverse"
      aria-labelledby="faq-heading"
    >
      <div className="page-container section-y grid gap-section-gap desktop:grid-cols-[minmax(0,1fr)_minmax(0,748px)] desktop:items-start desktop:gap-x-section-gap">
        {/* Left — heading, supporting copy and CTA. The ContentBlock carries a
            top offset (Figma: pt 80px) so the heading sits below the accordion's
            top edge; only applied once the columns sit side by side. */}
        <div data-reveal className="flex flex-col gap-flow desktop:pt-section-gap">
          <h2 id="faq-heading" className="type-display text-on-inverse">
            {heading}
          </h2>
          <p className="type-body-lg max-w-[42ch] text-on-inverse">{intro}</p>
          {cta && (
            <Button
              href={cta.href}
              size="lg"
              variant="solid"
              theme="onDark"
              className="self-start"
              {...(cta.href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {cta.label}
            </Button>
          )}
        </div>

        {/* Right — question / answer accordion */}
        <div data-reveal className="w-full">
          <Accordion>
            {faqs.map((entry) => {
              const { question, answer } = toEntry(entry);
              return <AccordionItem key={question} question={question} answer={answer} />;
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
