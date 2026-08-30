/**
 * Pre-hydration guard for the hero intro on the static export.
 *
 * The exported HTML ships the hero fully visible (right for crawlers and
 * no-JS), but on a slow connection that means users see the finished hero,
 * then hydration snaps it to opacity 0 and replays the intro. This inline
 * script runs parser-blocking at the top of <body> — before the hero paints —
 * and adds `js-intro` to <html> so the CSS in globals.css hides the intro
 * targets from the very first frame. Motion users only: under
 * prefers-reduced-motion the class is never added and the hero paints
 * settled. Hero.tsx removes the class once GSAP's own pre-states are in
 * place; if the bundle never hydrates, the CSS failsafe fades everything in
 * at ~3.5s.
 */
export default function IntroFlashGuard() {
  const guard = `try{if(matchMedia("(prefers-reduced-motion: no-preference)").matches)document.documentElement.classList.add("js-intro")}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: guard }} />;
}
