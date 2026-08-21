"use client";

import { Children, cloneElement, isValidElement, useId, useState, type ReactElement, type ReactNode } from "react";

export type AccordionItemProps = {
  /** Figma: Question */
  question: string;
  /** Figma: Answer */
  answer: string;
  /** Figma: State (Default | Open). Injected by the parent Accordion — omit when composing. */
  open?: boolean;
  onToggle?: () => void;
  /** Figma: Divider. Injected by the parent Accordion — omit when composing. */
  showDivider?: boolean;
  btnId?: string;
  panelId?: string;
};

/**
 * Figma: Accordion Item (State=Default | Open). Single accordion row — a
 * question button that toggles a collapsible answer panel. Background
 * follows the tabs/accordion convention: raised surface while closed,
 * inverse surface while open (design-system rule, not a hover state — this
 * component has no hover treatment).
 *
 * Composed as a child of `Accordion`, which injects `open`/`onToggle`/
 * `showDivider`/ids — only `question`/`answer` need authoring at the call site.
 */
export function AccordionItem({
  question,
  answer,
  open = false,
  onToggle,
  showDivider = false,
  btnId,
  panelId,
}: AccordionItemProps) {
  return (
    <div
      className={`${open ? "bg-surface-inverse" : "bg-surface-inverse-raised"} ${
        showDivider ? "border-t border-line-emphasis" : ""
      }`}
    >
      <h3 className="m-0">
        <button
          type="button"
          id={btnId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full cursor-pointer items-center justify-between gap-flow px-32 py-24 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--border-emphasis)] tablet:px-40"
        >
          <span className="type-heading-h5 text-on-inverse">{question}</span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={`shrink-0 text-accent-purple transition-transform duration-300 ease-out motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          >
            <path
              d="M6 9.5 12 15l6-5.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="type-body-lg max-w-[60ch] px-32 pb-32 text-on-inverse tablet:px-40">{answer}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Figma: Accordion. Bordered, rounded accordion column: hairline-divided
 * rows, one open at a time. Takes `AccordionItem` elements as children —
 * reorder, add, or remove rows by rearranging the children, same as
 * reordering row instances inside the Figma component.
 */
export default function Accordion({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <div className={`w-full overflow-hidden rounded-md border border-line-emphasis ${className}`}>
      {Children.map(children, (child, i) => {
        if (!isValidElement<AccordionItemProps>(child)) return child;
        const open = openIndex === i;
        return cloneElement(child, {
          open,
          onToggle: () => setOpenIndex(open ? null : i),
          showDivider: i > 0,
          btnId: `${baseId}-btn-${i}`,
          panelId: `${baseId}-panel-${i}`,
        });
      })}
    </div>
  );
}
