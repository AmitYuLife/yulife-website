import { Specimen } from "../Specimen";
import ReducedMotionHarness from "../ReducedMotionHarness";
import { blockSpecs } from "../registry";

export default function BlocksPage() {
  return (
    <div className="mx-auto max-w-[1680px] px-32 py-40">
      <header className="mb-32">
        <h1 className="type-heading-h3 text-default">Blocks</h1>
        <p className="type-body-md mt-12 max-w-[70ch] text-emphasis">
          Self-contained composites that assemble components (and their own
          animation) into a reusable unit. Scroll-reveal, GSAP and 3D (R3F)
          blocks are shown in their resolved (reduced-motion) state via a
          workbench harness — entrance animations settle to their end state;
          hover and 3D still run. The header of each frame links to its source.
        </p>
      </header>

      <ReducedMotionHarness>
        <div className="flex flex-col gap-section-gap">
          {blockSpecs.map((spec) => (
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
