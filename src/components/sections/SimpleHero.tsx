import type { Page } from "@/data/sitemap";
import { getNavGroupForPage } from "@/data/sitemap";
import { Button } from "@/components/ui/Button";
import { domSrc } from "@/lib/domSrc";

/**
 * Minimal bespoke page hero — a real, branded placeholder for routes whose full
 * design and copy aren't built yet. It replaces the retired grey-box PageStub /
 * wireframe templates: a dark hero band carrying the nav-group eyebrow, the page
 * title and a single CTA. As each route gets its real copy (via yulife-tov) and
 * sections, this is swapped out per page.
 *
 * Intentionally shows only the page title, not the sitemap `purpose` string —
 * that copy is an internal description of the page's intent, not public prose.
 */
export default function SimpleHero({ page }: { page: Page }) {
  const group = getNavGroupForPage(page.route);

  return (
    <section
      {...domSrc("SimpleHero")}
      className="bg-surface-inverse"
      style={{
        // Pull the dark canvas up beneath the sticky header so the purple sits
        // flush behind the nav; padding restores the inner spacing below it.
        marginTop: "calc(-1 * var(--header-h))",
        paddingTop: "var(--header-h)",
      }}
    >
      <div className="page-container section-y-lg">
        <div className="mx-auto flex max-w-[60ch] flex-col items-center gap-group text-center">
          {group && <p className="type-eyebrow text-accent-green">{group.label}</p>}
          <h1 className="type-heading-h2 text-on-inverse">{page.label}</h1>
          <Button href="/contact" variant="solid" theme="onDark">
            Get in touch
          </Button>
        </div>
      </div>
    </section>
  );
}
