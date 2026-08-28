"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { domSrc } from "@/lib/domSrc";
import { APP_PALETTE } from "./palette";
import { SCREEN_W, SCREEN_H } from "./AppScreenFrame";
import PhoneMockup from "./PhoneMockup";
import useLoopPause from "./useLoopPause";
import StatusBar from "./StatusBar";
import UnderwaterScene from "./UnderwaterScene";
import StatsCard from "./StatsCard";
import SpinningCoin3D from "./SpinningCoin3D";
import { YuLogoSquare } from "./icons";

gsap.registerPlugin(useGSAP);

export interface ChallengeSuccessProps {
  totalSteps?: number;
  personalBest?: number;
  coinAmount?: number;
  /** Fires on the collect button click — the YuCoin fountain binds here later. */
  onCollect?: () => void;
}

/**
 * Fake live app screen: the step-challenge success view inside the design
 * system's iPhone mock-up (size the mock-up by its container width). The
 * static DOM is authored at the exact Figma positions, so reduced motion
 * shows the design frame untouched; the motion branch layers ambient life on
 * top — swimming clownfish with flapping fins, translucent jellyfish drifting
 * from bottom-right to top-left, a randomized bubble spawner, swaying coral
 * and seaweed, and the slowly spinning illustrated 3D YuCoin. All loops pause
 * offscreen.
 */
