// url=https://www.figma.com/design/PZs2ZaR8I3fShBqvAZxC7U/YuLife-Website---Design-System?node-id=2449-13005
// source=src/components/ui/StatFlipCard.tsx
// component=StatFlipCard
//
// The Figma component set exposes a single property, `Reverse` (Off = front
// face, On = flipped back face), which maps to the code prop `isOpen`. The
// number / label / note / source shown in Figma are illustrative static layers,
// not component properties — in code that content is data-driven via the `stat`
// prop, so the snippet references a caller-supplied `stat` object rather than
// hard-coding text.
import figma from "figma";

const instance = figma.selectedInstance;

const isOpen = instance.getEnum("Reverse", {
  Off: "false",
  On: "true",
});

export default {
  example: figma.tsx`{/* The single card inside StatCardFan. Normally you render @/components/blocks/StatCardFan, which owns the fan layout plus the open / hover / flip orchestration (onToggle, onHover, activeIndex, angle, layout); reuse StatFlipCard directly only for a bespoke layout. Content comes from the data-driven \`stat\` prop — never hand-write the number/label or the flip/tilt markup, and keep the design-token classes. \`Reverse\` maps to \`isOpen\` (On = the flipped back face). */}
<StatFlipCard
  stat={stat}
  index={0}
  isOpen={${isOpen}}
  isHovered={false}
  onToggle={onToggle}
  onHover={onHover}
  activeIndex={null}
  angle={0}
  layout="stack"
/>`,
  imports: ['import StatFlipCard from "@/components/ui/StatFlipCard"'],
  id: "stat-flip-card",
  metadata: { nestable: true },
};
