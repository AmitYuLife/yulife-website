import { sources } from "@/data/home-content";

export default function Sources() {
  return (
    <section
      id="sources"
      className="border-t"
      style={{
        backgroundColor: "var(--purple-900)",
        borderColor: "color-mix(in srgb, var(--purple-700) 40%, transparent)",
      }}
      aria-labelledby="sources-heading"
    >
      <div className="page-container py-40">
        <h2
          id="sources-heading"
          className="type-eyebrow uppercase tracking-[0.16em]"
          style={{ color: "color-mix(in srgb, var(--neutral-white) 45%, transparent)" }}
        >
          Sources
        </h2>
        <ol className="mt-16 space-y-8">
          {sources.map((source) => (
            <li
              key={source.marker}
              className="type-body-sm"
              style={{ color: "color-mix(in srgb, var(--neutral-white) 60%, transparent)" }}
            >
              <sup className="mr-4 font-semibold" style={{ color: "var(--purple-500)" }}>
                {source.marker === 1 ? "¹" : "²"}
              </sup>
              {source.text}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
