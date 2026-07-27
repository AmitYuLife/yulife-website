/**
 * Dev-only DOM source stamps.
 *
 * Spread onto a block root to tag it with the component that owns it:
 *
 *   <section {...domSrc("TrustedSection")} className="...">
 *
 * The rendered attribute lets us resolve "the thing on screen" back to a file
 * without dumping the accessibility tree — see docs/CODE_MAP.md §3 and the
 * `/find` skill. Names are component names only, never line numbers, so they
 * survive edits.
 *
 * `NODE_ENV` is inlined at build time, so in a production build every call
 * folds to `{}` and the attributes are dropped from the static export. Set
 * `NEXT_PUBLIC_DOM_SRC=true` to keep them in a production build (useful when
 * inspecting a deployed staging URL).
 */
const ENABLED =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_DOM_SRC === "true";

type DomSrcAttrs = {
  "data-src"?: string;
  "data-block-label"?: string;
};

export function domSrc(name: string, label?: string): DomSrcAttrs {
  if (!ENABLED) return {};
  return label ? { "data-src": name, "data-block-label": label } : { "data-src": name };
}
