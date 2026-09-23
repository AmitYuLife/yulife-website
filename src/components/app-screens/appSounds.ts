import { assetPath } from "@/lib/assetPath";

/**
 * UI sound player for the ChallengeSuccess app screen. Plays two small static
 * MP3s bundled in /public via the Web Audio API, both from Kenney's Interface
 * Sounds pack (CC0), converted from OGG so every browser, Safari included,
 * can decode them.
 *
 * Cues:
 *  - `press`   — the hold-to-collect button press (`toggle_001`).
 *  - `collect` — the coin landing in the YuCoinCounter (`confirmation_002`).
 *
 * Nothing here runs at page load: the AudioContext is created, and the files
 * fetched/decoded, only on the first `playCue` call — which is always the
 * button's press-down, i.e. a user gesture, so the context is allowed to start.
 */

type Cue = "press" | "collect";

const SOUND_URLS: Record<Cue, string> = {
  press: assetPath("/app-screens/challenge-success/button-press.mp3"),
  collect: assetPath("/app-screens/challenge-success/yucoin-collect.mp3"),
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
 * precedes the later collect chime, so by then the context is already running.
 */
export function playCue(cue: Cue) {
  const context = getCtx();
  if (!context) return;
  if (context.state === "suspended") void context.resume();
  // On the first gesture, warm both cues so the collect chime that follows is
  // already decoded and latency-free when it fires.
  if (!warmed) {
    warmed = true;
    void loadBuffer("press");
    void loadBuffer("collect");
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
