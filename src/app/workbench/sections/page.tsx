import { Specimen } from "../Specimen";
import ReducedMotionHarness from "../ReducedMotionHarness";
import { sectionSpecs } from "../registry";

export default function SectionsPage() {
  return (
    <div className="mx-auto max-w-[1680px] px-32 py-40">
      <header className="mb-32">
        <h1 className="type-heading-h3 text-default">Sections</h1>
        <p className="type-body-md mt-12 max-w-[70ch] text-emphasis">
          Reusable page sections, each rendered full-bleed from sample props.
          Scroll-reveal, GSAP and 3D (R3F) sections are shown in their resolved
          (reduced-motion) state via a workbench harness — entrance animations
          settle to their end state; hover and 3D still run.
        </p>
      </header>

      <ReducedMotionHarness>
        <div className="flex flex-col gap-section-gap">
          {sectionSpecs.map((spec) => (
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
