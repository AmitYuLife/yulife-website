import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Cta, Quote, Rating, Stat, Testimonial } from "@/data/pages/types";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{children}</p>
  );
}

export function LogoPlaceholder({
  name,
  size = "default",
}: {
  name: string;
  size?: "default" | "sm";
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded border border-dashed border-gray-300 bg-white text-gray-600 ${
        size === "sm" ? "h-8 min-w-[72px] px-2 text-[10px]" : "h-10 min-w-[88px] px-3 text-xs"
      }`}
    >
      {name}
    </div>
  );
}

export function PrimaryButton({ cta }: { cta: Cta }) {
  return (
    <Link
      href={cta.href}
      className="inline-flex rounded-md bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700"
    >
      {cta.label}
    </Link>
  );
}

export function SecondaryButton({ cta }: { cta: Cta }) {
  return (
    <Link
      href={cta.href}
      className="inline-flex rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
    >
      {cta.label}
    </Link>
  );
}

export function SocialProofBar({ ratings }: { ratings: Rating[] }) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-6">
      {ratings.map((r) => (
        <div
          key={r.platform}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
        >
          <span className="text-xs font-medium text-gray-500">{r.platform}</span>
          <span className="text-sm font-bold text-gray-900">{r.score}</span>
          <span className="text-amber-500" aria-hidden>
            ★
          </span>
        </div>
      ))}
    </div>
  );
}

export function StatTiles({
  stats,
  columns = 3,
}: {
  stats: Stat[];
  columns?: 2 | 3 | 4 | 5;
}) {
  const colClass =
    columns === 2
      ? "md:grid-cols-2"
      : columns === 4
        ? "md:grid-cols-2 lg:grid-cols-4"
        : columns === 5
          ? "md:grid-cols-2 lg:grid-cols-5"
          : "md:grid-cols-3";

  return (
    <div className={`grid gap-4 ${colClass}`}>
      {stats.map((stat) => (
        <div
          key={`${stat.value}-${stat.label}`}
          className="rounded-xl border border-gray-200 bg-white p-5 text-center"
        >
          <p className="text-2xl font-bold text-gray-900 md:text-3xl">{stat.value}</p>
          <p className="mt-1 text-sm font-semibold text-gray-800">{stat.label}</p>
          {stat.description && <p className="mt-2 text-xs text-gray-600">{stat.description}</p>}
          {stat.footnote && <p className="mt-2 text-[10px] text-gray-400">{stat.footnote}</p>}
        </div>
      ))}
    </div>
  );
}

export function CarrierQuote({ quote }: { quote: Quote }) {
  return (
    <blockquote className="rounded-xl border border-gray-200 bg-white p-8 md:p-10">
      <p className="text-lg italic text-gray-700 md:text-xl">&ldquo;{quote.text}&rdquo;</p>
      <footer className="mt-6 text-sm text-gray-600">
        <strong className="text-gray-900">{quote.author}</strong>
        <span className="text-gray-400"> · </span>
        {quote.role}
      </footer>
    </blockquote>
  );
}

export function FaqAccordion({ questions }: { questions: string[] }) {
  return (
    <Accordion className="rounded-xl border border-gray-200 bg-white px-4">
      {questions.map((q, i) => (
        <AccordionItem key={q} value={`faq-${i}`}>
          <AccordionTrigger className="text-left text-sm font-medium text-gray-900">
            {q}
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-gray-500">
              Answer placeholder — full copy in source doc.
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function TestimonialGrid({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((t) => (
        <blockquote
          key={`${t.author}-${t.role}`}
          className="rounded-xl border border-gray-200 bg-white p-6"
        >
          <p className="text-sm italic text-gray-700">&ldquo;{t.text}&rdquo;</p>
          <footer className="mt-4 text-xs text-gray-600">
            <strong className="text-gray-900">{t.author}</strong>
            <span className="text-gray-400"> · </span>
            {t.role}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}

export function TrustpilotStrip() {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
      <p className="text-sm font-semibold text-gray-700">
        #1 rated employee benefits platform on Trustpilot
      </p>
      <div className="mx-auto mt-4 flex h-16 max-w-md items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-400">
        Trustpilot embed placeholder
      </div>
    </div>
  );
}

export function KeyResourcesBlock() {
  return (
    <div className="rounded-xl border border-gray-200 p-6">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        Key Resources
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="skeleton-line mb-3 h-24 w-full rounded-md" />
            <div className="skeleton-line mb-2 h-4 w-3/4" />
            <div className="skeleton-line h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClosingCtaBand({
  heading,
  body,
  cta,
}: {
  heading: string;
  body?: string;
  cta: Cta;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">{heading}</h2>
      {body && <p className="mt-4 text-sm text-gray-600 md:text-base">{body}</p>}
      <div className="mt-8">
        <PrimaryButton cta={cta} />
      </div>
    </div>
  );
}

export function ImagePlaceholder({ label }: { label?: string }) {
  return (
    <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-100 text-xs text-gray-400">
      {label ?? "Image / illustration"}
    </div>
  );
}