export default function ChallengeSuccess({
  totalSteps = 5264,
  personalBest = 17732,
  coinAmount = 200,
  onCollect,
}: ChallengeSuccessProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { loops, pausedRef } = useLoopPause(rootRef);
  const coinSpinBoostRef = useRef(1);
  const coinScaleBoostRef = useRef(1);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rand = gsap.utils.random;
        const track = <T extends gsap.core.Animation>(loop: T): T => {
          loops.push(loop);
          return loop;
        };
        const replace = (prev: gsap.core.Animation, next: gsap.core.Animation) => {
          const i = loops.indexOf(prev);
          if (i >= 0) loops.splice(i, 1, next);
          else loops.push(next);
        };

        // ── Clownfish traverse the screen right → left (they face left) ──
        gsap.utils.toArray<HTMLElement>("[data-cs-clownfish]").forEach((el, i) => {
          const homeX = el.offsetLeft;
          const swim = gsap.timeline({ repeat: -1, repeatDelay: rand(2, 6) });
          swim.fromTo(
            el,
            { x: SCREEN_W - homeX + 80 },
            { x: -(homeX + 44 + 80), duration: 17 + i * 5, ease: "none" },
          );
          swim.progress((0.32 + i * 0.45) % 1);
          track(swim);
          track(
            gsap.to(el, {
              y: 6,
              duration: 1.6 + i * 0.45,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            }),
          );
          track(
            gsap.to(el, {
              rotation: 2.5,
              duration: 2.2 + i * 0.5,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            }),
          );
        });

        // Fin flutter — quick oscillations sell the swimming motion.
        gsap.utils.toArray<Element>("[data-cs-fin-top]").forEach((el, i) => {
          track(
            gsap
              .fromTo(
                el,
                { rotation: -7 },
                {
                  rotation: 7,
                  transformOrigin: "50% 100%",
                  duration: 0.55 + i * 0.11,
                  ease: "sine.inOut",
                  yoyo: true,
                  repeat: -1,
                },
              )
              .progress(rand(0, 1)),
          );
        });
        gsap.utils.toArray<Element>("[data-cs-fin-bottom]").forEach((el, i) => {
          track(
            gsap
              .fromTo(
                el,
                { rotation: 7 },
                {
                  rotation: -7,
                  transformOrigin: "50% 0%",
                  duration: 0.62 + i * 0.09,
                  ease: "sine.inOut",
                  yoyo: true,
                  repeat: -1,
                },
              )
              .progress(rand(0, 1)),
          );
        });

        // ── Jellyfish: deep-background drift, bottom-right → top-left ──
        gsap.utils.toArray<HTMLElement>("[data-cs-jellyfish]").forEach((el, i) => {
          const homeX = el.offsetLeft;
          const homeY = el.offsetTop;
          const drift = gsap.timeline({ repeat: -1, repeatDelay: rand(2, 6) });
          drift.fromTo(
            el,
            { x: SCREEN_W - homeX + 40, y: SCREEN_H - homeY + 40 },
            {
              x: -(homeX + el.offsetWidth + 40),
              y: -(homeY + el.offsetHeight + 40),
              duration: 26 + i * 6,
              ease: "none",
            },
          );
          drift.progress((0.18 + i * 0.34) % 1);
          track(drift);
          track(
            gsap.to(el.firstElementChild, {
              scale: 1.06,
              transformOrigin: "50% 0%",
              duration: 1.4 + i * 0.25,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            }),
          );
          // Subtle tentacle sway, hinged where they meet the bell.
          const tentacles = el.querySelector("[data-cs-tentacles]");
          if (tentacles) {
            track(
              gsap
                .fromTo(
                  tentacles,
                  { rotation: -3.5 },
                  {
                    rotation: 3.5,
                    transformOrigin: "30% 0%",
                    duration: 2.6 + i * 0.5,
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: -1,
                  },
                )
                .progress(rand(0, 1)),
            );
          }
        });

        // ── Bubbles: hide the static design ones, run a pooled spawner ──
        gsap.to("[data-cs-bubble-static]", { opacity: 0, duration: 1.2 });
        const spawn = (el: HTMLElement, prev?: gsap.core.Animation, initial = false) => {
          const duration = rand(4.5, 9);
          const tl = gsap.timeline({
            delay: initial ? rand(0, 6) : rand(0.2, 2.5),
            onComplete: () => {
              if (!pausedRef.current) spawn(el, tl);
            },
          });
          tl.set(el, { x: rand(16, 340), y: 0, scale: rand(0.5, 1.1), opacity: 0 });
          tl.to(el, { y: -rand(420, 740), x: `+=${rand(-18, 18)}`, duration, ease: "none" }, 0);
          tl.to(el, { opacity: 0.75, duration: duration * 0.2, ease: "none" }, 0);
          tl.to(el, { opacity: 0, duration: duration * 0.25, ease: "none" }, duration * 0.75);
          if (prev) replace(prev, tl);
          else track(tl);
        };
        gsap.utils
          .toArray<HTMLElement>("[data-cs-bubble-pool]")
          .forEach((el) => spawn(el, undefined, true));

        // ── Coral and seaweed sway independently around their base ──
        (
          [
            ["[data-cs-coral-back]", 4.8, 4],
            ["[data-cs-coral]", 5.6, 3],
            ["[data-cs-seaweed]", 3.9, 5],
          ] as const
        ).forEach(([selector, duration, degrees]) => {
          const sway = gsap.fromTo(
            selector,
            { rotation: -degrees / 2 },
            {
              rotation: degrees / 2,
              transformOrigin: "50% 100%",
              duration,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            },
          );
          sway.progress(rand(0, 1));
          track(sway);
        });
        track(
          gsap.fromTo(
            "[data-cs-wave]",
            { x: -8 },
            { x: 8, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1 },
          ).progress(rand(0, 1)),
        );

        // Respawned bubble timelines are created outside this callback, so the
        // matchMedia context can't revert them — kill everything explicitly.
        return () => {
          for (const loop of loops) loop.kill();
          loops.length = 0;
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <PhoneMockup>
      <div
        {...domSrc("ChallengeSuccess")}
        ref={rootRef}
        className="relative overflow-hidden"
        style={{
          width: SCREEN_W,
          height: SCREEN_H,
          backgroundColor: APP_PALETTE.screenBase,
          ["--app-ocean-top" as string]: APP_PALETTE.oceanTop,
          ["--app-ocean-bottom" as string]: APP_PALETTE.oceanBottom,
          ["--app-glass" as string]: APP_PALETTE.glass,
          ["--app-glass-border" as string]: APP_PALETTE.glassBorder,
          ["--app-cta" as string]: APP_PALETTE.cta,
          ["--app-cta-edge" as string]: APP_PALETTE.ctaEdge,
          ["--app-cta-pressed" as string]: APP_PALETTE.ctaPressed,
          ["--app-text-on-dark" as string]: APP_PALETTE.textOnDark,
          ["--app-status-ink" as string]: APP_PALETTE.statusInk,
        }}
      >
        <UnderwaterScene />

        <div className="relative flex h-full w-full flex-col items-center gap-[40px]">
          <div className="relative h-[76px] w-full shrink-0">
            <StatusBar />
            <YuLogoSquare className="absolute left-1/2 top-[52px] size-[24px] -translate-x-1/2" />
          </div>
          <SpinningCoin3D
            className="h-[160px] w-[152px] shrink-0"
            spinBoostRef={coinSpinBoostRef}
            scaleBoostRef={coinScaleBoostRef}
          />
          <StatsCard
            totalSteps={totalSteps}
            personalBest={personalBest}
            coinAmount={coinAmount}
            onCollect={onCollect}
            coinSpinBoostRef={coinSpinBoostRef}
            coinScaleBoostRef={coinScaleBoostRef}
          />
        </div>
      </div>
    </PhoneMockup>
  );
}
