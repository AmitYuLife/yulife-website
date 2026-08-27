"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Returns "always" while the referenced element is on screen and "never"
 * once it scrolls out of view — feed it to <Canvas frameloop={...}> so the
 * render loop costs nothing when the scene isn't visible.
 */
export default function useVisibleFrameloop(
  ref: RefObject<Element | null>,
): "always" | "never" {
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      setFrameloop(entry.isIntersecting ? "always" : "never");
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return frameloop;
}
