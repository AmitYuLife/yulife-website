// url=https://www.figma.com/design/PZs2ZaR8I3fShBqvAZxC7U/YuLife-Website-Refresh-2026?node-id=2414-2575
// source=src/components/ui/Accordion.tsx
// component=AccordionItem
import figma from "figma";

const instance = figma.selectedInstance;

const question = instance.getString("Question");
const answer = instance.getString("Answer");
const divider = instance.getBoolean("Divider");

export default {
  example: figma.tsx`{/* Reuse @/components/ui/Accordion — never hand-write accordion row markup or styles. Nest AccordionItem elements as children of Accordion (see the Accordion mapping); it injects open/onToggle/ids and owns the single-open-at-a-time state, so only question/answer/showDivider are authored here. Reordering rows in Figma = reordering these elements in code. */}
<AccordionItem question="${question}" answer="${answer}"${divider ? " showDivider" : ""} />`,
  imports: ['import { AccordionItem } from "@/components/ui/Accordion"'],
  id: "accordion-item",
  metadata: { nestable: true },
};
