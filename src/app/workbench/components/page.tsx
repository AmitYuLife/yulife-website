import { Specimen } from "../Specimen";
import ReducedMotionHarness from "../ReducedMotionHarness";
import { componentSpecs } from "../registry";

export default function ComponentsPage() {
  return (
    <div className="mx-auto max-w-[1680px] px-32 py-40">
      <header className="mb-32">
        <h1 className="type-heading-h3 text-default">Components</h1>
        <p className="type-body-md mt-12 max-w-[70ch] text-emphasis">
          Reusable UI primitives, each rendered in isolation from sample props.
          The header of each frame links to the component&apos;s source.
        </p>
      </header>

      <ReducedMotionHarness>
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
      </ReducedMotionHarness>
    </div>
  );
}
