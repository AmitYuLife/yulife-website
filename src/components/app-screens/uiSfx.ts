import { assetPath } from "@/lib/assetPath";

/**
 * UI sound player for the ChallengeSuccess app screen. Plays two small static
 * MP3s (originally from uisfx.com's `minimal` pack, CC0) via the Web Audio
 * API. Deliberately file-based rather than uisfx's runtime synthesis: we only
 * ever need these two fixed cues, so shipping ~8KB of audio that lazy-loads on
 * first interaction beats bundling the ~12KB-gzip synthesis engine into the
 * homepage's critical JS.
 *
 * Cues:
 *  - `long-press` — the hold-to-collect button press.
 *  - `reward`     — the coin landing in the YuCoinCounter.
 *
 * Nothing here runs at page load: the AudioContext is created, and the files
 * fetched/decoded, only on the first `playCue` call — which is always the
 * button's press-down, i.e. a user gesture, so the context is allowed to start.
 */

type Cue = "long-press" | "reward";

const SOUND_URLS: Record<Cue, string> = {
  "long-press": assetPath("/app-screens/challenge-success/long-press.mp3"),
  reward: assetPath("/app-screens/challenge-success/reward.mp3"),
};
const MASTER_VOLUME = 0.6;

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let warmed = false;
const buffers = new Map<Cue, AudioBuffer>();
const loading = new Map<Cue, Promise<AudioBuffer | null>>();

/** Client-only, lazily constructed — never touch the AudioContext during SSR. */
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = MASTER_VOLUME;
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

/** Fetch + decode a cue once; subsequent calls reuse the cached buffer. */
function loadBuffer(cue: Cue): Promise<AudioBuffer | null> {
  const context = getCtx();
  if (!context) return Promise.resolve(null);
  const cached = buffers.get(cue);
  if (cached) return Promise.resolve(cached);
  let pending = loading.get(cue);
  if (!pending) {
    pending = fetch(SOUND_URLS[cue])
      .then((r) => r.arrayBuffer())
      .then((data) => context.decodeAudioData(data))
      .then((buf) => {
        buffers.set(cue, buf);
        return buf;
      })
      .catch(() => null);
    loading.set(cue, pending);
  }
  return pending;
}

function playBuffer(context: AudioContext, buffer: AudioBuffer) {
  const src = context.createBufferSource();
  src.buffer = buffer;
  src.connect(masterGain ?? context.destination);
  src.start();
}

/**
 * Play a cue. Must first be reached from a user gesture (the collect button's
 * press-down) so the browser lets the AudioContext start — that press always
 * precedes the later reward chime, so by then the context is already running.
 */
export function playCue(cue: Cue) {
  const context = getCtx();
  if (!context) return;
  if (context.state === "suspended") void context.resume();
  // On the first gesture, warm both cues so the reward chime that follows is
  // already decoded and latency-free when it fires.
  if (!warmed) {
    warmed = true;
    void loadBuffer("long-press");
    void loadBuffer("reward");
  }
  const cached = buffers.get(cue);
  if (cached) {
    playBuffer(context, cached);
    return;
  }
  void loadBuffer(cue).then((buf) => {
    if (buf) playBuffer(context, buf);
  });
}
