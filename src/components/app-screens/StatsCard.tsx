import type { ReactNode, RefObject } from "react";
import { ShoeIcon, TrophyIcon } from "./icons";
import CollectButton from "./CollectButton";

function StatRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex w-full items-start gap-[8px]">
      {icon}
      <p className="min-w-px flex-1 font-bold text-[16px] leading-[24px]">{label}</p>
      <p className="font-bold text-[16px] leading-[24px]">{value}</p>
    </div>
  );
}

/** Glass card over the ocean: challenge stats + the collect CTA. */
export default function StatsCard({
  totalSteps,
  personalBest,
  coinAmount,
  onCollect,
  coinSpinBoostRef,
  coinScaleBoostRef,
}: {
  totalSteps: number;
  personalBest: number;
  coinAmount: number;
  onCollect?: () => void;
  coinSpinBoostRef?: RefObject<number>;
  coinScaleBoostRef?: RefObject<number>;
}) {
  return (
    <div
      className="flex w-[327px] flex-col items-center gap-[24px] rounded-[8px] border-2 p-[24px] backdrop-blur-[8px]"
      style={{
        backgroundColor: "var(--app-glass)",
        borderColor: "var(--app-glass-border)",
        color: "var(--app-text-on-dark)",
      }}
    >
      <div className="flex w-full flex-col gap-[8px]">
        <StatRow
          icon={<ShoeIcon className="size-[24px] shrink-0" />}
          label="Total steps"
          value={totalSteps.toLocaleString("en-GB")}
        />
        <StatRow
          icon={<TrophyIcon className="size-[24px] shrink-0" />}
          label="Personal best"
          value={personalBest.toLocaleString("en-GB")}
        />
      </div>
      <CollectButton
        label={`Collect ${coinAmount.toLocaleString("en-GB")} YuCoin`}
        onCollect={onCollect}
        coinSpinBoostRef={coinSpinBoostRef}
        coinScaleBoostRef={coinScaleBoostRef}
      />
    </div>
  );
}
