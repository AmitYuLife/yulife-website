import { Specimen } from "../Specimen";
import { appScreenSpecs } from "../registry";

/**
 * Deliberately NOT wrapped in ReducedMotionHarness: these screens are live,
 * looping canvases — the whole point is to review their ambient motion. The
 * screens themselves honour a real prefers-reduced-motion by settling to the
 * static design frame.
 */
export default function AppScreensPage() {
  return (
    <div className="mx-auto max-w-[1680px] px-32 py-40">
      <header className="mb-32">
        <h1 className="type-heading-h3 text-default">App</h1>
        <p className="type-body-md mt-12 max-w-[70ch] text-emphasis">
          Fake live app screens destined for the device mock-ups in page
          heroes: interactive, animated canvases built at a native 375×812 and
          scaled by <code>AppScreenFrame</code>. Unlike the other tabs these
          run their loops for real — no reduced-motion harness. The header of
          each frame links to its source.
        </p>
      </header>

      <div className="flex flex-col gap-section-gap">
        {appScreenSpecs.map((spec) => (
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
