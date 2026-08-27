import { Specimen } from "../Specimen";
import { componentSpecs } from "../registry";

export default function ComponentsPage() {
  return (
    <div className="mx-auto max-w-[1216px] px-32 py-40">
      <header className="mb-32">
        <h1 className="type-heading-h3 text-default">Components</h1>
        <p className="type-body-md mt-12 max-w-[70ch] text-emphasis">
          Reusable UI primitives and shared section blocks, each rendered in
          isolation from sample props. The header of each frame links to the
          component&apos;s source.
        </p>
      </header>

      <div className="flex flex-col gap-section-gap">
        {componentSpecs.map((spec) => (
          <Specimen
            key={spec.name}
            name={spec.name}
            source={spec.source}
            note={spec.note}
            tone={spec.tone}
            padded={spec.padded}
          >
            {spec.render()}
          </Specimen>
        ))}
      </div>
    </div>
  );
}
