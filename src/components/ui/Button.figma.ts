// url=https://www.figma.com/design/PZs2ZaR8I3fShBqvAZxC7U/YuLife-Website-Refresh-2026?node-id=2000-67
// source=src/components/ui/Button.tsx
// component=Button
//
// MCP instructions for this CLI-managed mapping are embedded as a comment inside
// `example` below (the Figma "Add instructions for MCP" dialog is only available
// for UI-created mappings, not CLI/template ones — comments in the snippet are
// passed verbatim to the MCP server and read by the LLM as implementation context).
import figma from "figma";

const instance = figma.selectedInstance;

const label = instance.getString("Label");
const trailingIcon = instance.getBoolean("Trailing icon");
const size = instance.getEnum("Size", {
  SM: "sm",
  LG: "lg",
});
const variant = instance.getEnum("Style", {
  Solid: "solid",
  Outline: "outline",
});
const theme = instance.getEnum("Theme", {
  "On Dark": "onDark",
  "On Light": "onLight",
});

export default {
  example: figma.tsx`{/* Reuse @/components/ui/Button — never hand-write button markup or styles. Pass href for navigation CTAs (renders next/link) or onClick for actions (renders <button>). trailingIcon renders the chevron; keep design-token classes, no raw hex or Tailwind color literals. */}
<Button size="${size}" variant="${variant}" theme="${theme}"${trailingIcon ? " trailingIcon" : ""}>${label}</Button>`,
  imports: ['import { Button } from "@/components/ui/Button"'],
  id: "button",
  metadata: { nestable: true },
};
