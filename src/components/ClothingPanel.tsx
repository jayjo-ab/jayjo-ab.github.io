import type { Player } from "../types";
import { cn } from "../utils/cn";
import { Badge } from "./ui";

export interface SwapSelection {
  playerId: string;
  itemId: string;
}

interface Props {
  players: Player[];
  loserIds: string[];
  disabled: boolean;
  swapFrom: SwapSelection | null;
  onToggle: (playerId: string, itemId: string) => void;
  onReplace: (playerId: string, itemId: string) => void;
  onSwapStart: (sel: SwapSelection) => void;
  onSwapComplete: (target: SwapSelection) => void;
  onSwapCancel: () => void;
}

export default function ClothingPanel({
  players,
  loserIds,
  disabled,
  swapFrom,
  onToggle,
  onReplace,
  onSwapStart,
  onSwapComplete,
  onSwapCancel,
}: Props) {
  return (
    <div>
      {swapFrom && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          <span>
            Swapping <strong>{players.find((p) => p.id === swapFrom.playerId)?.clothes.find((c) => c.id === swapFrom.itemId)?.name}</strong> from{" "}
            <strong>{players.find((p) => p.id === swapFrom.playerId)?.name}</strong> – pick an item of another player.
          </span>
          <button type="button" onClick={onSwapCancel} className="ml-3 text-xs underline hover:text-white">
            Cancel
          </button>
        </div>
      )}
      <div className={cn("grid gap-3", players.length <= 3 ? "md:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-5", disabled && "pointer-events-none opacity-50")}>
        {players.map((p) => {
          const worn = p.clothes.filter((c) => !c.removed).length;
          const isLoser = loserIds.includes(p.id);
          return (
            <div key={p.id} className={cn("rounded-xl border p-3", isLoser ? "border-rose-400/40 bg-rose-500/5" : "border-white/10 bg-slate-900/40")}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-semibold", p.sex === "male" ? "text-sky-300" : "text-pink-300")}>{p.name}</span>
                  {isLoser && <Badge className="bg-rose-500/20 text-rose-300">Loser</Badge>}
                </div>
                <span className="text-xs text-slate-400">
                  {worn}/{p.clothes.length} on
                </span>
              </div>
              <ul className="space-y-1">
                {p.clothes.map((c) => {
                  const isSwapSource = swapFrom?.playerId === p.id && swapFrom.itemId === c.id;
                  const isSwapTarget = swapFrom && swapFrom.playerId !== p.id;
                  return (
                    <li
                      key={c.id}
                      className={cn(
                        "group flex items-center gap-2 rounded-lg px-2 py-1 text-sm transition-colors",
                        isSwapSource && "bg-amber-500/20 ring-1 ring-amber-400",
                        isSwapTarget && "cursor-pointer hover:bg-amber-500/20",
                      )}
                      onClick={() => isSwapTarget && onSwapComplete({ playerId: p.id, itemId: c.id })}
                    >
                      <input
                        type="checkbox"
                        checked={c.removed}
                        onChange={() => onToggle(p.id, c.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 accent-rose-500"
                        title={c.removed ? "Put back on" : "Take off"}
                      />
                      <span className={cn("flex-1 truncate", c.removed ? "text-slate-500 line-through" : "text-slate-100")}>{c.name}</span>
                      {!swapFrom && (
                        <span className="flex gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onReplace(p.id, c.id);
                            }}
                            className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-300 hover:bg-white/20 hover:text-white"
                            title="Replace this item with something else"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSwapStart({ playerId: p.id, itemId: c.id });
                            }}
                            className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-300 hover:bg-white/20 hover:text-white"
                            title="Swap this item with another player's item"
                          >
                            Swap
                          </button>
                        </span>
                      )}
                    </li>
                  );
                })}
                {p.clothes.length === 0 && <li className="text-xs italic text-slate-500">Nothing to wear.</li>}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
