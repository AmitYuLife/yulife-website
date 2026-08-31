import { createUISFX, type UISFXPlayer, type PlayOptions } from "uisfx";

/**
 * Shared UI sound player for the ChallengeSuccess app screen, backed by
 * uisfx (https://uisfx.com) — sounds are synthesised at runtime from
 * deterministic recipes, so nothing is fetched and no audio files ship. One
 * lazily-created singleton is shared across the screen so the button press
 * and the reward chime speak with the same voice (the `minimal` pack).
 *
 * Cues in use:
 *  - `long-press` (Input / Long Press) — the hold-to-collect button press.
 *  - `reward`     (Reward / Reward)    — the coin landing in the YuCoinCounter.
 */

const PACK = "minimal" as const;
const MASTER_VOLUME = 0.6;

let player: UISFXPlayer | null = null;
let unlocked = false;

/** Client-only, lazily constructed — never touch the AudioContext during SSR. */
function getPlayer(): UISFXPlayer | null {
  if (typeof window === "undefined") return null;
  if (!player) {
    player = createUISFX({ pack: PACK, volume: MASTER_VOLUME });
  }
  return player;
}

/**
 * Play a semantic cue. Must be reachable from a user gesture on first call so
 * the browser lets the AudioContext start — the collect button's press-down is
 * that gesture, and it always precedes the later reward chime, so by the time
 * `reward` fires the context is already unlocked.
 */
export function playCue(cue: "long-press" | "reward", options?: PlayOptions) {
  const p = getPlayer();
  if (!p) return;
  // unlock() resumes the AudioContext; fire it once, don't await (awaiting
  // would push play() out of the synchronous gesture handler).
  if (!unlocked) {
    unlocked = true;
    void p.unlock();
  }
  p.play(cue, options);
}
