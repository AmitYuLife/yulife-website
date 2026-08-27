import {
  fontFamilies,
  gapTokens,
  primitiveColorGroups,
  radiusScale,
  semanticColorGroups,
  spacingScale,
  typographyRoles,
  type Swatch,
  type SwatchGroup,
} from "../tokens";

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-24">
      <h2 className="type-heading-h4 text-default">{title}</h2>
      {subtitle && <p className="type-body-sm mt-8 text-emphasis">{subtitle}</p>}
    </div>
  );
}

function SwatchTile({ swatch }: { swatch: Swatch }) {
  return (
    <div className="overflow-hidden rounded-md border border-line">
      <div className="h-80 w-full" style={{ background: swatch.value }} />
      <div className="bg-surface px-12 py-8">
        <p className="type-body-sm text-default">{swatch.name}</p>
        <code className="type-caption text-emphasis">{swatch.value}</code>
      </div>
    </div>
  );
}

function SwatchBlock({ group }: { group: SwatchGroup }) {
  return (
    <div>
      <p className="type-label mb-12 text-default">
        {group.title} <code className="type-caption text-emphasis">{group.token}</code>
      </p>
      <div className="grid grid-cols-2 gap-controls sm:grid-cols-3 lg:grid-cols-5">
        {group.swatches.map((s) => (
          <SwatchTile key={s.token} swatch={s} />
        ))}
      </div>
    </div>
  );
}

export default function FoundationsPage() {
  return (
    <div className="mx-auto flex max-w-[1680px] flex-col gap-section-gap px-32 py-40">
      <header>
        <h1 className="type-heading-h3 text-default">Foundations</h1>
        <p className="type-body-md mt-12 max-w-[70ch] text-emphasis">
          Generated from <code>design-tokens/tokens.json</code> — the same source
          the site&apos;s CSS is built from. Change a token there and these
          galleries follow.
        </p>
      </header>

      {/* Colours */}
      <section>
        <SectionHeading
          title="Colour"
          subtitle="Primitives carry the only raw hex values; semantic tokens alias them 1:1 with Figma."
        />
        <div className="flex flex-col gap-flow">
          <div>
            <p className="type-body-sm mb-16 font-bold text-default">Primitives</p>
            <div className="flex flex-col gap-flow">
              {primitiveColorGroups.map((g) => (
                <SwatchBlock key={g.token} group={g} />
              ))}
            </div>
          </div>
          <div>
            <p className="type-body-sm mb-16 font-bold text-default">Semantic aliases</p>
            <div className="flex flex-col gap-flow">
              {semanticColorGroups.map((g) => (
                <SwatchBlock key={g.token} group={g} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section>
        <SectionHeading
          title="Typography"
          subtitle={`${fontFamilies.map((f) => `${f.value} (${f.name})`).join(" · ")}. Each specimen uses the live .type-* class; metadata shows the Desktop-XL base.`}
        />
        <div className="flex flex-col divide-y divide-line">
          {typographyRoles.map((role) => (
            <div key={role.role} className="flex flex-col gap-inline py-24">
              <p className={`${role.className} text-default`}>{role.role}</p>
              <code className="type-caption text-emphasis">
                .{role.className} · {role.family} {role.weight} · {role.size}/{role.lineHeight}
              </code>
            </div>
          ))}
        </div>
      </section>

      {/* Spacing */}
      <section>
        <SectionHeading title="Spacing" subtitle="Fixed pixel scale — p-16, gap-64, etc." />
        <div className="flex flex-col gap-inline">
          {spacingScale.map((s) => (
            <div key={s.name} className="flex items-center gap-flow">
              <code className="type-caption w-96 shrink-0 text-emphasis">
                {s.name} · {s.value}
              </code>
              <div className="h-16 bg-surface-inverse" style={{ width: s.value }} />
            </div>
          ))}
        </div>
      </section>

      {/* Radii */}
      <section>
        <SectionHeading title="Radius" subtitle="rounded-sm … rounded-2xl, rounded-full." />
        <div className="flex flex-wrap gap-flow">
          {radiusScale.map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-inline">
              <div
                className="h-80 w-80 border border-line bg-surface-accent-purple"
                style={{ borderRadius: r.value }}
              />
              <code className="type-caption text-emphasis">
                {r.name} · {r.value}
              </code>
            </div>
          ))}
        </div>
      </section>

      {/* Gaps */}
      <section>
        <SectionHeading
          title="Gap scale"
          subtitle="Responsive semantic gaps — the bars show the live gap at the current breakpoint."
        />
        <div className="flex flex-col gap-flow">
          {gapTokens.map((g) => (
            <div key={g.name} className="flex items-center gap-flow">
              <code className="type-caption w-120 shrink-0 text-emphasis">
                {g.utility}
              </code>
              <div className={`flex ${g.utility}`}>
                <div className="h-24 w-24 bg-surface-inverse" />
                <div className="h-24 w-24 bg-surface-inverse" />
              </div>
              <code className="type-caption text-emphasis">{g.cssVar}</code>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
