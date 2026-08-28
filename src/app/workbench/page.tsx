import Link from "next/link";
import { componentSpecs, blockSpecs, sectionSpecs, appScreenSpecs } from "./registry";
import { typographyRoles, primitiveColorGroups, semanticColorGroups } from "./tokens";

const primitiveCount = primitiveColorGroups.reduce((n, g) => n + g.swatches.length, 0);
const semanticCount = semanticColorGroups.reduce((n, g) => n + g.swatches.length, 0);

const CARDS = [
  {
    href: "/workbench/foundations",
    title: "Foundations",
    body: `${primitiveCount + semanticCount} colours, ${typographyRoles.length} type roles, plus spacing, radii and gaps — generated from design-tokens/tokens.json.`,
  },
  {
    href: "/workbench/components",
    title: "Components",
    body: `${componentSpecs.length} reusable UI primitives, each rendered in isolation from sample props.`,
  },
  {
    href: "/workbench/blocks",
    title: "Blocks",
    body: `${blockSpecs.length} self-contained composites that assemble components into a reusable unit.`,
  },
  {
    href: "/workbench/sections",
    title: "Sections",
    body: `${sectionSpecs.length} reusable, prop-driven page sections rendered full-bleed from sample props.`,
  },
  {
    href: "/workbench/app",
    title: "App",
    body: `${appScreenSpecs.length} fake live app screen${appScreenSpecs.length === 1 ? "" : "s"} — interactive, animated canvases headed for the device mock-ups in page heroes.`,
  },
];

export default function WorkbenchOverview() {
  return (
    <div className="mx-auto max-w-[1680px] px-32 py-40">
      <h1 className="type-heading-h3 text-default">Workbench</h1>
      <p className="type-body-lg mt-16 max-w-[70ch] text-emphasis">
        Every foundation, component and template on the site, rendered in
        isolation so they can be developed and reviewed without a full page
        around them. This is a development-only tool — the code stays the source
        of truth; edit the components in <code>src/</code> and this workbench
        reflects the change.
      </p>

      <div className="mt-40 grid gap-flow sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block rounded-md border border-line bg-surface p-32 transition-colors hover:bg-surface-subtle"
          >
            <h2 className="type-heading-h5 text-default">{card.title}</h2>
            <p className="type-body-sm mt-8 text-emphasis">{card.body}</p>
          </Link>
        ))}
      </div>

      <p className="type-caption mt-40 text-emphasis">
        Phase 1 covers foundations and the clean, prop-driven tiers. Heavily
        animated hero, homepage and 3D (GSAP / R3F) sections are deferred to a
        later phase that needs a dedicated scroll/canvas harness.
      </p>
    </div>
  );
}
