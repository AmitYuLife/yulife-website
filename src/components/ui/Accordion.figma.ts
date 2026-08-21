// url=https://www.figma.com/design/PZs2ZaR8I3fShBqvAZxC7U/YuLife-Website-Refresh-2026?node-id=2421-2469
// source=src/components/ui/Accordion.tsx
// component=Accordion
//
// Figma can't add a Slot property via the Plugin API (only BOOLEAN/TEXT/
// INSTANCE_SWAP/VARIANT are creatable that way), so a *placed instance* of
// this component has its row count/order locked — no add/remove/reorder,
// in the API or the canvas. Only the master "Accordion" component (in the
// design-system page) supports editing its rows freely. In code there's no
// such limit: reorder, add, or remove by rearranging the AccordionItem
// children below.
import figma from "figma";

const instance = figma.selectedInstance;
const rows = instance.findLayers((n) => n.type === "INSTANCE");
const row1 = rows[0]?.executeTemplate().example;
const row2 = rows[1]?.executeTemplate().example;
const row3 = rows[2]?.executeTemplate().example;

export default {
  example: figma.tsx`{/* Reuse @/components/ui/Accordion — never hand-write the rounded/bordered wrapper or its single-open-at-a-time state. */}
<Accordion>
${row1}
${row2}
${row3}
</Accordion>`,
  imports: ['import Accordion from "@/components/ui/Accordion"'],
  id: "accordion",
  metadata: { nestable: true },
};
