import type { ReactNode, RefObject } from "react";
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

/** Glass card over the ocean: one activity stat + the collect CTA. */
export default function ActivityCard({
  icon,
  label,
  value,
  coinAmount,
  onCollect,
  onCollectStart,
  onCollectEnd,
  collectDisabled,
  coinSpinBoostRef,
  coinScaleBoostRef,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  coinAmount: number;
  onCollect?: () => void;
  onCollectStart?: () => void;
  onCollectEnd?: () => void;
  /** Blocks the collect button — while a collect is already mid-flight. */
  collectDisabled?: boolean;
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
      <StatRow icon={icon} label={label} value={value} />
      <CollectButton
        label={`Collect ${coinAmount.toLocaleString("en-GB")} YuCoin`}
        onCollect={onCollect}
        onCollectStart={onCollectStart}
        onCollectEnd={onCollectEnd}
        disabled={collectDisabled}
        coinSpinBoostRef={coinSpinBoostRef}
        coinScaleBoostRef={coinScaleBoostRef}
      />
    </div>
  );
}
