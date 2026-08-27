"use client";

import { useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { useGSAP } from "@gsap/react";
import { assetPath } from "@/lib/assetPath";

gsap.registerPlugin(Draggable, Physics2DPlugin, useGSAP);

const PRESS_SCALE = 0.9;
const MAX_PULL = 200;
const MIN_PULL = 18;
const REST_OPACITY = 0.64;
const GRAVITY = 620;
const MIN_VELOCITY = 200;
const MAX_VELOCITY = 780;
const TRAJECTORY_STEP = 0.055;
const TRAJECTORY_STEPS = 32;
const ROCKET_NOSE_OFFSET = 90;

type Point = { x: number; y: number };

function rocketRotationFromVelocity(vx: number, vy: number) {
  return (Math.atan2(vy, vx) * 180) / Math.PI + ROCKET_NOSE_OFFSET;
}

function getAnchorPoint(section: HTMLElement, wrap: HTMLElement): Point {
  const sectionRect = section.getBoundingClientRect();
  const wrapRect = wrap.getBoundingClientRect();

  return {
    x: wrapRect.left + wrapRect.width * 0.5 - sectionRect.left,
    y: wrapRect.top + wrapRect.height * 0.85 - sectionRect.top,
  };
}

function getDragAnchor(section: HTMLElement, dragEl: HTMLElement): Point {
  const sectionRect = section.getBoundingClientRect();
  const dragRect = dragEl.getBoundingClientRect();

  return {
    x: dragRect.left + dragRect.width * 0.5 - sectionRect.left,
    y: dragRect.top + dragRect.height * 0.85 - sectionRect.top,
  };
}

function getLaunchMetrics(pullX: number, pullY: number, pullDist: number) {
  const power = Math.min(pullDist / MAX_PULL, 1);
  const velocity = MIN_VELOCITY + power * (MAX_VELOCITY - MIN_VELOCITY);
  const angleDeg = (Math.atan2(-pullY, -pullX) * 180) / Math.PI;
  const angleRad = (angleDeg * Math.PI) / 180;

  return {
    power,
    velocity,
    angleDeg,
    vx: velocity * Math.cos(angleRad),
    vy: velocity * Math.sin(angleRad),
  };
}

function buildTrajectoryPath(
  origin: Point,
  vx: number,
  vy: number,
  bounds: { width: number; height: number },
) {
  const points: string[] = [`M ${origin.x} ${origin.y}`];

  for (let i = 1; i <= TRAJECTORY_STEPS; i += 1) {
    const t = i * TRAJECTORY_STEP;
    const x = origin.x + vx * t;
    const y = origin.y + vy * t + 0.5 * GRAVITY * t * t;

    if (
      x < -120 ||
      x > bounds.width + 120 ||
      y < -120 ||
      y > bounds.height + 120
    ) {
      break;
    }

    points.push(`L ${x} ${y}`);
  }

  return points.join(" ");
}

export default function FinalCtaRocket() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const pullLineRef = useRef<SVGPathElement>(null);
  const arcRef = useRef<SVGPathElement>(null);
  const floatTweenRef = useRef<gsap.core.Tween | null>(null);
  const launchTweenRef = useRef<gsap.core.Timeline | null>(null);
  const draggableRef = useRef<Draggable | null>(null);
  const restRotationRef = useRef(0);
  const isLaunchingRef = useRef(false);
  const anchorRef = useRef<Point>({ x: 0, y: 0 });
  const lastLaunchMetricsRef = useRef({ power: 0, vx: 0, vy: 0, angleDeg: 0 });

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const floatEl = floatRef.current;
      const dragEl = dragRef.current;
      const pullLine = pullLineRef.current;
      const arc = arcRef.current;
      const section = wrap?.closest("section");

      if (!wrap || !floatEl || !dragEl || !section || !pullLine || !arc) return;

      gsap.set(dragEl, {
        transformOrigin: "50% 85%",
        x: 0,
        y: 0,
        rotation: 0,
        force3D: true,
      });
      gsap.set([pullLine, arc], { autoAlpha: 0 });

      const captureAnchor = () => {
        gsap.set(floatEl, { y: 0 });
        anchorRef.current = getAnchorPoint(section, wrap);
      };

      captureAnchor();

      const hideTrajectory = () => {
        gsap.to([pullLine, arc], { autoAlpha: 0, duration: 0.12, overwrite: "auto" });
      };

      const updateTrajectory = (pullX: number, pullY: number, pullDist: number) => {
        const anchor = anchorRef.current;
        const dragAnchor = getDragAnchor(section, dragEl);
        const bounds = section.getBoundingClientRect();
        const metrics = getLaunchMetrics(pullX, pullY, pullDist);

        pullLine.setAttribute(
          "d",
          `M ${anchor.x} ${anchor.y} L ${dragAnchor.x} ${dragAnchor.y}`,
        );
        arc.setAttribute(
          "d",
          buildTrajectoryPath(anchor, metrics.vx, metrics.vy, bounds),
        );

        gsap.set([pullLine, arc], { autoAlpha: 1 });
      };

      const startIdleFloat = () => {
        floatTweenRef.current?.kill();
        floatTweenRef.current = gsap.to(floatEl, {
          y: -16,
          duration: 1.75,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      };

      const pauseIdleFloat = () => {
        floatTweenRef.current?.pause();
      };

      const resumeIdleFloat = () => {
        if (!floatTweenRef.current) {
          startIdleFloat();
          return;
        }
        gsap.set(floatEl, { y: 0 });
        floatTweenRef.current.restart();
      };

      const resetDragState = () => {
        hideTrajectory();
        gsap.to(dragEl, {
          x: 0,
          y: 0,
          scale: 1,
          rotation: restRotationRef.current,
          duration: 0.55,
          ease: "elastic.out(1, 0.55)",
          overwrite: "auto",
        });
        resumeIdleFloat();
      };

      const finishInteraction = () => {
        isLaunchingRef.current = false;
        draggableRef.current?.enable();
        resumeIdleFloat();
      };

      const returnFromSouthWest = () => {
        const { power } = lastLaunchMetricsRef.current;
        const startX = -280 - power * 120;
        const startY = 240 + power * 60;

        gsap.set(dragEl, {
          x: startX,
          y: startY,
          rotation: restRotationRef.current - 40,
          autoAlpha: 0,
        });

        launchTweenRef.current = gsap
          .timeline({ onComplete: finishInteraction })
          .to(dragEl, { autoAlpha: REST_OPACITY, duration: 0.2, ease: "power1.out" })
          .to(
            dragEl,
            {
              x: startX * 0.4,
              y: startY * 0.45,
              rotation: restRotationRef.current - 18,
              duration: 0.55,
              ease: "sine.out",
            },
            0.05,
          )
          .to(
            dragEl,
            {
              x: 0,
              y: 0,
              rotation: restRotationRef.current,
              duration: 0.95,
              ease: "power3.out",
            },
            0.35,
          )
          .fromTo(
            dragEl,
            { scale: 0.92 },
            { scale: 1, duration: 0.55, ease: "elastic.out(1, 0.55)" },
            0.75,
          );
      };

      const launch = () => {
        if (isLaunchingRef.current) return;

        const pullX = gsap.getProperty(dragEl, "x") as number;
        const pullY = gsap.getProperty(dragEl, "y") as number;
        const pullDist = Math.hypot(pullX, pullY);

        if (pullDist < MIN_PULL) {
          resetDragState();
          return;
        }

        const metrics = getLaunchMetrics(pullX, pullY, pullDist);
        lastLaunchMetricsRef.current = metrics;

        isLaunchingRef.current = true;
        draggableRef.current?.disable();
        pauseIdleFloat();
        launchTweenRef.current?.kill();
        hideTrajectory();

        gsap.set(dragEl, { x: 0, y: 0, scale: 1 });

        let flightDone = false;
        const finishFlight = () => {
          if (flightDone) return;
          flightDone = true;
          launchTweenRef.current?.kill();
          returnFromSouthWest();
        };

        const flightTween = gsap.to(dragEl, {
          duration: 2.4 + metrics.power * 0.8,
          physics2D: {
            velocity: metrics.velocity,
            angle: metrics.angleDeg,
            gravity: GRAVITY,
          },
          onUpdate: function onFlightUpdate() {
            const t = this.time();
            const vx = metrics.vx;
            const vy = metrics.vy + GRAVITY * t;

            gsap.set(dragEl, {
              rotation: rocketRotationFromVelocity(vx, vy),
            });

            const x = gsap.getProperty(dragEl, "x") as number;
            const y = gsap.getProperty(dragEl, "y") as number;

            if (Math.abs(x) > 1100 || y > 900 || y < -500) {
              finishFlight();
            }
          },
          onComplete: finishFlight,
          onInterrupt: finishFlight,
        });

        launchTweenRef.current = gsap.timeline().add(flightTween);
      };

      const onDrag = function onDrag(this: Draggable) {
        const dx = this.x;
        const dy = this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > MAX_PULL) {
          const angle = Math.atan2(dy, dx);
          gsap.set(dragEl, {
            x: Math.cos(angle) * MAX_PULL,
            y: Math.sin(angle) * MAX_PULL,
          });
          this.update();
        }

        const pullX = gsap.getProperty(dragEl, "x") as number;
        const pullY = gsap.getProperty(dragEl, "y") as number;
        const pullDist = Math.hypot(pullX, pullY);
        const metrics = getLaunchMetrics(pullX, pullY, pullDist);

        gsap.set(dragEl, {
          rotation: rocketRotationFromVelocity(metrics.vx, metrics.vy),
        });
        updateTrajectory(pullX, pullY, pullDist);
      };

      const mm = gsap.matchMedia();

      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          desktop: "(min-width: 1280px)",
        },
        (context) => {
          const { reduce, desktop } = context.conditions as {
            reduce?: boolean;
            desktop?: boolean;
          };

          restRotationRef.current = desktop ? 15 : 0;
          gsap.set(dragEl, {
            rotation: restRotationRef.current,
            autoAlpha: REST_OPACITY,
          });
          captureAnchor();

          if (reduce) return;

          startIdleFloat();

          const [draggable] = Draggable.create(dragEl, {
            type: "x,y",
            cursor: "grab",
            activeCursor: "grabbing",
            allowNativeTouchScrolling: false,
            minimumMovement: 0,
            onPress() {
              if (isLaunchingRef.current) return;

              captureAnchor();
              launchTweenRef.current?.kill();
              pauseIdleFloat();
              gsap.to(dragEl, {
                scale: PRESS_SCALE,
                duration: 0.12,
                ease: "power2.out",
                overwrite: "auto",
              });
            },
            onDrag,
            onRelease: launch,
          });

          draggableRef.current = draggable;

          const onResize = () => captureAnchor();
          window.addEventListener("resize", onResize);

          return () => {
            window.removeEventListener("resize", onResize);
            draggable.kill();
            draggableRef.current = null;
          };
        },
      );

      return () => {
        floatTweenRef.current?.kill();
        launchTweenRef.current?.kill();
        mm.revert();
      };
    },
    { scope: wrapRef },
  );

  return (
    <>
      <svg
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <path
          ref={pullLineRef}
          fill="none"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="2"
          strokeDasharray="6 8"
          strokeLinecap="round"
        />
        <path
          ref={arcRef}
          fill="none"
          stroke="rgba(255, 255, 255, 0.72)"
          strokeWidth="2.5"
          strokeDasharray="4 10"
          strokeLinecap="round"
        />
      </svg>

      <div
        ref={wrapRef}
        data-reveal
        className="final-cta-rocket-wrap relative z-[3] mx-auto mb-24 h-[200px] w-[200px] shrink-0 tablet:mb-32 tablet:h-[280px] tablet:w-[280px] desktop:absolute desktop:bottom-[48px] desktop:left-[max(-48px,calc(50%-620px))] desktop:top-auto desktop:mx-0 desktop:mb-0 desktop:h-[420px] desktop:w-[418px]"
      >
        <div ref={floatRef} className="size-full">
          <div
            ref={dragRef}
            className="final-cta-rocket-drag size-full touch-none select-none will-change-transform"
            aria-label="Drag the rocket to launch"
            role="img"
          >
            <img
              src={assetPath("/home/rocket.png")}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="pointer-events-none size-full"
            />
          </div>
        </div>
      </div>
    </>
  );
}
