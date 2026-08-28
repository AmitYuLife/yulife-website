import { assetPath } from "@/lib/assetPath";
import { Bubble } from "./icons";
import Clownfish from "./Clownfish";
import Jellyfish from "./Jellyfish";

const ASSETS = "/app-screens/challenge-success";

/**
 * The layered ocean behind the ChallengeSuccess content, authored at the exact
 * Figma positions — the static markup IS the design frame, and the reduced
 * motion state. The owning screen animates the `data-cs-*` hooks:
 * clownfish traverse, jellyfish rise, bubbles spawn/rise/fade, coral and
 * seaweed sway.
 */

/** Static design bubbles (x, y, size) — faded out when the live spawner runs. */
const DESIGN_BUBBLES: Array<[number, number, number]> = [
  [175.09, 266.0, 12.4],
  [234.56, 408.84, 12.4],
  [124.0, 358.5, 17.3],
  [151.95, 418.59, 17.3],
  [158.4, 326.02, 17.3],
];

/** Extra pooled bubbles the spawner recycles; idle at opacity 0. */
const POOL_SIZE = 8;

const JELLYFISH: Array<[number, number, number, number]> = [
  [299, 409, 105.54, 116.14],
  [337, 507, 64.62, 71.11],
  [343, 382, 64.62, 71.11],
];

const CLOWNFISH: Array<[number, number]> = [
  [277, 218],
  [349, 161],
];

export default function UnderwaterScene() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, var(--app-ocean-top), var(--app-ocean-bottom) 95.673%)",
      }}
    >
      {DESIGN_BUBBLES.map(([x, y, size], i) => (
        <div
          key={`design-${i}`}
          data-cs-bubble-static=""
          className="absolute"
          style={{ left: x, top: y, width: size, height: size }}
        >
          <Bubble />
        </div>
      ))}
      {Array.from({ length: POOL_SIZE }, (_, i) => (
        <div
          key={`pool-${i}`}
          data-cs-bubble-pool=""
          className="absolute left-0 top-[760px] size-[16px] opacity-0"
        >
          <Bubble />
        </div>
      ))}

      {/* Deep-background jellyfish: translucent per the design direction. */}
      {JELLYFISH.map(([x, y, w, h], i) => (
        <div
          key={i}
          data-cs-jellyfish=""
          className="absolute opacity-[0.24]"
          style={{ left: x, top: y, width: w, height: h }}
        >
          <Jellyfish className="size-full" />
        </div>
      ))}

      {/* Seabed strip — layers bottom→top per the design. */}
      <div className="absolute left-0 top-[471px] h-[341px] w-[375px]">
        <img
          data-cs-coral-back=""
          src={assetPath(`${ASSETS}/coral-back.svg`)}
          alt=""
          className="absolute"
          style={{ left: -8.15, top: 14.75, width: 141.42, height: 165.72, maxWidth: "none" }}
          width={141}
          height={166}
        />
        <img
          data-cs-coral=""
          src={assetPath(`${ASSETS}/coral.svg`)}
          alt=""
          className="absolute"
          style={{ left: 85.35, top: 14.02, width: 175.7, height: 134.11, maxWidth: "none" }}
          width={176}
          height={134}
        />
        <img
          data-cs-seaweed=""
          src={assetPath(`${ASSETS}/seaweed.svg`)}
          alt=""
          className="absolute object-contain object-bottom"
          style={{ left: 236.57, top: 42.84, width: 151.19, height: 195.13, maxWidth: "none" }}
          width={151}
          height={195}
        />
        <img
          src={assetPath(`${ASSETS}/sand-curve-base.svg`)}
          alt=""
          className="absolute"
          style={{ left: -145.86, top: 120.95, width: 563.17, height: 221.05, maxWidth: "none" }}
          width={563}
          height={221}
        />
        <img
          src={assetPath(`${ASSETS}/sand-hills.svg`)}
          alt=""
          className="absolute"
          style={{ left: 34.23, top: 180.99, width: 301.12, height: 69.49, maxWidth: "none" }}
          width={301}
          height={69}
        />
        <img
          data-cs-wave=""
          src={assetPath(`${ASSETS}/wave-back.svg`)}
          alt=""
          className="absolute"
          style={{ left: 56.32, top: 77.93, width: 364.94, height: 81.53, maxWidth: "none" }}
          width={365}
          height={82}
        />
        <img
          src={assetPath(`${ASSETS}/sand-curve-top.svg`)}
          alt=""
          className="absolute"
          style={{ left: -184.18, top: 110.07, width: 627.59, height: 105.66, maxWidth: "none" }}
          width={628}
          height={106}
        />
      </div>

      {CLOWNFISH.map(([x, y], i) => (
        <div key={i} data-cs-clownfish="" className="absolute h-[33px] w-[44px]" style={{ left: x, top: y }}>
          <Clownfish className="size-full" />
        </div>
      ))}
    </div>
  );
}
