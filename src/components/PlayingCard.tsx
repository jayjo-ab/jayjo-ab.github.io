import { cn } from "../utils/cn";
import type { Card } from "../types";
import { isRed, rankLabel } from "../game/cards";

interface Props {
  card?: Card;
  faceDown?: boolean;
  highlight?: "win" | "lose" | null;
  size?: "md" | "lg";
}

export default function PlayingCard({ card, faceDown, highlight, size = "lg" }: Props) {
  const dims = size === "lg" ? "h-36 w-24 sm:h-44 sm:w-30" : "h-20 w-14";
  if (faceDown || !card) {
    return (
      <div
        className={cn(
          dims,
          "rounded-xl border-2 border-white/20 bg-gradient-to-br from-indigo-700 via-violet-800 to-fuchsia-900 shadow-lg",
          "flex items-center justify-center",
        )}
      >
        <div className="h-[80%] w-[80%] rounded-lg border border-white/20 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.08)_0_6px,transparent_6px_12px)]" />
      </div>
    );
  }
  const red = isRed(card);
  return (
    <div
      className={cn(
        dims,
        "relative rounded-xl bg-white shadow-lg transition-all duration-300 animate-[flip_0.4s_ease-out]",
        "border-2",
        highlight === "win" && "border-emerald-400 ring-4 ring-emerald-400/40",
        highlight === "lose" && "border-rose-400 ring-4 ring-rose-400/40",
        !highlight && "border-slate-200",
        red ? "text-rose-600" : "text-slate-900",
      )}
    >
      <div className="absolute left-2 top-1 text-left leading-none">
        <div className={cn("font-bold", size === "lg" ? "text-xl" : "text-sm")}>{rankLabel(card.rank)}</div>
        <div className={size === "lg" ? "text-lg" : "text-xs"}>{card.suit}</div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={size === "lg" ? "text-5xl sm:text-6xl" : "text-2xl"}>{card.suit}</span>
      </div>
      <div className="absolute bottom-1 right-2 rotate-180 text-left leading-none">
        <div className={cn("font-bold", size === "lg" ? "text-xl" : "text-sm")}>{rankLabel(card.rank)}</div>
        <div className={size === "lg" ? "text-lg" : "text-xs"}>{card.suit}</div>
      </div>
    </div>
  );
}
