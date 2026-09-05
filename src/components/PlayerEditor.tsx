import { useState } from "react";
import type { Player, Sex } from "../types";
import { defaultClothesFor, uid } from "../defaults";
import { Badge, Button, Input, Label } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  player: Player;
  index: number;
  onChange: (p: Player) => void;
}

export default function PlayerEditor({ player, index, onChange }: Props) {
  const [newItem, setNewItem] = useState("");

  const setSex = (sex: Sex) => onChange({ ...player, sex });

  const addItem = () => {
    const name = newItem.trim();
    if (!name) return;
    onChange({ ...player, clothes: [...player.clothes, { id: uid("cl"), name, removed: false }] });
    setNewItem("");
  };

  const renameItem = (id: string, name: string) =>
    onChange({ ...player, clothes: player.clothes.map((c) => (c.id === id ? { ...c, name } : c)) });

  const removeItem = (id: string) => onChange({ ...player, clothes: player.clothes.filter((c) => c.id !== id) });

  const move = (idx: number, dir: -1 | 1) => {
    const arr = [...player.clothes];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    onChange({ ...player, clothes: arr });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
              player.isBot ? "bg-slate-700 text-slate-200" : "bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white",
            )}
          >
            {index + 1}
          </span>
          <Badge className={player.isBot ? "bg-slate-700 text-slate-300" : "bg-fuchsia-500/20 text-fuchsia-300"}>
            {player.isBot ? "Bot" : "You"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Name</Label>
          <Input value={player.name} onChange={(e) => onChange({ ...player, name: e.target.value })} placeholder="Name" />
        </div>
        <div>
          <Label>Sex</Label>
          <div className="flex overflow-hidden rounded-lg border border-white/10">
            {(["male", "female"] as Sex[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSex(s)}
                className={cn(
                  "flex-1 px-3 py-2 text-sm font-medium capitalize transition-colors",
                  player.sex === s
                    ? s === "male"
                      ? "bg-sky-600 text-white"
                      : "bg-pink-600 text-white"
                    : "bg-slate-900/60 text-slate-400 hover:bg-white/10",
                )}
              >
                {s === "male" ? "♂ Male" : "♀ Female"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between">
          <Label className="mb-0">Wearing ({player.clothes.length} items)</Label>
          <button
            type="button"
            className="text-xs text-slate-400 underline-offset-2 hover:text-white hover:underline"
            onClick={() => onChange({ ...player, clothes: defaultClothesFor(player.sex) })}
          >
            Reset outfit
          </button>
        </div>
        <ul className="space-y-1.5">
          {player.clothes.map((c, i) => (
            <li key={c.id} className="flex items-center gap-1.5">
              <span className="w-5 text-center text-xs text-slate-500">{i + 1}.</span>
              <Input value={c.name} onChange={(e) => renameItem(c.id, e.target.value)} className="py-1.5" />
              <button type="button" onClick={() => move(i, -1)} className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-white" title="Move up">
                ↑
              </button>
              <button type="button" onClick={() => move(i, 1)} className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-white" title="Move down">
                ↓
              </button>
              <button type="button" onClick={() => removeItem(c.id)} className="rounded p-1 text-rose-400 hover:bg-rose-500/20" title="Delete">
                ✕
              </button>
            </li>
          ))}
          {player.clothes.length === 0 && <li className="text-xs italic text-slate-500">No clothing items – add some below.</li>}
        </ul>
        <div className="mt-2 flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Add clothing item…"
            className="py-1.5"
          />
          <Button variant="secondary" size="sm" onClick={addItem}>
            + Add
          </Button>
        </div>
      </div>
    </div>
  );
}
