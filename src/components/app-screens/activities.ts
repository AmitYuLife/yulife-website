import type { ComponentType } from "react";
import { ShoeIcon, MeditationIcon, CyclingIcon, SelfReflectionIcon } from "./icons";

export interface ChallengeActivity {
  key: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

/**
 * The four-step activity loop shown on the ChallengeSuccess screen (Figma
 * node 2580:12124). Steps is always first — `ChallengeSuccessStage` resets
 * the YuCoin counter to zero whenever *it* is the one being collected, which
 * is what starts a fresh lap of the loop rather than growing forever.
 */
export function buildActivities(totalSteps: number): ChallengeActivity[] {
  return [
    {
      key: "steps",
      icon: ShoeIcon,
      label: "Total steps",
      value: totalSteps.toLocaleString("en-GB"),
    },
    {
      key: "meditation",
      icon: MeditationIcon,
      label: "Meditation minutes",
      value: "24",
    },
    {
      key: "cycling",
      icon: CyclingIcon,
      label: "Cycling distance",
      value: "15.3km",
    },
    {
      key: "self-reflection",
      icon: SelfReflectionIcon,
      label: "Self-reflection",
      value: "Complete",
    },
  ];
}
